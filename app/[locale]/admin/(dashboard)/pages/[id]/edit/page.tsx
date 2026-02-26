'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ADMIN_LOCALES, getLocaleMeta, LOCALE_NAMES } from '@/lib/admin-locales';
import { getDefaultCalculatorLabels } from '@/lib/calculator-default-labels';
import { extractCalculatorLabelKeys } from '@/lib/extract-calculator-label-keys';

const CalculatorSandpackClient = dynamic(
  () => import('@/components/CalculatorSandpackClient').then((m) => ({ default: m.CalculatorSandpackClient })),
  { ssr: false }
);

const PAGE_CATEGORIES = [
  { value: '', label: '— Select category —' },
  { value: 'math', label: 'Math' },
  { value: 'electric', label: 'Electric' },
  { value: 'biology', label: 'Biology' },
  { value: 'conversion', label: 'Conversion' },
  { value: 'physics', label: 'Physics' },
  { value: 'real-life', label: 'Real Life' },
  { value: 'finance', label: 'Finance' },
  { value: 'others', label: 'Others' },
  { value: 'health', label: 'Health' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'construction', label: 'Construction' },
  { value: 'ecology', label: 'Ecology' },
  { value: 'food', label: 'Food' },
  { value: 'statistics', label: 'Statistics' },
  { value: 'info', label: 'Info' },
  { value: 'blog', label: 'Blog' },
];

type RelatedItem = { title: string; description: string; path: string };
type FaqItem = { question: string; answer: string };
type TranslationForm = {
  locale: string;
  title: string;
  displayTitle: string;
  description: string;
  content: string;
  relatedCalculators: RelatedItem[];
  faqItems: FaqItem[];
  calculatorLabels: Record<string, string>;
};

function parseCalculatorLabels(val: unknown): Record<string, string> {
  if (!val) return {};
  if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(val)) {
      if (typeof k === 'string' && typeof v === 'string') out[k] = v;
    }
    return out;
  }
  if (typeof val === 'string') {
    try {
      return parseCalculatorLabels(JSON.parse(val));
    } catch {
      return {};
    }
  }
  return {};
}

/** Parse labels JSON: supports flat { key: val } or nested { calculators: { calcId: { key: val } } } */
function parseLabelsFromUpload(jsonStr: string, pageSlug: string): Record<string, string> {
  try {
    const data = JSON.parse(jsonStr) as Record<string, unknown>;
    if (!data || typeof data !== 'object') return {};

    // Nested format: { calculators: { fractionsComparing: { labelA: "val", ... } } }
    if (data.calculators && typeof data.calculators === 'object' && !Array.isArray(data.calculators)) {
      const calcs = data.calculators as Record<string, Record<string, unknown>>;
      const keys = Object.keys(calcs);
      if (keys.length === 0) return {};

      // Build camelCase variants from slug for matching (e.g. "comparing-fractions" → ["comparingFractions", "fractionsComparing"])
      const slugParts = pageSlug.split('-').filter(Boolean);
      const candidates = [
        slugParts.map((p, i) => (i === 0 ? p : p[0]?.toUpperCase() + p.slice(1))).join(''),
        [...slugParts].reverse().map((p, i) => (i === 0 ? p : p[0]?.toUpperCase() + p.slice(1))).join(''),
        pageSlug.replace(/-/g, '_'),
        pageSlug.replace(/-/g, ''),
      ].filter(Boolean);

      let chosen = keys.find((k) => candidates.includes(k) || k.toLowerCase() === pageSlug.replace(/-/g, '').toLowerCase());
      if (!chosen && keys.length === 1) chosen = keys[0];
      if (!chosen) chosen = keys[0];

      const inner = calcs[chosen];
      if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(inner)) {
          if (typeof k === 'string' && typeof v === 'string') out[k] = v;
        }
        return out;
      }
      return {};
    }

    // Flat format: { labelA: "val", labelB: "val2" }
    return parseCalculatorLabels(data);
  } catch {
    return {};
  }
}

type CalculatorOption = { value: string; label: string; title?: string; description?: string };

const ADDING_FRACTIONS_EXAMPLE = `'use client';

/*
 * CALCULATOR CODE — Admin-created calculators run in Sandpack with these rules:
 * - Import from next-intl, @/hooks/useScrollToResult, @/components/CopyButton (replaced by stubs in preview)
 * - Use t('key') for labels; keys (e.g. resultFraction, resultDecimal) map to Calculator labels below
 * - Add/override keys in Calculator labels [locale] — custom labels override defaults, empty falls back to English
 * - Export one component as default; supports split-view layout, number-input, btn btn-primary/secondary
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

type Fraction = {
  numerator: number;
  denominator: number;
};

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function addFractions(a: Fraction, b: Fraction): Fraction {
  const numerator = a.numerator * b.denominator + b.numerator * a.denominator;
  const denominator = a.denominator * b.denominator;
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

export function AddingFractionsCalculator() {
  const t = useTranslations('calculators.addingFractions');
  const [expression, setExpression] = useState<string>('');
  const [resultFraction, setResultFraction] = useState<Fraction | null>(null);
  const [resultDecimal, setResultDecimal] = useState<number | null>(null);
  const resultRef = useScrollToResult(resultFraction);

  function parseTerm(term: string): Fraction | null {
    const trimmed = term.trim();
    if (!trimmed) return null;
    const intMatch = trimmed.match(/^([+-])?\\s*(\\d+)\\s*$/);
    if (intMatch) {
      const sign = intMatch[1] === '-' ? -1 : 1;
      const whole = parseInt(intMatch[2], 10);
      return { numerator: sign * whole, denominator: 1 };
    }
    const fracMatch = trimmed.match(/^([+-])?\\s*(?:(\\d+)\\s+)?(\\d+)\\s*\\/\\s*(\\d+)\\s*$/);
    if (!fracMatch) return null;
    const sign = fracMatch[1] === '-' ? -1 : 1;
    const wholePart = fracMatch[2] ? parseInt(fracMatch[2], 10) : 0;
    const numPart = parseInt(fracMatch[3], 10);
    const denPart = parseInt(fracMatch[4], 10);
    if (!denPart) return null;
    const improperNumerator = wholePart * denPart + numPart;
    return { numerator: sign * improperNumerator, denominator: denPart };
  }

  const handleCalculate = () => {
    const parts = expression.split('+');
    if (parts.length < 2) {
      setResultFraction(null);
      setResultDecimal(null);
      return;
    }
    const fractions: Fraction[] = [];
    for (const part of parts) {
      const parsed = parseTerm(part);
      if (!parsed) {
        setResultFraction(null);
        setResultDecimal(null);
        return;
      }
      fractions.push(parsed);
    }
    let sum = fractions[0];
    for (let i = 1; i < fractions.length; i++) {
      sum = addFractions(sum, fractions[i]);
    }
    setResultFraction(sum);
    setResultDecimal(sum.numerator / sum.denominator);
  };

  const handleReset = () => {
    setExpression('');
    setResultFraction(null);
    setResultDecimal(null);
  };

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="expression" className="input-label">{t('title')}</label>
              <input
                id="expression"
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="1/2 + 1/3"
              />
            </div>
            <div className="action-buttons" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleCalculate} className="btn btn-primary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('calculate')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>
        <div ref={resultRef} className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card">
            <label className="input-label">{t('result')}</label>
            {!resultFraction && (
              <div className="number-input" style={{ minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t('resultPlaceholder') || 'Enter an expression and click Calculate'}</span>
              </div>
            )}
            {resultFraction && (
              <div className="number-input" style={{ minHeight: '220px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="result-item">
                  <div className="result-label">{t('resultFraction')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value">{resultFraction.numerator}/{resultFraction.denominator}</span>
                    <CopyButton text={\`\${resultFraction.numerator}/\${resultFraction.denominator}\`} />
                  </div>
                </div>
                {resultDecimal !== null && (
                  <div className="result-item">
                    <div className="result-label">{t('resultDecimal')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{resultDecimal.toFixed(4)}</span>
                      <CopyButton text={resultDecimal.toFixed(4)} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}`;

