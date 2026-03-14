import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { withOllamaSlot } from '@/lib/ollama-concurrency';
import { transformCalculatorCodeForSandpack } from '@/lib/calculator-code-transform';

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

    const prompt = `You are a senior React/TypeScript developer. Generate a complete calculator component for Calculinohub.

PAGE TITLE: ${displayTitle}

HOW TO USE THE CALCULATOR (from page content):
${howToUse || '(No specific instructions — infer inputs and logic from the title.)'}

REQUIREMENTS (follow exactly):
1. Component name: ${componentName}
2. Namespace for labels: calculators.${ns} — use t('key') for all user-facing strings
3. Use split-view layout: split-view-container, input-section, result-section, input-card, number-input
4. Use CSS classes: btn btn-primary, btn btn-secondary, number-input, result-value-box, result-item, result-label, result-value
5. Add onKeyDown={(e) => e.key === 'Enter' && handleCalculate()} to every input so Enter triggers calculation
6. Placeholder values: add realistic example values in placeholder attributes (e.g. "5 mg", "200 mcg/mL") based on the How to Use section
7. Use EXACTLY these imports (named imports, single line each):
   import { useState } from 'react';
   import { useTranslations } from 'next-intl';
   import { useScrollToResult } from '@/hooks/useScrollToResult';
   import { CopyButton } from '@/components/CopyButton';
8. Export the component as default: export default ${componentName};
9. Add 'use client'; at top
10. Use t('calculate'), t('reset'), t('result'), t('resultPlaceholder') and other keys as needed — extract keys from the How to Use steps
11. Include the full calculation logic based on the description; handle unit conversions if mentioned (mcg, mg, g, mL, etc.)
12. Output ONLY the raw TSX/JS code, no markdown fences, no explanation`

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

    return NextResponse.json({ code, componentName });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to generate calculator code';
    console.error('[generate-calculator-code]', msg, error);
    const status = isRetryableError(msg) ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
