'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

function parseJson<T>(val: unknown, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return val as T;
}

type PageTranslation = {
  id: string;
  locale: string;
  title: string;
  displayTitle?: string | null;
  description: string | null;
  content: string | null;
  relatedCalculators?: string | null;
  faqItems?: string | null;
  calculatorLabels?: string | null;
};

type Page = {
  id: string;
  slug: string;
  category: string | null;
  published: boolean;
  translations: PageTranslation[];
};

type GenerateProgress = {
  current: number;
  total: number;
  title: string;
};

type GenerateContextValue = {
  generateProgress: GenerateProgress | null;
  generateError: string;
  generateSuccess: string;
  startGenerate: (params: {
    pages: Page[];
    selectedIds: Set<string>;
    resumeFromPageSlug?: string;
    autoResumeOnError: boolean;
    onPagesUpdate?: (updater: (prev: Page[]) => Page[]) => void;
    onComplete?: () => void;
  }) => Promise<void>;
};

const GenerateContext = createContext<GenerateContextValue | null>(null);

export function useGenerate() {
  const ctx = useContext(GenerateContext);
  if (!ctx) throw new Error('useGenerate must be used within GenerateProvider');
  return ctx;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 900_000,
  signal?: AbortSignal | null
): Promise<Response> {
  const controller = signal ? undefined : new AbortController();
  const id = setTimeout(() => controller?.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: signal ?? controller?.signal,
    });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('Timeout (limit ~15 min) — spróbuj ponownie');
    }
    throw e;
  }
}

