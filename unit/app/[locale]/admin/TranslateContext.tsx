'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ADMIN_LOCALES } from '@/lib/admin-locales';

const STORAGE_KEY = 'twojastara-translate-paused';
const PAUSE_BETWEEN_LOCALES_SEC = 1; // reduced from 3 — parallel batches make long pauses unnecessary

function parseJson<T>(val: unknown, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === 'string') {
    try { return JSON.parse(val) as T; } catch { return fallback; }
  }
  return val as T;
}

/** Safe response.json() — avoids "Unexpected end of JSON input" on empty/truncated responses. */
async function safeResJson<T = unknown>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text?.trim()) {
    throw new Error(res.ok ? 'Empty response' : `Server returned ${res.status} (empty body)`);
  }
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    const snippet = text.slice(0, 80).replace(/\s+/g, ' ');
    throw new Error(`Invalid JSON (${res.status}): ${snippet}${text.length > 80 ? '…' : ''}`);
  }
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

type TranslateProgress = {
  current: number;
  total: number;
  pageTitle: string;
  pageCategory: string;
  locale: string;
  startedAt?: number;
};

type TranslatePausedAt = { pageSlug: string; nextLocale: string };

type TranslateContextValue = {
  translateProgress: TranslateProgress | null;
  translatePauseCountdown: number | null;
  translatePausedAt: TranslatePausedAt | null;
  translateStartFrom: string;
  setTranslateStartFrom: (v: string) => void;
  translateError: string;
  translateSuccess: string;
  setTranslateSuccess: (v: string) => void;
  autoResumeCountdown: number | null;
  setAutoResumeCountdown: (v: number | null) => void;
  startTranslate: (params: {
    pages: Page[];
    selectedIds: Set<string>;
    translateStartFrom: string;
    translateOnlyOne: boolean;
    translateConcurrency?: number;
    contentParallel?: number;
    ollamaModel?: string;
    resumeOverride?: TranslatePausedAt;
    autoResumeOnError: boolean;
    onPagesUpdate?: (updater: (prev: Page[]) => Page[]) => void;
    onComplete?: () => void;
  }) => Promise<void>;
  pauseTranslate: () => void;
  clearPaused: () => void;
};

const TranslateContext = createContext<TranslateContextValue | null>(null);

export function useTranslate() {
  const ctx = useContext(TranslateContext);
  if (!ctx) throw new Error('useTranslate must be used within TranslateProvider');
  return ctx;
}