export default function AdminEditPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const returnTab = searchParams.get('tab');
  const id = params?.id as string;
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [published, setPublished] = useState(false);
  const [relatedCalculatorsMode, setRelatedCalculatorsMode] = useState<'manual' | 'random' | 'both'>('manual');
  const [relatedCalculatorsCount, setRelatedCalculatorsCount] = useState(6);
  const [linkedCalculatorPath, setLinkedCalculatorPath] = useState('');
  const [calculatorCode, setCalculatorCode] = useState('');
  const [calculatorOptions, setCalculatorOptions] = useState<CalculatorOption[]>([]);
  const [activeLocale, setActiveLocale] = useState('en');
  const [translations, setTranslations] = useState<Record<string, TranslationForm>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCalculatorSection, setShowCalculatorSection] = useState(false);
  const [slugExists, setSlugExists] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonImportError, setJsonImportError] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [labelsDraft, setLabelsDraft] = useState<Record<string, string>>({});
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState('');
  const [translating, setTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState<{ current: number; total: number; locale: string } | null>(null);
  const [translateSuccess, setTranslateSuccess] = useState('');
  const [translateStartFrom, setTranslateStartFrom] = useState('');
  const [translateOnlyOne, setTranslateOnlyOne] = useState(false);
  const [translatePausedAt, setTranslatePausedAt] = useState<{ nextLocale: string; doneCount: number } | null>(null);
  const translateAbortRef = useRef<AbortController | null>(null);
  const [translatePauseCountdown, setTranslatePauseCountdown] = useState<number | null>(null);
  const [translateLabelsLoading, setTranslateLabelsLoading] = useState(false);
  const [autoResumeOnError, setAutoResumeOnError] = useState(true);
  const [autoResumeCountdown, setAutoResumeCountdown] = useState<number | null>(null);
  const autoResumeOnErrorRef = useRef(autoResumeOnError);
  autoResumeOnErrorRef.current = autoResumeOnError;

  const t = translations[activeLocale] ?? { locale: activeLocale, title: '', displayTitle: '', description: '', content: '', relatedCalculators: [], faqItems: [], calculatorLabels: {} };

  function handleJsonImport() {
    setJsonImportError('');
    try {
      const data = JSON.parse(jsonInput);
      if (data.slug) setSlug(String(data.slug).trim().toLowerCase().replace(/\s+/g, '-'));
      if (data.category) setCategory(String(data.category).trim().toLowerCase());
      if (typeof data.published === 'boolean') setPublished(data.published);
      if (['manual', 'random', 'both'].includes(data.relatedCalculatorsMode)) setRelatedCalculatorsMode(data.relatedCalculatorsMode);
      if (typeof data.relatedCalculatorsCount === 'number' && data.relatedCalculatorsCount >= 1 && data.relatedCalculatorsCount <= 12) setRelatedCalculatorsCount(data.relatedCalculatorsCount);
      if (data.translations) {
        const trans: Record<string, TranslationForm> = {};
        const tr = data.translations;
        if (Array.isArray(tr)) {
          for (const item of tr) {
            if (item.locale) {
              trans[item.locale] = {
                locale: item.locale,
                title: String(item.title ?? ''),
                displayTitle: String(item.displayTitle ?? item.title ?? ''),
                description: String(item.description ?? ''),
                content: String(item.content ?? ''),
                relatedCalculators: Array.isArray(item.relatedCalculators) ? item.relatedCalculators : [],
                faqItems: Array.isArray(item.faqItems) ? item.faqItems : [],
                calculatorLabels: parseCalculatorLabels(item.calculatorLabels),
              };
            }
          }
        } else if (typeof tr === 'object') {
          for (const [loc, item] of Object.entries(tr)) {
            if (loc.startsWith('_')) continue; // skip _meta and similar
            const v = item as Record<string, unknown>;
            trans[loc] = {
              locale: loc,
              title: String(v?.title ?? ''),
              displayTitle: String(v?.displayTitle ?? v?.title ?? ''),
              description: String(v?.description ?? ''),
              content: String(v?.content ?? ''),
              relatedCalculators: Array.isArray(v?.relatedCalculators) ? v.relatedCalculators as RelatedItem[] : [],
              faqItems: Array.isArray(v?.faqItems) ? v.faqItems as FaqItem[] : [],
              calculatorLabels: parseCalculatorLabels(v?.calculatorLabels),
            };
          }
        }
        if (Object.keys(trans).length > 0) {
          setTranslations((prev) => {
            const next = { ...prev };
            for (const [loc, form] of Object.entries(trans)) {
              next[loc] = { ...(prev[loc] ?? { locale: loc, title: '', displayTitle: '', description: '', content: '', relatedCalculators: [], faqItems: [], calculatorLabels: {} }), ...form };
            }
            return next;
          });
          setLabelsDraft({});
        }
      }
      setJsonImportError('');
      setShowJsonImport(false);
      setJsonInput('');
    } catch (err) {
      setJsonImportError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  }

  function handleJsonFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setJsonInput(String(reader.result));
      setJsonImportError('');
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function handleTranslateLabels() {
    if (activeLocale === 'en') return;
    const enLabels = translations.en?.calculatorLabels ?? {};
    const hasValues = Object.values(enLabels).some((v) => v?.trim());
    if (!hasValues) {
      setError('Fill Calculator labels [en] first, then switch to another language and click Translate Labels');
      return;
    }
    setTranslateLabelsLoading(true);
    setError('');
    try {
      let res: Response;
      for (let attempt = 0; attempt <= 2; attempt++) {
        res = await fetch('/api/twojastara/ollama/translate-labels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ labels: enLabels, targetLocale: activeLocale }),
          credentials: 'include',
        });
        if (res.ok || attempt >= 2) break;
        await new Promise((r) => setTimeout(r, 2000));
      }
      const data = await res!.json();
      if (!res.ok) throw new Error(data.error || 'Translate labels failed');
      updateTranslation(activeLocale, 'calculatorLabels', data.labels ?? {});
      setTranslateSuccess(`Labels translated to ${LOCALE_NAMES[activeLocale] ?? activeLocale}`);
      setTimeout(() => setTranslateSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translate labels failed');
    } finally {
      setTranslateLabelsLoading(false);
    }
  }

  async function handleGeneratePost(provider: 'ollama' | 'claude' = 'ollama') {
    const topic = (translations.en?.displayTitle || translations.en?.title || slug || 'calculator').trim();
    if (!topic) {
      setError('Ustaw tytuł (displayTitle) dla en lub slug, aby wygenerować post');
      return;
    }
    setGenerateLoading(true);
    setError('');
    setGenerateSuccess('');
    const url = provider === 'claude' ? '/api/twojastara/claude/generate-post' : '/api/twojastara/ollama/generate-post';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
        credentials: 'include',
      });
      let data: { error?: string; content?: string; faqItems?: unknown[] };
      try {
        data = await res.json();
      } catch {
        throw new Error(res.status === 401 ? 'Unauthorized — zaloguj się ponownie' : `Błąd serwera (${res.status}). Spróbuj ponownie.`);
      }
      if (!res.ok) throw new Error(data.error || `Błąd generowania (${res.status})`);
      updateTranslation('en', 'content', data.content ?? '');
      if (Array.isArray(data.faqItems) && data.faqItems.length > 0) {
        updateTranslation('en', 'faqItems', data.faqItems as FaqItem[]);
      }
      setGenerateSuccess('Treść wygenerowana pomyślnie.');
      setTimeout(() => setGenerateSuccess(''), 5000);
    } catch (err) {
      const msg = err instanceof Error
        ? (err.name === 'AbortError' ? 'Timeout — limit 90 min.' : err.message)
        : 'Błąd generowania';
      setError(`${msg} — Kliknij Generate Content ponownie, aby spróbować od początku.`);
      if (autoResumeOnErrorRef.current) {
        const delaySec = 5;
        setAutoResumeCountdown(delaySec);
        for (let s = delaySec; s >= 1; s--) {
          setAutoResumeCountdown(s);
          await new Promise((r) => setTimeout(r, 1000));
        }
        setAutoResumeCountdown(null);
        setError('');
        return handleGeneratePost(provider);
      }
    } finally {
      setGenerateLoading(false);
    }
  }

  async function fetchWithTimeoutAndRetry(
    url: string,
    options: RequestInit,
    timeoutMs = 5_400_000,
    retries = 2,
    externalSignal?: AbortSignal | null
  ): Promise<Response> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const externalAbort = () => {
        clearTimeout(id);
        controller.abort();
      };
      externalSignal?.addEventListener('abort', externalAbort);
      try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        externalSignal?.removeEventListener('abort', externalAbort);
        return res;
      } catch (e) {
        clearTimeout(id);
        externalSignal?.removeEventListener('abort', externalAbort);
        if (attempt < retries) await new Promise((r) => setTimeout(r, 2000));
        else throw e;
      }
    }
    throw new Error('Fetch failed');
  }

  async function handleTranslateToOtherLocales(forceAll = false, onlyOne = false) {
    const enContent = translations.en?.content?.trim();
    if (!enContent) {
      setError('Wypełnij Content [en] przed tłumaczeniem');
      return;
    }
    const enFaqItems = translations.en?.faqItems ?? [];
    const enTitle = (translations.en?.title ?? '').trim();
    const enDisplayTitle = (translations.en?.displayTitle ?? '').trim();
    const enDescription = (translations.en?.description ?? '').trim();
    const targetLocales = forceAll
      ? ADMIN_LOCALES.filter((l) => l !== 'en')
      : ADMIN_LOCALES.filter((l) => l !== 'en' && !(translations[l]?.content?.trim() ?? ''));
    if (targetLocales.length === 0 && !forceAll) {
      setError('Wszystkie języki są już przetłumaczone.');
      return;
    }
    const effectiveStart = translateStartFrom && (targetLocales?.includes?.(translateStartFrom) ?? false)
      ? translateStartFrom
      : targetLocales?.[0];
    if (!effectiveStart || !targetLocales?.length) return;
    const arr = Array.isArray(targetLocales) ? targetLocales : [];
    const idx = (arr ?? []).indexOf(effectiveStart);
    const localesToTranslate = onlyOne
      ? [effectiveStart]
      : arr.slice(idx >= 0 ? idx : 0);
    if (localesToTranslate.length === 0) return;
    setTranslating(true);
    setError('');
    setTranslateSuccess('');
    setTranslatePausedAt(null);
    translateAbortRef.current = new AbortController();
    setTranslateProgress({ current: 0, total: localesToTranslate.length, locale: '' });
    let lastIndex = 0;
    try {
      let currentTranslations = { ...translations };
      for (let i = 0; i < localesToTranslate.length; i++) {
        lastIndex = i;
        const loc = localesToTranslate[i];
        setTranslateProgress({ current: i + 1, total: localesToTranslate.length, locale: loc });
        const res = await fetchWithTimeoutAndRetry(
          '/api/twojastara/ollama/translate',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: enContent, faqItems: enFaqItems, targetLocale: loc, title: enTitle || undefined, displayTitle: enDisplayTitle || undefined, description: enDescription || undefined }),
            credentials: 'include',
          },
          5_400_000,
          2,
          translateAbortRef.current?.signal ?? null
        );
        let data: { error?: string; content?: string; title?: string; displayTitle?: string; description?: string; faqItems?: unknown[] };
        try {
          data = await res.json();
        } catch {
          throw new Error(res.status === 401 ? 'Unauthorized — zaloguj się ponownie' : `Błąd serwera (${res.status})`);
        }
        if (!res.ok) throw new Error(data.error || `Failed to translate to ${loc}`);
        const base = currentTranslations[loc] ?? { locale: loc, title: '', displayTitle: '', description: '', content: '', relatedCalculators: [], faqItems: [], calculatorLabels: {} };
        currentTranslations = {
          ...currentTranslations,
          [loc]: {
            ...base,
            content: data.content ?? base.content,
            title: data.title ?? base.title,
            displayTitle: data.displayTitle ?? base.displayTitle,
            description: data.description ?? base.description ?? '',
            faqItems: Array.isArray(data.faqItems) && data.faqItems.length > 0 ? (data.faqItems as FaqItem[]) : base.faqItems,
          },
        };
        setTranslations(currentTranslations);
        await savePageWithTranslations(currentTranslations);

        if (i < localesToTranslate.length - 1) {
          setTranslatePauseCountdown(5);
          for (let s = 5; s >= 1; s--) {
            setTranslatePauseCountdown(s);
            await new Promise((r) => setTimeout(r, 1000));
          }
          setTranslatePauseCountdown(null);
        }
      }
      setActiveLocale(localesToTranslate[localesToTranslate.length - 1] ?? activeLocale);
      setTranslateSuccess(`Przetłumaczono na ${localesToTranslate.length} języków. Zapisano automatycznie.`);
      setTimeout(() => setTranslateSuccess(''), 6000);
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      const msg = err instanceof Error
        ? (isAbort ? 'Wstrzymano przez użytkownika.' : err.message)
        : 'Błąd tłumaczenia';
      const nextLocale = localesToTranslate[lastIndex] ?? localesToTranslate[0];
      setTranslatePausedAt({ nextLocale, doneCount: lastIndex });
      setTranslateStartFrom(nextLocale);
      setError(`Zatrzymano na języku (${nextLocale}). ${msg} — Kliknij Resume: ten język zostanie przetłumaczony od nowa.`);
      if (autoResumeOnErrorRef.current && !isAbort) {
        const delaySec = 5;
        setAutoResumeCountdown(delaySec);
        for (let s = delaySec; s >= 1; s--) {
          setAutoResumeCountdown(s);
          await new Promise((r) => setTimeout(r, 1000));
        }
        setAutoResumeCountdown(null);
        setError('');
        return handleTranslateToOtherLocales(forceAll, onlyOne);
      }
    } finally {
      setTranslating(false);
      setTranslateProgress(null);
      setTranslatePauseCountdown(null);
      translateAbortRef.current = null;
    }
  }

  function handlePauseTranslate() {
    translateAbortRef.current?.abort();
  }

  function exportEmptyTemplate() {
    const template = {
      slug: 'my-calculator',
      category: 'math',
      published: false,
      relatedCalculatorsMode: 'manual',
      relatedCalculatorsCount: 6,
      _meta: {
        localeCodes: getLocaleMeta(),
        note: 'BCP 47 / ISO 639-1 codes. _meta is documentation only, omitted on import.',
      },
      translations: Object.fromEntries(
        ADMIN_LOCALES.map((l) => [
          l,
          {
            title: '',
            displayTitle: '',
            description: '',
            content: '',
            relatedCalculators: [] as RelatedItem[],
            faqItems: [] as FaqItem[],
            calculatorLabels: {} as Record<string, string>,
          },
        ])
      ),
    };
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page-template.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCurrentData() {
    const data = {
      slug: slug || 'my-calculator',
      category: category || 'math',
      published,
      relatedCalculatorsMode,
      relatedCalculatorsCount,
      _meta: { localeCodes: getLocaleMeta(), note: 'Documentation only.' },
      translations: Object.fromEntries(
        ADMIN_LOCALES.filter((l) => translations[l]).map((l) => {
          const v = translations[l];
          return [
            l,
            {
              title: v.title,
              displayTitle: v.displayTitle ?? '',
              description: v.description,
              content: v.content,
              relatedCalculators: v.relatedCalculators ?? [],
              faqItems: v.faqItems ?? [],
              calculatorLabels: v.calculatorLabels ?? {},
            },
          ];
        })
      ),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-${slug || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    const cat = category.trim().toLowerCase();
    const sl = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (!cat || !sl || !id) {
      setSlugExists(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSlugChecking(true);
      try {
        const res = await fetch(
          `/api/twojastara/pages/check-slug?category=${encodeURIComponent(cat)}&slug=${encodeURIComponent(sl)}&excludeId=${encodeURIComponent(id)}`
        );
        const data = await res.json();
        setSlugExists(data.exists ?? false);
      } catch {
        setSlugExists(false);
      } finally {
        setSlugChecking(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [category, slug, id]);

  useEffect(() => {
    fetch('/api/twojastara/calculators')
      .then((res) => res.json())
      .then((data) => setCalculatorOptions([{ value: '', label: '— No link (or add custom code below) —', title: '', description: '' }, ...data]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/twojastara/pages/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setSlug(data.slug ?? '');
        setCategory(data.category ?? '');
        setPublished(data.published ?? false);
        setRelatedCalculatorsMode(['manual', 'random', 'both'].includes(data.relatedCalculatorsMode) ? data.relatedCalculatorsMode : 'manual');
        setRelatedCalculatorsCount(typeof data.relatedCalculatorsCount === 'number' && data.relatedCalculatorsCount >= 1 && data.relatedCalculatorsCount <= 12 ? data.relatedCalculatorsCount : 6);
        setLinkedCalculatorPath(data.linkedCalculatorPath ?? '');
        setCalculatorCode(data.calculatorCode ?? '');
        setShowCalculatorSection(!!(data.calculatorCode || data.linkedCalculatorPath));
        const trans: Record<string, TranslationForm> = {};
        for (const loc of ADMIN_LOCALES) {
          const tr = data.translations?.find((x: { locale: string }) => x.locale === loc);
          let related: RelatedItem[] = [];
          let faq: FaqItem[] = [];
          try {
            if (tr?.relatedCalculators) related = typeof tr.relatedCalculators === 'string' ? JSON.parse(tr.relatedCalculators) : tr.relatedCalculators;
          } catch {}
          try {
            if (tr?.faqItems) faq = typeof tr.faqItems === 'string' ? JSON.parse(tr.faqItems) : tr.faqItems;
          } catch {}
          trans[loc] = {
            locale: loc,
            title: tr?.title ?? '',
            displayTitle: tr?.displayTitle ?? tr?.title ?? '',
            description: tr?.description ?? '',
            content: tr?.content ?? '',
            relatedCalculators: Array.isArray(related) ? related : [],
            faqItems: Array.isArray(faq) ? faq : [],
            calculatorLabels: parseCalculatorLabels(tr?.calculatorLabels),
          };
        }
        setTranslations(trans);
      })
      .catch(() => setError('Failed to load page'))
      .finally(() => setLoading(false));
  }, [id]);

  function updateTranslation(locale: string, field: keyof TranslationForm, value: string | RelatedItem[] | FaqItem[] | Record<string, string>) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...(prev[locale] ?? { locale, title: '', displayTitle: '', description: '', content: '', relatedCalculators: [], faqItems: [], calculatorLabels: {} }), [field]: value },
    }));
  }

  async function savePageWithTranslations(trans: Record<string, TranslationForm>): Promise<void> {
    const payload = {
      slug: slug.trim() || undefined,
      category: category.trim() || undefined,
      published,
      relatedCalculatorsMode,
      relatedCalculatorsCount,
      linkedCalculatorPath: linkedCalculatorPath.trim() || null,
      calculatorCode: calculatorCode.trim() || null,
      translations: Object.entries(trans)
        .filter(([, v]) => {
          const hasData = (v.title ?? '').trim() || (v.displayTitle ?? '').trim() || (v.content ?? '').trim();
          return !!hasData;
        })
        .map(([locale, v]) => {
          const enTitle = (trans.en?.title ?? trans.en?.displayTitle ?? '').trim();
          const fallbackTitle = enTitle || 'Untitled';
          const title = (v.title ?? '').trim() || (v.displayTitle ?? '').trim() || fallbackTitle;
          return {
            locale,
            title: title || fallbackTitle,
            displayTitle: (v.displayTitle ?? '').trim() || null,
            description: (v.description ?? '').trim() || null,
            content: (v.content ?? '').trim() || null,
            relatedCalculators: (v.relatedCalculators?.filter((r) => r.title?.trim() && r.path?.trim()) ?? []) as { title: string; description: string; path: string }[],
            faqItems: (v.faqItems?.filter((f) => f.question?.trim() && f.answer?.trim()) ?? []) as { question: string; answer: string }[],
            calculatorLabels: (v.calculatorLabels && Object.keys(v.calculatorLabels).length) ? v.calculatorLabels : null,
          };
        }),
    };
    if (!payload.slug || !payload.category || payload.translations.length === 0) {
      throw new Error('Missing slug, category or translations');
    }
    const res = await fetch(`/api/twojastara/pages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error((errData as { error?: string }).error || 'Failed to save');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        slug: slug.trim() || undefined,
        category: category.trim() || undefined,
        published,
        relatedCalculatorsMode,
        relatedCalculatorsCount,
        linkedCalculatorPath: linkedCalculatorPath.trim() || null,
        calculatorCode: calculatorCode.trim() || null,
        translations: Object.entries(translations)
          .filter(([, v]) => {
            const hasData = (v.title ?? '').trim() || (v.displayTitle ?? '').trim() || (v.content ?? '').trim();
            return !!hasData;
          })
          .map(([locale, v]) => {
            const enTitle = (translations.en?.title ?? translations.en?.displayTitle ?? '').trim();
            const fallbackTitle = enTitle || 'Untitled';
            const title = (v.title ?? '').trim() || (v.displayTitle ?? '').trim() || fallbackTitle;
            return {
              locale,
              title: title || fallbackTitle,
              displayTitle: (v.displayTitle ?? '').trim() || null,
              description: v.description.trim() || null,
              content: v.content.trim() || null,
              relatedCalculators: v.relatedCalculators?.filter((r) => r.title.trim() && r.path.trim()) ?? [],
              faqItems: v.faqItems?.filter((f) => f.question.trim() && f.answer.trim()) ?? [],
              calculatorLabels: (v.calculatorLabels && Object.keys(v.calculatorLabels).length) ? v.calculatorLabels : null,
            };
          }),
      };
      if (!payload.slug || !payload.category || payload.translations.length === 0) {
        setError('Category, Slug and at least one translation (SEO Title, Content or H1) are required.');
        setSaving(false);
        return;
      }
      const res = await fetch(`/api/twojastara/pages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update page');
      const tabParam = returnTab ? `?tab=${encodeURIComponent(returnTab)}` : '';
      router.push(`/twojastara/pages${tabParam}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Edit Page</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && !autoResumeCountdown && (
          <div className="admin-form-error" role="alert">{error}</div>
        )}
        {autoResumeCountdown !== null && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid var(--primary, #2563eb)',
              borderRadius: 8,
              color: 'var(--primary, #2563eb)',
              fontSize: '0.875rem',
            }}
          >
            Auto-resume za {autoResumeCountdown}s…
          </div>
        )}
        {(generateSuccess || translateSuccess) && (
          <div
            role="status"
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--success-color, #10b981)',
              borderRadius: 8,
              color: 'var(--success-color, #10b981)',
              fontSize: '0.875rem',
            }}
          >
            {generateSuccess || translateSuccess}
          </div>
        )}

        <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => setShowJsonImport((v) => !v)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-secondary)',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            Import from JSON (all languages, SEO, meta, category)
            <span style={{ color: 'var(--text-secondary)' }}>{showJsonImport ? '▼' : '▶'}</span>
          </button>
          {showJsonImport && (
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Upload a .json file or paste JSON. Format: <code style={{ fontSize: '0.7rem' }}>{`{ "slug", "category", "published", "translations": { "en": { "title", "displayTitle", "description", "content", "calculatorLabels", "relatedCalculators", "faqItems" } } }`}</code>
              </p>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleJsonFileUpload}
                style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}
              />
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"slug":"my-calc","category":"math","published":false,"translations":{"en":{"title":"...","description":"..."}}}'
                rows={6}
                className="admin-form-textarea"
                style={{ width: '100%', fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', resize: 'vertical' }}
              />
              {jsonImportError && <div className="admin-form-error" style={{ marginTop: '0.5rem' }}>{jsonImportError}</div>}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <button type="button" onClick={handleJsonImport} className="btn btn-primary btn-sm">
                  Apply JSON
                </button>
                <button type="button" onClick={exportEmptyTemplate} className="btn btn-secondary btn-sm" title="Download blank template with all locales">
                  Download empty template
                </button>
                <button type="button" onClick={exportCurrentData} className="btn btn-secondary btn-sm" title="Export current form data as JSON">
                  Export current data
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="admin-form-label">Category *</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-form-select" required>
            {PAGE_CATEGORIES.map((opt) => (
              <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="admin-form-label">URL Slug *</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="adding-fractions"
            className="admin-form-input"
            required
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            URL: {activeLocale === 'en' ? `/calculators/${category || 'category'}/${slug || 'slug'}` : `/${activeLocale}/calculators/${category || 'category'}/${slug || 'slug'}`}
          </span>
          {slugChecking && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
              Checking...
            </span>
          )}
          {!slugChecking && slugExists && (
            <div className="admin-form-error" style={{ marginTop: '0.5rem' }}>
              This URL slug is already used in this category.
            </div>
          )}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          <span>Published</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            (required for sitemap and public visibility)
          </span>
        </label>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
            Translations & SEO
          </label>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            URL for [{activeLocale}]: {activeLocale === 'en' ? `/calculators/${category || 'category'}/${slug || 'slug'}` : `/${activeLocale}/calculators/${category || 'category'}/${slug || 'slug'}`}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
            {ADMIN_LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setActiveLocale(l)}
                className={`admin-form-tab ${activeLocale === l ? 'active' : ''}`}
              >
                {l}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                SEO Title [{activeLocale}] *
              </label>
              <input
                value={t.title}
                onChange={(e) => updateTranslation(activeLocale, 'title', e.target.value)}
                placeholder="Used in search results, <title> tag"
                className="admin-form-input"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                Title [{activeLocale}] — H1 on page
              </label>
              <input
                value={t.displayTitle}
                onChange={(e) => updateTranslation(activeLocale, 'displayTitle', e.target.value)}
                placeholder="e.g. Power Set Calculator | Find All Subsets of a Set (shown below category badge)"
                className="admin-form-input"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                Meta Description [{activeLocale}] — SEO
              </label>
              <input
                value={t.description}
                onChange={(e) => updateTranslation(activeLocale, 'description', e.target.value)}
                placeholder="Short description for search engines (150–160 chars recommended)"
                className="admin-form-input"
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.8rem', flex: '1 1 auto' }}>
                  Content [{activeLocale}] — appears below calculator (Markdown: # H1, ## H2, text)
                </label>
                {activeLocale === 'en' && (
                  <>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }} title="Ollama: ~90 min. Claude: ~2 min.">
                      Generate:
                    </span>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={autoResumeOnError}
                        onChange={(e) => setAutoResumeOnError(e.target.checked)}
                        disabled={generateLoading}
                        style={{ width: 14, height: 14 }}
                      />
                      Auto-resume przy błędzie
                    </label>
                    <button
                      type="button"
                      onClick={() => handleGeneratePost('ollama')}
                      disabled={generateLoading}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem 0.75rem' }}
                    >
                      {generateLoading ? 'Generowanie…' : 'Ollama'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGeneratePost('claude')}
                      disabled={generateLoading}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.35rem 0.75rem' }}
                    >
                      {generateLoading ? 'Generowanie…' : 'Claude 4.6'}
                    </button>
                    {(translations.en?.content?.trim() ?? '').length > 0 && (
                      <>
                        {(() => {
                          const remaining = ADMIN_LOCALES.filter(
                            (l) => l !== 'en' && !(translations[l]?.content?.trim() ?? '')
                          );
                          const allNonEn = ADMIN_LOCALES.filter((l) => l !== 'en');
                          const targetForSelect = remaining.length > 0 ? remaining : allNonEn;
                          const currentStart = translateStartFrom && targetForSelect.includes(translateStartFrom)
                            ? translateStartFrom
                            : targetForSelect[0] ?? '';
                          return (
                            <>
                              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                Start from:
                                <select
                                  value={currentStart}
                                  onChange={(e) => setTranslateStartFrom(e.target.value)}
                                  disabled={translating}
                                  className="admin-form-select"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', minWidth: 100 }}
                                >
                                  {targetForSelect.map((loc) => (
                                    <option key={loc} value={loc}>
                                      {LOCALE_NAMES[loc] ?? loc} ({loc})
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={translateOnlyOne}
                                  onChange={(e) => setTranslateOnlyOne(e.target.checked)}
                                  disabled={translating}
                                  style={{ width: 14, height: 14 }}
                                />
                                Only this language
                              </label>
                              {translating && (
                                <button
                                  type="button"
                                  onClick={handlePauseTranslate}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.35rem 0.75rem', borderColor: 'var(--error-color)', color: 'var(--error-color)' }}
                                >
                                  Pause
                                </button>
                              )}
                              {remaining.length > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleTranslateToOtherLocales(false, translateOnlyOne)}
                                  disabled={translating}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.35rem 0.75rem' }}
                                  title={translateOnlyOne ? `Tylko ${LOCALE_NAMES[currentStart] ?? currentStart}` : 'Kontynuuj od brakujących języków'}
                                >
                                  {translating
                                    ? 'Tłumaczenie…'
                                    : translatePausedAt
                                      ? `Resume od (${currentStart})`
                                      : translateOnlyOne
                                        ? `Translate only (${currentStart})`
                                        : `Translate remaining (${remaining.length})`}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleTranslateToOtherLocales(true, translateOnlyOne)}
                                  disabled={translating}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.35rem 0.75rem' }}
                                  title={translateOnlyOne ? `Tylko ${LOCALE_NAMES[currentStart] ?? currentStart}` : 'Przetłumacz ponownie wszystkie języki z EN (1:1)'}
                                >
                                  {translating
                                    ? 'Tłumaczenie…'
                                    : translatePausedAt
                                      ? `Resume od (${currentStart})`
                                      : translateOnlyOne
                                        ? `Translate only (${currentStart})`
                                        : 'Re-translate all from EN'}
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}
                  </>
                )}
              </div>
              {generateLoading && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Generowanie treści…</div>
                  <div
                    style={{
                      height: 6,
                      backgroundColor: 'var(--border-color)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: '40%',
                        backgroundColor: 'var(--primary, #2563eb)',
                        borderRadius: 3,
                        animation: 'generate-progress 1.5s ease-in-out infinite',
                      }}
                    />
                  </div>
                </div>
              )}
              {translateProgress && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    {translateProgress.current} / {translateProgress.total} — {LOCALE_NAMES[translateProgress.locale] ?? translateProgress.locale}
                    {translatePauseCountdown !== null && (
                      <span style={{ marginLeft: '0.5rem' }}> • Pauza {translatePauseCountdown}s przed następnym</span>
                    )}
                  </div>
                  <div
                    style={{
                      height: 6,
                      backgroundColor: 'var(--border-color)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${(translateProgress.current / translateProgress.total) * 100}%`,
                        backgroundColor: 'var(--primary, #2563eb)',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              )}
              <textarea
                value={t.content}
                onChange={(e) => updateTranslation(activeLocale, 'content', e.target.value)}
                rows={8}
                className="admin-form-textarea" style={{ resize: 'vertical' }}
              />
            </div>

            {showCalculatorSection && calculatorCode.trim() && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                  Calculator labels [{activeLocale}]
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Keys from <code>t('key')</code> in your code are auto-detected. Edit values below or use defaults.
                </p>
                {(() => {
                  const lab = t.calculatorLabels ?? {};
                  const defaults = getDefaultCalculatorLabels(activeLocale);
                  const extracted = extractCalculatorLabelKeys(calculatorCode);
                  const keys = Array.from(new Set([...extracted, ...Object.keys(lab), ...Object.keys(defaults)])).filter(Boolean).sort();
                  const current = Object.keys(lab).length ? lab : defaults;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {keys.map((key) => (
                        <div key={key} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <code style={{ fontSize: '0.8rem', minWidth: 140 }}>{key}</code>
                          <input
                            type="text"
                            value={lab[key] ?? current[key] ?? ''}
                            onChange={(e) => {
                              const v = e.target.value.trim();
                              const next = { ...(lab || {}), ...(Object.keys(lab).length ? {} : defaults) };
                              if (v) next[key] = v;
                              else delete next[key];
                              updateTranslation(activeLocale, 'calculatorLabels', next);
                            }}
                            placeholder={defaults[key] ?? ''}
                            className="admin-form-input"
                            style={{ flex: 1, minWidth: 120 }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = { ...(lab || {}), ...(Object.keys(lab).length ? {} : defaults) };
                              delete next[key];
                              updateTranslation(activeLocale, 'calculatorLabels', next);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const def = getDefaultCalculatorLabels(activeLocale);
                            updateTranslation(activeLocale, 'calculatorLabels', def);
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          Use all defaults
                        </button>
                        {activeLocale !== 'en' && (
                          <button
                            type="button"
                            onClick={handleTranslateLabels}
                            disabled={translateLabelsLoading || !Object.values(translations.en?.calculatorLabels ?? {}).some((v) => v?.trim())}
                            className="btn btn-secondary btn-sm"
                            title="Translate labels from EN to this language (Ollama). Limit: ~90 min. Retry: 2x."
                          >
                            {translateLabelsLoading ? 'Translating…' : 'Translate Labels'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const key = prompt('New key (e.g. myLabel):');
                            if (key && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
                              const next = { ...(lab || {}), ...(Object.keys(lab).length ? {} : defaults), [key]: '' };
                              updateTranslation(activeLocale, 'calculatorLabels', next);
                            } else if (key) alert('Use letters and numbers only (e.g. myLabel)');
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          Add custom key
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const toExport: Record<string, string> = {};
                            keys.forEach((k) => { toExport[k] = lab[k] ?? current[k] ?? defaults[k] ?? ''; });
                            const blob = new Blob([JSON.stringify(toExport, null, 2)], { type: 'application/json' });
                            const a = document.createElement('a');
                            a.href = URL.createObjectURL(blob);
                            a.download = `calculator-labels-${activeLocale}-${slug}.json`;
                            a.click();
                            URL.revokeObjectURL(a.href);
                          }}
                          className="btn btn-secondary btn-sm"
                          title="Download current labels as JSON to fill and re-upload"
                        >
                          Download labels JSON
                        </button>
                        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }} title="Upload JSON file with labels. Formats: flat { key: val } or nested { calculators: { calcId: { key: val } } }">
                          Upload labels JSON
                          <input
                            type="file"
                            accept=".json,application/json"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                const parsed = parseLabelsFromUpload(String(reader.result ?? ''), slug);
                                if (Object.keys(parsed).length > 0) {
                                  const next = { ...(lab || {}), ...(Object.keys(lab).length ? {} : defaults), ...parsed };
                                  updateTranslation(activeLocale, 'calculatorLabels', next);
                                }
                              };
                              reader.readAsText(file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })()}
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Live preview [{activeLocale}] — updates as you edit (no Save needed)
                  </div>
                  <div style={{ minHeight: 420 }}>
                    <CalculatorSandpackClient
                      code={calculatorCode}
                      labels={(t.calculatorLabels && Object.keys(t.calculatorLabels).length > 0)
                        ? t.calculatorLabels
                        : getDefaultCalculatorLabels(activeLocale)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                Related Calculators [{activeLocale}]
              </label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Show:</span>
                <select
                  value={relatedCalculatorsMode}
                  onChange={(e) => setRelatedCalculatorsMode(e.target.value as 'manual' | 'random' | 'both')}
                  className="admin-form-select"
                  style={{ width: 'auto', minWidth: 140 }}
                >
                  <option value="manual">Manual only</option>
                  <option value="random">Random calculators</option>
                  <option value="both">Manual + random</option>
                </select>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>Count:</span>
                <select
                  value={relatedCalculatorsCount}
                  onChange={(e) => setRelatedCalculatorsCount(Number(e.target.value))}
                  className="admin-form-select"
                  style={{ width: 'auto', minWidth: 60 }}
                >
                  {[3, 4, 5, 6, 8, 9, 12].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {(relatedCalculatorsMode === 'manual' || relatedCalculatorsMode === 'both') && 'Add manually or pick from list below. '}
                Path: category/slug (e.g. math/addition)
              </p>
              {(relatedCalculatorsMode === 'manual' || relatedCalculatorsMode === 'both') && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select
                    className="admin-form-select"
                    style={{ flex: 1, minWidth: 200 }}
                    value=""
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) return;
                      const opt = calculatorOptions.find((o) => o.value === v);
                      if (opt) {
                        updateTranslation(activeLocale, 'relatedCalculators', [
                          ...(t.relatedCalculators ?? []),
                          { title: opt.title ?? opt.label, description: opt.description ?? '', path: opt.value },
                        ]);
                      }
                      e.target.value = '';
                    }}
                  >
                    <option value="">— Add from all calculators —</option>
                    {calculatorOptions.filter((o) => o.value).map((opt, i) => (
                      <option key={i} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}
              {(t.relatedCalculators ?? []).map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    value={r.title}
                    onChange={(e) => {
                      const arr = [...(t.relatedCalculators ?? [])];
                      arr[i] = { ...arr[i], title: e.target.value };
                      updateTranslation(activeLocale, 'relatedCalculators', arr);
                    }}
                    placeholder="Title"
                    className="admin-form-input"
                    style={{ flex: 1, minWidth: 120 }}
                  />
                  <input
                    value={r.description}
                    onChange={(e) => {
                      const arr = [...(t.relatedCalculators ?? [])];
                      arr[i] = { ...arr[i], description: e.target.value };
                      updateTranslation(activeLocale, 'relatedCalculators', arr);
                    }}
                    placeholder="Description"
                    className="admin-form-input"
                    style={{ flex: 1, minWidth: 140 }}
                  />
                  <input
                    value={r.path}
                    onChange={(e) => {
                      const arr = [...(t.relatedCalculators ?? [])];
                      arr[i] = { ...arr[i], path: e.target.value };
                      updateTranslation(activeLocale, 'relatedCalculators', arr);
                    }}
                    placeholder="math/addition"
                    className="admin-form-input"
                    style={{ width: 140 }}
                  />
                  <button type="button" onClick={() => updateTranslation(activeLocale, 'relatedCalculators', (t.relatedCalculators ?? []).filter((_, j) => j !== i))} style={{ padding: '0.25rem 0.5rem', color: 'var(--error-color)' }}>−</button>
                </div>
              ))}
              {(relatedCalculatorsMode === 'manual' || relatedCalculatorsMode === 'both') && (
                <button type="button" onClick={() => updateTranslation(activeLocale, 'relatedCalculators', [...(t.relatedCalculators ?? []), { title: '', description: '', path: '' }])} className="btn btn-secondary btn-sm">+ Add related (manual entry)</button>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                FAQ [{activeLocale}]
              </label>
              {(t.faqItems ?? []).map((f, i) => (
                <div key={i} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  <input
                    value={f.question}
                    onChange={(e) => {
                      const arr = [...(t.faqItems ?? [])];
                      arr[i] = { ...arr[i], question: e.target.value };
                      updateTranslation(activeLocale, 'faqItems', arr);
                    }}
                    placeholder="Question"
                    className="admin-form-input"
                    style={{ width: '100%', marginBottom: '0.25rem' }}
                  />
                  <textarea
                    value={f.answer}
                    onChange={(e) => {
                      const arr = [...(t.faqItems ?? [])];
                      arr[i] = { ...arr[i], answer: e.target.value };
                      updateTranslation(activeLocale, 'faqItems', arr);
                    }}
                    placeholder="Answer"
                    className="admin-form-textarea"
                    rows={2}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                  <button type="button" onClick={() => updateTranslation(activeLocale, 'faqItems', (t.faqItems ?? []).filter((_, j) => j !== i))} style={{ marginTop: '0.25rem', padding: '0.25rem 0.5rem', color: 'var(--error-color)', fontSize: '0.8rem' }}>Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => updateTranslation(activeLocale, 'faqItems', [...(t.faqItems ?? []), { question: '', answer: '' }])} className="btn btn-secondary btn-sm">+ Add FAQ</button>
            </div>
          </div>
        </div>

        <div className="admin-form-section">
          <button
            type="button"
            onClick={() => {
              const willExpand = !showCalculatorSection;
              setShowCalculatorSection((v) => !v);
              if (willExpand && !calculatorCode.trim()) setCalculatorCode(ADDING_FRACTIONS_EXAMPLE);
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            Add Calculator Code
            <span style={{ color: 'var(--text-secondary)' }}>{showCalculatorSection ? '▼' : '▶'}</span>
          </button>
          {showCalculatorSection && (
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                  Link to existing calculator
                </label>
                <select
                  value={linkedCalculatorPath}
                  onChange={(e) => setLinkedCalculatorPath(e.target.value)}
                  className="admin-form-select"
                >
                  {calculatorOptions.map((opt, i) => (
                    <option key={i} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: 0, fontSize: '0.8rem' }}>Calculator code (TSX/JS) — shown on /calculator subpage</label>
                  <button
                    type="button"
                    onClick={() => setCalculatorCode(ADDING_FRACTIONS_EXAMPLE)}
                    className="btn btn-secondary btn-sm"
                  >
                    Insert adding fractions example
                  </button>
                </div>
                <textarea
                  value={calculatorCode}
                  onChange={(e) => setCalculatorCode(e.target.value)}
                  placeholder="Paste calculator component code here"
                  rows={12}
                  className="admin-form-textarea"
                  style={{ resize: 'vertical', fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem' }}
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={saving || slugExists} className="btn btn-primary">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
