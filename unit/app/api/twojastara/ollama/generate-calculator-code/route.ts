import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { withOllamaSlot } from '@/lib/ollama-concurrency';
import { transformCalculatorCodeForSandpack } from '@/lib/calculator-code-transform';
import { extractCalculatorLabelKeys } from '@/lib/extract-calculator-label-keys';

const MODEL = process.env.OLLAMA_MODEL || 'glm-4.6:cloud';
const OLLAMA_TIMEOUT_MS = 172_800_000;

const SLOT_RETRY_DELAY_MS = 30_000;
const SLOT_RETRY_MAX = 5;

function isRetryableError(err: string): boolean {
  const s = err.toLowerCase();
  return s.includes('concurrent request slot') || s.includes('no slots available') || s.includes('llm busy') || s.includes('upstream request timeout') || s.includes('429') || s.includes('too many requests') || s.includes('econnreset') || s.includes('connection reset') || s.includes('etimedout');
}

async function ollamaChat(messages: { role: string; content: string }[], modelOverride?: string) {
  const model = modelOverride?.trim() || MODEL;
  const apiKey = process.env.OLLAMA_API_KEY;
  if (!apiKey) throw new Error('OLLAMA_API_KEY environment variable is not set');

  for (let attempt = 0; attempt <= SLOT_RETRY_MAX; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);
    try {
      const res = await fetch('https://ollama.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, stream: false }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const errText = await res.text();
        let errMsg = errText;
        try {
          const errObj = JSON.parse(errText) as { error?: string };
          errMsg = errObj?.error ?? errText;
        } catch {}
        if (isRetryableError(errMsg) && attempt < SLOT_RETRY_MAX) {
          await new Promise((r) => setTimeout(r, res.status === 429 ? 60_000 : SLOT_RETRY_DELAY_MS));
          continue;
        }
        throw new Error(errMsg);
      }
      const data = (await res.json()) as { message?: { content?: string } };
      return data?.message?.content ?? '';
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof Error && isRetryableError(e.message) && attempt < SLOT_RETRY_MAX) {
        await new Promise((r) => setTimeout(r, SLOT_RETRY_DELAY_MS));
        continue;
      }
      throw e;
    }
  }
  throw new Error('Ollama slot error — try again.');
}