export function TranslateProvider({ children }: { children: ReactNode }) {
  const [translateProgress, setTranslateProgress] = useState<TranslateProgress | null>(null);
  const [translatePauseCountdown, setTranslatePauseCountdown] = useState<number | null>(null);
  const [translatePausedAt, setTranslatePausedAt] = useState<TranslatePausedAt | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (!s) return null;
      const v = JSON.parse(s) as TranslatePausedAt;
      return v?.pageSlug && v?.nextLocale ? v : null;
    } catch { return null; }
  });
  const [translateStartFrom, setTranslateStartFrom] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (!s) return '';
      const v = JSON.parse(s) as { nextLocale?: string };
      return v?.nextLocale ?? '';
    } catch { return ''; }
  });
  const [translateError, setTranslateError] = useState('');
  const [translateSuccess, setTranslateSuccess] = useState('');
  const [autoResumeCountdown, setAutoResumeCountdown] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isResumingRef = useRef(false);

  useEffect(() => {
    if (translatePausedAt) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(translatePausedAt));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [translatePausedAt]);

  const clearPaused = useCallback(() => {
    setTranslatePausedAt(null);
    setTranslateStartFrom('');
    setTranslateError('');
  }, []);

  const pauseTranslate = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  async function fetchWithTimeoutAndRetry(
    url: string,
    options: RequestInit,
    timeoutMs = 172_800_000, // 48 h
    retries = 2,
    signal?: AbortSignal | null
  ): Promise<Response> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const onAbort = () => { clearTimeout(id); controller.abort(); };
      signal?.addEventListener('abort', onAbort);
      try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        signal?.removeEventListener('abort', onAbort);
        return res;
      } catch (e) {
        clearTimeout(id);
        signal?.removeEventListener('abort', onAbort);
        const isAbort = e instanceof DOMException && e.name === 'AbortError';
        if (isAbort) throw e;
        if (attempt < retries) await new Promise((r) => setTimeout(r, 2000));
        else throw e;
      }
    }
    throw new Error('Fetch failed');
  }

  const startTranslate = useCallback(async (params: {
    pages: Page[];
    selectedIds: Set<string>;
    translateStartFrom: string;
    translateOnlyOne: boolean;
    translateConcurrency?: number;
    contentParallel?: number;
    ollamaModel?: string;
    resumeOverride?: TranslatePausedAt;
    autoResumeOnError: boolean;
    onPagesUpdate?: (updater: (prev: Page[]) => Page[]) => void;
    onComplete?: () => void;
  }) => {
    const { pages, selectedIds, translateOnlyOne, resumeOverride, autoResumeOnError, ollamaModel, onPagesUpdate, onComplete } = params;
    const concurrency = Math.max(1, Math.min(6, params.translateConcurrency ?? 4));
    const contentParallel = Math.max(1, Math.min(8, params.contentParallel ?? 4));
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      setTranslateError('Zaznacz co najmniej jedną stronę.');
      return;
    }
    const allNonEn = (ADMIN_LOCALES ?? []).filter((l) => l !== 'en');
    console.log('[TranslateContext] ADMIN_LOCALES:', ADMIN_LOCALES, 'allNonEn:', allNonEn);
    const effectiveStart = (resumeOverride?.nextLocale ?? params.translateStartFrom) && allNonEn.includes(resumeOverride?.nextLocale ?? params.translateStartFrom)
      ? (resumeOverride?.nextLocale ?? params.translateStartFrom)
      : allNonEn[0];
    let pagesWithEn = pages.filter((p) => ids.includes(p.id) && (p.translations.find((t) => t.locale === 'en')?.content?.trim() ?? '').length > 0);
    const resumeFromSlug = resumeOverride?.pageSlug ?? translatePausedAt?.pageSlug;
    if (resumeFromSlug) {
      const idx = pagesWithEn.findIndex((p) => p.slug === resumeFromSlug);
      if (idx >= 0) pagesWithEn = pagesWithEn.slice(idx);
    }
    if (pagesWithEn.length === 0) {
      setTranslateError('Zaznacz strony z wypełnionym Content [en].');
      return;
    }

    setTranslateError('');
    setTranslateSuccess('');
    setTranslatePausedAt(null);
    if (!resumeOverride) setTranslateStartFrom(allNonEn[0] ?? '');
    abortRef.current = new AbortController();
    const pagesTranslatedCountRef = { current: 0 };
    let hadError = false;

    // Pre-scan: count total translations (pages × locales). Batch fetches (max 3 concurrent) to avoid ERR_INSUFFICIENT_RESOURCES
    const PRE_SCAN_BATCH = 3;
    let totalSteps = 0;
    try {
      for (let i = 0; i < pagesWithEn.length; i += PRE_SCAN_BATCH) {
        if (abortRef.current?.signal.aborted) break;
        const batch = pagesWithEn.slice(i, i + PRE_SCAN_BATCH);
        const counts = await Promise.all(
          batch.map(async (page) => {
            const enTrans = page.translations.find((t) => t.locale === 'en');
            if (!(enTrans?.content ?? '').trim()) return 0;
            let fullPage: { translations?: unknown[] } | null = null;
            for (let attempt = 0; attempt <= 2; attempt++) {
              const pageRes = await fetch(`/api/twojastara/pages/${page.id}`, {
                credentials: 'include',
                signal: abortRef.current?.signal,
              });
              try {
                fullPage = await safeResJson<{ translations?: unknown[] }>(pageRes);
                break;
              } catch (e) {
                if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
                else throw e;
              }
            }
            if (!fullPage || !fullPage?.translations) return 0;
            const fullPageTrans = fullPage.translations ?? [];
            const hasContent = (loc: string) => ((fullPageTrans.find((t: { locale: string; content?: string }) => t.locale === loc) as { content?: string } | undefined)?.content?.trim() ?? '').length > 0;
            let localesToTranslate = (allNonEn ?? []).filter((loc) => !hasContent(loc));
            if (resumeOverride && page.slug === resumeFromSlug) {
              const startLoc = resumeOverride.nextLocale;
              if (startLoc && allNonEn) {
                if (!(localesToTranslate?.includes?.(startLoc) ?? false)) {
                  const ane = allNonEn ?? [];
                  localesToTranslate = [startLoc, ...localesToTranslate.filter((l) => ane.indexOf(l) > ane.indexOf(startLoc))];
                } else {
                  const idx = (localesToTranslate ?? []).indexOf(startLoc);
                  localesToTranslate = (localesToTranslate ?? []).slice(idx >= 0 ? idx : 0);
                }
              }
            } else if (allNonEn && effectiveStart && translateOnlyOne) {
              const ane = allNonEn ?? [];
              const startIdx = ane.indexOf(effectiveStart);
              localesToTranslate = (localesToTranslate ?? []).filter((loc) => ane.indexOf(loc) >= startIdx);
            }
            if (translateOnlyOne) {
              localesToTranslate = (localesToTranslate?.includes?.(effectiveStart) ?? false) ? [effectiveStart] : [];
            }
            return localesToTranslate.length;
          })
        );
        totalSteps += counts.reduce((a, b) => a + b, 0);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const hint = /failed to fetch|networkerror|load failed/i.test(msg)
        ? ' — Sprawdź połączenie lub odśwież stronę i zaloguj się ponownie.'
        : '';
      setTranslateError('Błąd przy zliczaniu: ' + msg + hint);
      return;
    }
    if (totalSteps === 0) {
      setTranslateError('Wszystkie wybrane strony mają już przetłumaczone treści.');
      return;
    }
    const startedAtMs = Date.now();
    setTranslateProgress({ current: 0, total: totalSteps, pageTitle: '', pageCategory: '', locale: '', startedAt: startedAtMs });

    const stepRef = { current: 0 };
    const hadErrorRef = { current: false };
    const pageQueue = [...pagesWithEn];
    let pageIndex = 0;

    const processPage = async (page: Page): Promise<boolean> => {
      if (hadErrorRef.current || abortRef.current?.signal?.aborted) return false;
      const enTrans = page.translations.find((t) => t.locale === 'en');
      const enContent = (enTrans?.content ?? '').trim();
      const enFaqItems = parseJson<{ question: string; answer: string }[]>(enTrans?.faqItems, []);
      const enTitle = (enTrans?.title ?? '').trim();
      const enDisplayTitle = (enTrans?.displayTitle ?? '').trim();
      if (!enContent) return true;

      const pageRes = await fetch(`/api/twojastara/pages/${page.id}`, { credentials: 'include', signal: abortRef.current?.signal });
      let fullPage: { translations?: { locale: string; content?: string }[]; slug?: string; category?: string; published?: boolean } | null = null;
      try {
        fullPage = await safeResJson(pageRes);
      } catch (e) {
        setTranslateError(`Nie udało się załadować strony (JSON): ${page.slug} — ${e instanceof Error ? e.message : String(e)}`);
        hadErrorRef.current = true;
        return false;
      }
      if (!pageRes.ok || !fullPage?.translations) {
        setTranslateError(`Nie udało się załadować strony: ${page.slug}`);
        hadErrorRef.current = true;
        return false;
      }

      const fullPageTrans = fullPage.translations ?? [];
      const hasContent = (loc: string) => ((fullPageTrans.find((t) => t.locale === loc) as { content?: string } | undefined)?.content?.trim() ?? '').length > 0;
      let localesToTranslate = (allNonEn ?? []).filter((loc) => !hasContent(loc));
      if (resumeOverride && page.slug === resumeFromSlug && concurrency === 1) {
        const startLoc = resumeOverride.nextLocale;
        if (startLoc && allNonEn) {
          if (!(localesToTranslate?.includes?.(startLoc) ?? false)) {
            const ane = allNonEn ?? [];
            localesToTranslate = [startLoc, ...localesToTranslate.filter((l) => ane.indexOf(l) > ane.indexOf(startLoc))];
          } else {
            const idx = (localesToTranslate ?? []).indexOf(startLoc);
            localesToTranslate = (localesToTranslate ?? []).slice(idx >= 0 ? idx : 0);
          }
        }
      } else if (allNonEn && effectiveStart && translateOnlyOne) {
        const ane = allNonEn ?? [];
        const startIdx = ane.indexOf(effectiveStart);
        localesToTranslate = (localesToTranslate ?? []).filter((loc) => ane.indexOf(loc) >= startIdx);
      }
      if (translateOnlyOne) {
        localesToTranslate = (localesToTranslate?.includes?.(effectiveStart) ?? false) ? [effectiveStart] : [];
      }
      if (localesToTranslate.length === 0) return true;

      pagesTranslatedCountRef.current++;
      const enFromFull = fullPage.translations?.find((x: { locale: string }) => x.locale === 'en') as { title?: string; displayTitle?: string; description?: string } | undefined;
      const enTitleFallback = (enFromFull?.title ?? '').trim() || 'Untitled';
      const enDescription = (enFromFull?.description ?? enTrans?.description ?? '').trim();
      const translatedByLocale: Record<string, { content: string; title?: string; displayTitle?: string; description?: string; faqItems?: { question: string; answer: string }[] }> = {};

      const localeChunks: string[][] = localesToTranslate.map((l) => [l]);

      for (let bi = 0; bi < localeChunks.length; bi += contentParallel) {
        if (hadErrorRef.current || abortRef.current?.signal?.aborted) return false;
        const batch = localeChunks.slice(bi, bi + contentParallel);
        const batchLocs = batch.map((c) => c[0]).filter(Boolean);
        stepRef.current += batch.length;
        setTranslateProgress({ current: stepRef.current, total: totalSteps, pageTitle: page.slug, pageCategory: page.category ?? '', locale: batchLocs.join(', '), startedAt: startedAtMs });
        try {
          const results = await Promise.all(
            batch.map(async (chunk) => {
              let res: Response;
              let data: { error?: string; content?: string; title?: string; displayTitle?: string; description?: string; faqItems?: unknown[]; byLocale?: Record<string, { content?: string; title?: string; displayTitle?: string; description?: string; faqItems?: unknown[] }> };
              for (let attempt = 0; attempt <= 2; attempt++) {
                res = await fetchWithTimeoutAndRetry(
                  '/api/twojastara/ollama/translate',
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      content: enContent,
                      faqItems: enFaqItems,
                      targetLocales: chunk,
                      title: enTitle || undefined,
                      displayTitle: enDisplayTitle || undefined,
                      description: enDescription || undefined,
                      model: ollamaModel || undefined,
                    }),
                    credentials: 'include',
                  },
                  172_800_000,
                  2,
                  abortRef.current?.signal ?? null
                );
                try { data = await safeResJson(res); } catch (e) {
                  throw new Error(res.status === 401 ? 'Unauthorized' : (e instanceof Error ? e.message : `Błąd serwera (${res.status})`));
                }
                if (res.ok) break;
                if (res.status === 401) throw new Error(data.error || 'Unauthorized');
                if (res.status === 503 && attempt < 2) {
                  await new Promise((r) => setTimeout(r, 10000));
                  continue;
                }
                throw new Error(data.error || `Failed to translate to ${chunk.join(',')}`);
              }
              return { chunk, data };
            })
          );
          for (const { chunk, data } of results) {
            if (data.byLocale && typeof data.byLocale === 'object') {
              for (const loc of chunk) {
                const tr = data.byLocale[loc];
                if (tr) {
                  translatedByLocale[loc] = {
                    content: tr.content ?? '',
                    title: tr.title,
                    displayTitle: tr.displayTitle,
                    description: tr.description,
                    faqItems: Array.isArray(tr.faqItems) ? (tr.faqItems as { question: string; answer: string }[]) : undefined,
                  };
                }
              }
            } else {
              const singleLoc = chunk[0];
              if (singleLoc) {
                translatedByLocale[singleLoc] = {
                  content: data.content ?? '',
                  title: data.title,
                  displayTitle: data.displayTitle,
                  description: data.description,
                  faqItems: Array.isArray(data.faqItems) ? (data.faqItems as { question: string; answer: string }[]) : undefined,
                };
              }
            }
          }

          type TransRow = { locale: string; title?: string; displayTitle?: string | null; description?: string | null; content?: string | null; relatedCalculators?: unknown; faqItems?: unknown; calculatorLabels?: unknown };
          const baseMap = new Map<string, TransRow>((fullPage.translations ?? []).map((t: TransRow) => [t.locale, t]));
          for (const l of Object.keys(translatedByLocale)) {
            if (!baseMap.has(l)) baseMap.set(l, { locale: l, title: '', displayTitle: null, description: null, content: null, relatedCalculators: [], faqItems: [], calculatorLabels: {} });
          }
          const translations = Array.from(baseMap.values()).map((t: TransRow) => {
            const relatedCalculators = parseJson<{ title: string; description: string; path: string }[]>(t.relatedCalculators, []);
            const existingFaq = parseJson<{ question: string; answer: string }[]>(t.faqItems, []);
            const calcLabels = parseJson<Record<string, string>>(t.calculatorLabels, {});
            const tr = translatedByLocale[t.locale];
            const faqItems = tr?.faqItems && tr.faqItems.length > 0 ? tr.faqItems : existingFaq;
            const finalTitle = (tr?.title ?? t.title ?? '').trim() || enTitleFallback;
            const finalDisplayTitle = (tr?.displayTitle ?? t.displayTitle ?? '')?.trim() || null;
            const finalDescription = (tr?.description ?? t.description ?? null)?.trim() || null;
            return {
              locale: t.locale,
              title: finalTitle,
              displayTitle: finalDisplayTitle || (t.displayTitle?.trim() || null),
              description: finalDescription,
              content: tr ? tr.content : (t.content ?? null),
              relatedCalculators,
              faqItems,
              calculatorLabels: calcLabels,
            };
          });

          const patchRes = await fetch(`/api/twojastara/pages/${page.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: fullPage.slug, category: fullPage.category, published: fullPage.published, translations }),
            credentials: 'include',
            signal: abortRef.current?.signal,
          });
          if (!patchRes.ok) {
            const errData = await safeResJson<{ error?: string }>(patchRes).catch((): { error?: string } => ({}));
            throw new Error((errData && 'error' in errData ? errData.error : null) || 'Failed to save');
          }

          onPagesUpdate?.((prev) =>
            prev.map((p) => {
              if (p.id !== page.id) return p;
              const updated = p.translations.map((t) => {
                const tr = translatedByLocale[t.locale];
                if (!tr) return t;
                return { ...t, title: tr.title ?? t.title, displayTitle: tr.displayTitle ?? t.displayTitle, description: tr.description ?? t.description ?? null, content: tr.content, faqItems: tr.faqItems ? JSON.stringify(tr.faqItems) : t.faqItems };
              });
              for (const l of Object.keys(translatedByLocale)) {
                if (!updated.some((x) => x.locale === l)) {
                  const tr = translatedByLocale[l]!;
                  updated.push({ id: `${l}-${page.id}`, locale: l, title: tr.title ?? '', displayTitle: tr.displayTitle ?? null, description: tr.description ?? null, content: tr.content, relatedCalculators: null, faqItems: tr.faqItems ? JSON.stringify(tr.faqItems) : null, calculatorLabels: null });
                }
              }
              return { ...p, translations: updated };
            })
          );

          const lastLocInBatch = batchLocs[batchLocs.length - 1];
          const isLastBatch = bi + contentParallel >= localeChunks.length;
          const isLastPage = pageIndex >= pageQueue.length - 1;
          if (concurrency === 1 && (!isLastBatch || !isLastPage) && (localesToTranslate?.indexOf(lastLocInBatch ?? '') ?? -1) >= 0) {
            setTranslatePauseCountdown(PAUSE_BETWEEN_LOCALES_SEC);
            for (let s = PAUSE_BETWEEN_LOCALES_SEC; s >= 1; s--) {
              if (abortRef.current?.signal?.aborted) break;
              setTranslatePauseCountdown(s);
              await new Promise((r) => setTimeout(r, 1000));
            }
            setTranslatePauseCountdown(null);
            if (abortRef.current?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
          }
        } catch (err) {
          const isAbort = err instanceof Error && err.name === 'AbortError';
          const msg = err instanceof Error ? (isAbort ? 'Wstrzymano przez użytkownika' : err.message) : 'Błąd tłumaczenia';
          const is401 = /unauthorized/i.test(msg);
          const nextLocale = batchLocs[0] ?? '';
          setTranslatePausedAt({ pageSlug: page.slug, nextLocale });
          setTranslateStartFrom(nextLocale);
          setTranslateError(is401 ? 'Sesja wygasła — zaloguj się ponownie.' : `Strona: ${page.slug}, Język: ${batchLocs.join(',')}. ${msg} — Kliknij Resume.`);
          hadErrorRef.current = true;
          if (is401 && typeof window !== 'undefined') {
            window.location.href = '/twojastara/login';
            return false;
          }
          if (autoResumeOnError && !isAbort) {
            setAutoResumeCountdown(5);
            for (let s = 5; s >= 1; s--) {
              setAutoResumeCountdown(s);
              await new Promise((r) => setTimeout(r, 1000));
            }
            setAutoResumeCountdown(null);
            setTranslateError('');
            isResumingRef.current = true;
            void startTranslate({ ...params, resumeOverride: { pageSlug: page.slug, nextLocale }, onComplete });
            return false;
          }
          return false;
        }
      }
      return true;
    };

    try {
      if (concurrency <= 1) {
        for (let i = 0; i < pageQueue.length; i++) {
          if (hadErrorRef.current) break;
          pageIndex = i;
          const ok = await processPage(pageQueue[i]);
          if (!ok) break;
        }
      } else {
        let nextPageIdx = 0;
        const workers = Array(Math.min(concurrency, pageQueue.length)).fill(null).map(async () => {
          while (!hadErrorRef.current && !abortRef.current?.signal?.aborted) {
            const idx = nextPageIdx++;
            if (idx >= pageQueue.length) break;
            pageIndex = idx;
            await processPage(pageQueue[idx]);
          }
        });
        await Promise.all(workers);
      }
      hadError = hadErrorRef.current;
    } finally {
      if (!isResumingRef.current) {
        setTranslateProgress(null);
        setTranslatePauseCountdown(null);
        abortRef.current = null;
      }
      isResumingRef.current = false;
      if (!hadError) {
        setTranslatePausedAt(null);
        setTranslateStartFrom('');
        setTranslateSuccess(`Zakończono tłumaczenie treści: ${totalSteps} języków na ${pagesTranslatedCountRef.current} stron(ach).`);
        onComplete?.();
      }
    }
  }, [translatePausedAt]);

  const value: TranslateContextValue = {
    translateProgress,
    translatePauseCountdown,
    translatePausedAt,
    translateStartFrom,
    setTranslateStartFrom,
    translateError,
    translateSuccess,
    setTranslateSuccess,
    autoResumeCountdown,
    setAutoResumeCountdown,
    startTranslate,
    pauseTranslate,
    clearPaused,
  };

  return (
    <TranslateContext.Provider value={value}>
      {children}
      <TranslateProgressIndicator />
    </TranslateContext.Provider>
  );
}

function TranslateProgressIndicator() {
  const ctx = useContext(TranslateContext);
  if (!ctx) return null;
  const { translateProgress, translatePauseCountdown, pauseTranslate } = ctx;
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!translateProgress?.startedAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(id);
  }, [translateProgress?.startedAt]);
  if (!translateProgress) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'var(--bg-primary, #1a1a2e)',
        borderBottom: '2px solid var(--primary, #2563eb)',
        padding: '0.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', flex: 1 }}>
          🔄 Tłumaczenie w tle: {translateProgress.current}/{translateProgress.total}{translateProgress.pageTitle ? ` — ${translateProgress.pageTitle} (${translateProgress.locale})` : ''}
          {translateProgress.startedAt && (
            <span style={{ marginLeft: '0.5rem', color: 'var(--text-tertiary)' }}>
              (running {Math.floor((Date.now() - translateProgress.startedAt) / 60000)}m {Math.floor(((Date.now() - translateProgress.startedAt) % 60000) / 1000)}s)
            </span>
          )}
          {translatePauseCountdown !== null && (
            <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>• Pauza {translatePauseCountdown}s</span>
          )}
        </span>
        <button
          type="button"
          onClick={pauseTranslate}
          className="btn btn-secondary btn-sm"
          style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)' }}
        >
          Cancel
        </button>
      </div>
      <div style={{ height: 6, backgroundColor: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${translateProgress.total > 0 ? (translateProgress.current / translateProgress.total) * 100 : 0}%`,
            backgroundColor: 'var(--primary, #2563eb)',
            transition: 'width 0.2s ease',
          }}
        />
      </div>
    </div>
  );
}
