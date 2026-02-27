'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ADMIN_LOCALES } from '@/lib/admin-locales';

const STORAGE_KEY = 'twojastara-translate-paused';
const PAUSE_BETWEEN_LOCALES_SEC = 3;

function parseJson<T>(val: unknown, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === 'string') {
    try { return JSON.parse(val) as T; } catch { return fallback; }
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

type TranslateProgress = {
  current: number;
  total: number;
  pageTitle: string;
  locale: string;
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
  autoResumeCountdown: number | null;
  setAutoResumeCountdown: (v: number | null) => void;
  startTranslate: (params: {
    pages: Page[];
    selectedIds: Set<string>;
    translateStartFrom: string;
    translateOnlyOne: boolean;
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
    timeoutMs = 36_000_000,
    retries = 2,
    signal?: AbortSignal | null
  ): Promise<Response> {
    for (let attempt = 0; attempt <= retries; attempt++) {
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
    resumeOverride?: TranslatePausedAt;
    autoResumeOnError: boolean;
    onPagesUpdate?: (updater: (prev: Page[]) => Page[]) => void;
    onComplete?: () => void;
  }) => {
    const { pages, selectedIds, translateOnlyOne, resumeOverride, autoResumeOnError, onPagesUpdate, onComplete } = params;
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
    let step = 0;
    let totalSteps = 0;
    let pagesTranslatedCount = 0;
    setTranslateProgress({ current: 0, total: 1, pageTitle: '', locale: '' });
    let hadError = false;

    try {
      for (const page of pagesWithEn) {
        const enTrans = page.translations.find((t) => t.locale === 'en');
        const enContent = (enTrans?.content ?? '').trim();
        const enFaqItems = parseJson<{ question: string; answer: string }[]>(enTrans?.faqItems, []);
        const enTitle = (enTrans?.title ?? '').trim();
        const enDisplayTitle = (enTrans?.displayTitle ?? '').trim();
        if (!enContent) continue;

        const pageRes = await fetch(`/api/twojastara/pages/${page.id}`);
        const fullPage = await pageRes.json();
        if (!pageRes.ok || !fullPage?.translations) {
          setTranslateError(`Nie udało się załadować strony: ${page.slug}`);
          hadError = true;
          break;
        }

        const fullPageTrans = fullPage.translations ?? [];
        const hasContent = (loc: string) => (fullPageTrans.find((t: { locale: string }) => t.locale === loc)?.content?.trim() ?? '').length > 0;
        let localesToTranslate = (allNonEn ?? []).filter((loc) => !hasContent(loc));
        console.log('[TranslateContext] page:', page.slug, 'allNonEn:', allNonEn?.length, 'localesToTranslate:', localesToTranslate?.length);
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
          // Only apply "Start from" filter when user chose "Only this language" — otherwise translate ALL missing locales (full run)
          const ane = allNonEn ?? [];
          const startIdx = ane.indexOf(effectiveStart);
          localesToTranslate = (localesToTranslate ?? []).filter((loc) => ane.indexOf(loc) >= startIdx);
        }
        if (translateOnlyOne) {
          localesToTranslate = (localesToTranslate?.includes?.(effectiveStart) ?? false) ? [effectiveStart] : [];
        }
        if (localesToTranslate.length === 0) continue;

        totalSteps += localesToTranslate.length;
        pagesTranslatedCount++;

        const enFromFull = fullPage.translations?.find((x: { locale: string }) => x.locale === 'en') as { title?: string; displayTitle?: string; description?: string } | undefined;
        const enTitleFallback = (enFromFull?.title ?? '').trim() || 'Untitled';
        const enDescription = (enFromFull?.description ?? enTrans?.description ?? '').trim();
        const translatedByLocale: Record<string, { content: string; title?: string; displayTitle?: string; description?: string; faqItems?: { question: string; answer: string }[] }> = {};

        for (const loc of localesToTranslate) {
          step++;
          setTranslateProgress({ current: step, total: totalSteps, pageTitle: page.slug, locale: loc });
          try {
            const res = await fetchWithTimeoutAndRetry(
              '/api/twojastara/ollama/translate',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: enContent, faqItems: enFaqItems, targetLocale: loc, title: enTitle || undefined, displayTitle: enDisplayTitle || undefined, description: enDescription || undefined }),
                credentials: 'include',
              },
              36_000_000,
              2,
              abortRef.current?.signal ?? null
            );
            let data: { error?: string; content?: string; title?: string; displayTitle?: string; description?: string; faqItems?: unknown[] };
            try { data = await res.json(); } catch {
              throw new Error(res.status === 401 ? 'Unauthorized' : `Błąd serwera (${res.status})`);
            }
            if (!res.ok) throw new Error(data.error || `Failed to translate to ${loc}`);
            translatedByLocale[loc] = {
              content: data.content ?? '',
              title: data.title,
              displayTitle: data.displayTitle,
              description: data.description,
              faqItems: Array.isArray(data.faqItems) ? (data.faqItems as { question: string; answer: string }[]) : undefined,
            };

            const baseMap = new Map((fullPage.translations ?? []).map((t: { locale: string }) => [t.locale, t]));
            for (const l of Object.keys(translatedByLocale)) {
              if (!baseMap.has(l)) baseMap.set(l, { locale: l, title: '', displayTitle: null, description: null, content: null, relatedCalculators: [], faqItems: [], calculatorLabels: {} });
            }
            const translations = Array.from(baseMap.values()).map((t: { locale: string; title: string; displayTitle?: string | null; description?: string | null; content?: string | null; relatedCalculators?: unknown; faqItems?: unknown; calculatorLabels?: unknown }) => {
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
            });
            if (!patchRes.ok) throw new Error((await patchRes.json()).error || 'Failed to save');

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

            if ((localesToTranslate?.indexOf(loc) ?? -1) < (localesToTranslate?.length ?? 0) - 1 || page !== pagesWithEn[pagesWithEn.length - 1]) {
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
            const nextLocale = loc;
            setTranslatePausedAt({ pageSlug: page.slug, nextLocale });
            setTranslateStartFrom(nextLocale);
            setTranslateError(`Strona: ${page.slug}, Język: ${loc}. ${msg} — Kliknij Resume.`);
            hadError = true;
            if (autoResumeOnError && !isAbort) {
              setAutoResumeCountdown(5);
              for (let s = 5; s >= 1; s--) {
                setAutoResumeCountdown(s);
                await new Promise((r) => setTimeout(r, 1000));
              }
              setAutoResumeCountdown(null);
              setTranslateError('');
              isResumingRef.current = true;
              return startTranslate({ ...params, resumeOverride: { pageSlug: page.slug, nextLocale }, onComplete });
            }
            break;
          }
        }
        if (hadError) break;
      }
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
        setTranslateSuccess(`✓ Zakończono — przetłumaczono ${totalSteps} języków (${pagesTranslatedCount} stron).`);
        setTimeout(() => setTranslateSuccess(''), 8000);
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
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', flex: 1 }}>
        🔄 Tłumaczenie w tle: {translateProgress.pageTitle} ({translateProgress.locale}) — {translateProgress.current}/{translateProgress.total}
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
        Pause
      </button>
    </div>
  );
}