export function GenerateProvider({ children }: { children: ReactNode }) {
  const [generateProgress, setGenerateProgress] = useState<GenerateProgress | null>(null);
  const [generateError, setGenerateError] = useState('');
  const [generateSuccess, setGenerateSuccess] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const startGenerate = useCallback(
    async (params: {
      pages: Page[];
      selectedIds: Set<string>;
      resumeFromPageSlug?: string;
      autoResumeOnError: boolean;
      onPagesUpdate?: (updater: (prev: Page[]) => Page[]) => void;
      onComplete?: () => void;
    }) => {
      const { pages, selectedIds, resumeFromPageSlug, autoResumeOnError, onPagesUpdate, onComplete } = params;
      const ids = Array.from(selectedIds);
      if (ids.length === 0) {
        setGenerateError('Zaznacz co najmniej jedną stronę.');
        return;
      }
      abortRef.current = new AbortController();
      setGenerateError('');
      setGenerateSuccess('');

      const selectedPages = pages.filter((p) => ids.includes(p.id));
      const startIdx = resumeFromPageSlug
        ? Math.max(0, selectedPages.findIndex((p) => p.slug === resumeFromPageSlug))
        : 0;
      const finalPages = selectedPages.slice(startIdx);
      setGenerateProgress({ current: 0, total: finalPages.length, title: '' });
      let hadError = false;

      for (let i = 0; i < finalPages.length; i++) {
        if (abortRef.current?.signal.aborted) break;
        const page = finalPages[i];
        const enTrans = page.translations.find((t) => t.locale === 'en');
        const topic = (enTrans?.displayTitle ?? enTrans?.title ?? page.slug).trim() || page.slug;
        setGenerateProgress({ current: i + 1, total: finalPages.length, title: topic });

        try {
          const genRes = await fetchWithTimeout(
            '/api/twojastara/ollama/generate-post',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ topic }),
              credentials: 'include',
            },
            900_000,
            abortRef.current?.signal ?? null
          );
          let genData: { error?: string; content?: string; faqItems?: unknown[] };
          try {
            genData = await genRes.json();
          } catch {
            throw new Error(genRes.status === 401 ? 'Unauthorized — zaloguj się ponownie' : 'Błąd serwera');
          }
          if (!genRes.ok) throw new Error(genData.error || 'Generate failed');
          const newContent = genData.content;
          const newFaqItems = Array.isArray(genData.faqItems) ? genData.faqItems : [];

          const pageRes = await fetch(`/api/twojastara/pages/${page.id}`);
          const fullPage = await pageRes.json();
          if (!pageRes.ok || !fullPage?.translations) throw new Error('Failed to load page');

          const existingByLocale = new Map(
            (fullPage.translations ?? []).map((t: { locale: string; [key: string]: unknown }) => [t.locale, t])
          );
          const enExisting = existingByLocale.get('en') as {
            title?: string;
            displayTitle?: string;
            description?: string;
            relatedCalculators?: unknown;
            faqItems?: unknown;
            calculatorLabels?: unknown;
          } | undefined;
          const enTitle = (enExisting?.displayTitle ?? enExisting?.title ?? topic).trim();
          const translationsRaw = (fullPage.translations ?? []) as {
            locale: string;
            title?: string;
            displayTitle?: string;
            description?: string;
            content?: string;
            relatedCalculators?: unknown;
            faqItems?: unknown;
            calculatorLabels?: unknown;
          }[];
          let hasEn = false;
          const translations = translationsRaw.map((t) => {
            if (t.locale === 'en') hasEn = true;
            const relatedCalculators = parseJson<{ title: string; description: string; path: string }[]>(
              t.relatedCalculators,
              []
            );
            const existingFaq = parseJson<{ question: string; answer: string }[]>(t.faqItems, []);
            const faqItems = t.locale === 'en' && newFaqItems.length > 0 ? newFaqItems : existingFaq;
            const calculatorLabels = parseJson<Record<string, string>>(t.calculatorLabels, {});
            return {
              locale: t.locale,
              title: (t.title ?? '').trim() || enTitle || 'Untitled',
              displayTitle: (t.displayTitle ?? t.title ?? '').trim() || null,
              description: (t.description ?? null),
              content: t.locale === 'en' ? newContent : (t.content ?? null),
              relatedCalculators,
              faqItems,
              calculatorLabels,
            };
          });
          if (!hasEn) {
            translations.push({
              locale: 'en',
              title: enTitle,
              displayTitle: enTitle,
              description: null,
              content: newContent,
              relatedCalculators: [],
              faqItems: newFaqItems,
              calculatorLabels: {},
            });
          }

          const patchRes = await fetch(`/api/twojastara/pages/${page.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug: fullPage.slug,
              category: fullPage.category,
              published: fullPage.published,
              translations,
            }),
          });
          if (!patchRes.ok) {
            const errData = await patchRes.json();
            throw new Error(errData.error || 'Failed to save');
          }

          onPagesUpdate?.((prev) =>
            prev.map((p) => {
              if (p.id !== page.id) return p;
              const hasEnInPage = p.translations.some((t) => t.locale === 'en');
              const updated = p.translations.map((t) =>
                t.locale === 'en'
                  ? {
                      ...t,
                      content: newContent,
                      faqItems: newFaqItems.length > 0 ? JSON.stringify(newFaqItems) : t.faqItems,
                    }
                  : t
              );
              if (!hasEnInPage) {
                updated.push({
                  id: `en-${page.id}`,
                  locale: 'en',
                  title: enTitle,
                  displayTitle: enTitle,
                  description: null,
                  content: newContent,
                  relatedCalculators: null,
                  faqItems: newFaqItems.length > 0 ? JSON.stringify(newFaqItems) : null,
                  calculatorLabels: null,
                });
              }
              return { ...p, translations: updated };
            })
          );
        } catch (err) {
          const msg =
            err instanceof Error
              ? err.name === 'AbortError'
                ? 'Przerwano'
                : err.message
              : 'Błąd generowania';
          setGenerateError(
            `Strona: ${page.slug}. ${msg} — Zaznacz tę stronę (i ewentualnie następne) i kliknij Generate Content, aby spróbować od początku.`
          );
          hadError = true;
          if (autoResumeOnError) {
            const delaySec = 5;
            for (let s = delaySec; s >= 1; s--) {
              await new Promise((r) => setTimeout(r, 1000));
            }
            setGenerateError('');
            return startGenerate({
              ...params,
              resumeFromPageSlug: page.slug,
              autoResumeOnError,
            });
          }
          break;
        }
      }

      setGenerateProgress(null);
      if (!hadError) {
        onComplete?.();
        setGenerateSuccess(`Wygenerowano treść dla ${finalPages.length} stron.`);
        setTimeout(() => setGenerateSuccess(''), 5000);
      }
    },
    []
  );

  return (
    <GenerateContext.Provider
      value={{
        generateProgress,
        generateError,
        generateSuccess,
        startGenerate,
      }}
    >
      {children}
    </GenerateContext.Provider>
  );
}