/** Extract "## How to Use the Calculator" section from markdown content */
function extractHowToUse(content: string): string {
  if (!content?.trim()) return '';
  const match = content.match(/##\s*How\s+to\s+Use\s+the\s+Calculator\s*[\r\n]+([\s\S]*?)(?=\n##\s|$)/i);
  return match ? match[1].trim() : content.slice(0, 3000);
}

/** Convert display title to component name (PascalCase) */
function toComponentName(title: string): string {
  const cleaned = title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('') + 'Calculator';
}

/** Convert display title to namespace for useTranslations */
function toNamespace(slug: string): string {
  return slug.replace(/[^a-zA-Z0-9]/g, '') || 'calc';
}

/** Normalize imports to canonical form (transform-compatible). Fixes LLM output variations. */
function normalizeImports(code: string): string {
  let out = code;
  // CopyButton - force canonical named import
  out = out.replace(
    /import\s+(?:\{\s*CopyButton\s*\}|\w+\s+as\s+CopyButton|CopyButton)\s+from\s*['"`][^'"`]+['"`]\s*;?\s*/g,
    "import { CopyButton } from '@/components/CopyButton';\n"
  );
  // useScrollToResult
  out = out.replace(
    /import\s+(?:\{\s*useScrollToResult\s*\}|\w+\s+as\s+useScrollToResult|useScrollToResult)\s+from\s*['"`][^'"`]+['"`]\s*;?\s*/g,
    "import { useScrollToResult } from '@/hooks/useScrollToResult';\n"
  );
  // useTranslations from next-intl
  out = out.replace(
    /import\s+(?:\{\s*useTranslations\s*\}|\w+\s+as\s+useTranslations|useTranslations)\s+from\s*['"`]next-intl['"`]\s*;?\s*/g,
    "import { useTranslations } from 'next-intl';\n"
  );
  return out;
}

/** Humanize label key to readable English, e.g. resultPlaceholder -> Enter values and click Calculate */
const LABEL_DEFAULTS: Record<string, string> = {
  calculate: 'Calculate',
  reset: 'Reset',
  result: 'Result',
  resultPlaceholder: 'Enter values and click Calculate',
  resultFraction: 'Result (fraction)',
  resultDecimal: 'Result (decimal)',
  title: 'Expression / Input',
  expression: 'Expression',
};

function humanizeLabelKey(key: string): string {
  if (LABEL_DEFAULTS[key]) return LABEL_DEFAULTS[key];
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/** Extract keys from code and build EN labels (humanized). */
function buildEnLabelsFromCode(code: string): Record<string, string> {
  const keys = extractCalculatorLabelKeys(code);
  const labels: Record<string, string> = {};
  for (const k of keys) {
    labels[k] = humanizeLabelKey(k);
  }
  return labels;
}

/** Validate code transforms cleanly for Sandpack. Returns transformed code or throws. */
function validateForSandpack(code: string): { transformed: string; valid: boolean } {
  const normalized = normalizeImports(code);
  const transformed = transformCalculatorCodeForSandpack(normalized);
  const badImports = transformed.match(/import\s+.*from\s+['"`]@\/|from\s+['"`]next-intl['"`]/g);
  if (badImports?.length) {
    throw new Error(`Sandpack transform left unresolved imports: ${badImports.join(', ')}`);
  }
  return { transformed: normalized, valid: true };
}

/**
 * POST /api/twojastara/ollama/generate-calculator-code
 * Body: { pageId, title, slug, content, model? }
 * Generates calculator TSX code from page title + "How to Use the Calculator" section.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pageId, title, slug, content, model: modelOverride } = body;
    const displayTitle = typeof title === 'string' ? title.trim() : '';
    const pageSlug = typeof slug === 'string' ? slug.trim().toLowerCase().replace(/\s+/g, '-') : 'calc';
    const pageContent = typeof content === 'string' ? content : '';

    if (!displayTitle) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const howToUse = extractHowToUse(pageContent);
    const componentName = toComponentName(displayTitle);
    const ns = toNamespace(pageSlug);

    const prompt = `You are a senior React/TypeScript developer. Generate a complete calculator component for Calculinohub. The styling and layout MUST match the reference below exactly.

PAGE TITLE: ${displayTitle}

HOW TO USE THE CALCULATOR (from page content):
${howToUse || '(No specific instructions — infer inputs and logic from the title.)'}

LAYOUT AND STYLING (follow this structure exactly — these CSS classes and structure produce correct styling):
\`\`\`
<div className="split-view-container">
  <div className="input-section" style={{ marginBottom: 0 }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="input-card">
        <label htmlFor="input1" className="input-label">{t('inputLabel')}</label>
        <input id="input1" type="text" value={value} onChange={...} onKeyDown={(e) => e.key === 'Enter' && handleCalculate()} className="number-input" placeholder="e.g. 5" />
      </div>
      <div className="action-buttons" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
        <button onClick={handleCalculate} className="btn btn-primary" style={{ minHeight: '44px', minWidth: '44px' }}>{t('calculate')}</button>
        <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>{t('reset')}</button>
      </div>
    </div>
  </div>
  <div ref={resultRef} className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
    <div className="input-card">
      <label className="input-label">{t('result')}</label>
      {!result && (
        <div className="number-input" style={{ minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
          <span style={{ color: 'var(--text-secondary)' }}>{t('resultPlaceholder') || 'Enter values and click Calculate'}</span>
        </div>
      )}
      {result && (
        <div className="number-input" style={{ minHeight: '220px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="result-item">
            <div className="result-label">{t('resultLabel')}</div>
            <div className="number-input result-value-box">
              <span className="result-value">{displayValue}</span>
              <CopyButton text={copyText} />
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
\`\`\`

REQUIREMENTS (follow exactly):
1. Component name: ${componentName}
2. Namespace: calculators.${ns} — use t('key') for all strings
3. Use the EXACT structure above: split-view-container, input-section, result-section, input-card, input-label, number-input
4. Result area: use number-input for the empty state container (minHeight 220px) and for the filled results box. Each output row: result-item > result-label + (number-input result-value-box containing span.result-value + CopyButton). For multiple outputs (e.g. fraction + decimal), repeat result-item for each.
5. Buttons: btn btn-primary (Calculate), btn btn-secondary (Reset), with style={{ minHeight: '44px', minWidth: '44px' }}
6. Add onKeyDown={(e) => e.key === 'Enter' && handleCalculate()} to every input
7. Placeholder: realistic example values based on How to Use (e.g. "5 mg", "200 mcg/mL")
8. Imports (exactly):
   import { useState } from 'react';
   import { useTranslations } from 'next-intl';
   import { useScrollToResult } from '@/hooks/useScrollToResult';
   import { CopyButton } from '@/components/CopyButton';
9. Add 'use client'; at top. Export default ${componentName};
10. Use resultRef = useScrollToResult(resultOrMainState) for the result section div
11. Include full calculation logic. Handle unit conversions (mcg, mg, g, mL) if mentioned.
12. Output ONLY raw TSX code, no markdown fences, no explanation.`

    const useModel = typeof modelOverride === 'string' && modelOverride.trim() ? modelOverride.trim() : undefined;
    const raw = await withOllamaSlot(() => ollamaChat([{ role: 'user', content: prompt }], useModel));

    if (!raw?.trim()) {
      throw new Error('Empty response from Ollama');
    }

    // Strip markdown code blocks if present
    let code = raw.trim();
    const fenceMatch = code.match(/^```(?:tsx?|jsx?|javascript|typescript)?\s*\n?([\s\S]*?)```$/m);
    if (fenceMatch) {
      code = fenceMatch[1].trim();
    }

    // Ensure 'use client' at top
    if (!code.startsWith("'use client'") && !code.startsWith('"use client"')) {
      code = "'use client';\n\n" + code;
    }

    // Normalize imports and validate transform works before returning
    try {
      const { transformed } = validateForSandpack(code);
      code = transformed;
    } catch (validateErr) {
      const msg = validateErr instanceof Error ? validateErr.message : 'Code validation failed';
      console.error('[generate-calculator-code] validation:', msg);
      return NextResponse.json(
        { error: `Generated code has import issues. ${msg} Try generating again.` },
        { status: 422 }
      );
    }

    const labels = buildEnLabelsFromCode(code);
    return NextResponse.json({ code, componentName, labels });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to generate calculator code';
    console.error('[generate-calculator-code]', msg, error);
    const status = isRetryableError(msg) ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
