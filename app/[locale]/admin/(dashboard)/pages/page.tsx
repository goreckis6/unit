'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ADMIN_LOCALES, LOCALE_NAMES } from '@/lib/admin-locales';
import { useTranslate } from '../../TranslateContext';

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

export default function AdminPagesList() {
  const {
    translateProgress,
    translatePauseCountdown,
    translatePausedAt,
    translateStartFrom,
    setTranslateStartFrom,
    translateError,
    translateSuccess,
    autoResumeCountdown,
    startTranslate,
    pauseTranslate,
    clearPaused,
  } = useTranslate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generateProgress, setGenerateProgress] = useState<{ current: number; total: number; title: string } | null>(null);
  const [generateError, setGenerateError] = useState('');
  const [generateSuccess, setGenerateSuccess] = useState('');
  const [translateOnlyOne, setTranslateOnlyOne] = useState(false);
  const [autoResumeOnError, setAutoResumeOnError] = useState(true);
  const autoResumeOnErrorRef = useRef(autoResumeOnError);
  autoResumeOnErrorRef.current = autoResumeOnError;

  useEffect(() => {
    fetch('/api/twojastara/pages')
      .then((res) => res.json())
      .then((data) => {
        setPages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === pages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pages.map((p) => p.id)));
    }
  }

  async function fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs = 900_000
  ): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
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

  async function handleBatchGenerateContent(resumeFromPageSlug?: string) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      setGenerateError('Zaznacz co najmniej jedną stronę.');
      return;
    }
    setGenerateError('');
    setGenerateSuccess('');
    const selectedPages = pages.filter((p) => ids.includes(p.id));
    const startIdx = resumeFromPageSlug ? Math.max(0, selectedPages.findIndex((p) => p.slug === resumeFromPageSlug)) : 0;
    const finalPages = selectedPages.slice(startIdx);
    setGenerateProgress({ current: 0, total: finalPages.length, title: '' });
    let hadError = false;
    for (let i = 0; i < finalPages.length; i++) {
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
          }
        );
        let genData: { error?: string; content?: string; faqItems?: unknown[] };
        try {
          genData = await genRes.json();
        } catch {
          throw new Error(genRes.status === 401 ? 'Unauthorized — zaloguj się ponownie' : `Błąd serwera (${genRes.status})`);
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
          const relatedCalculators = parseJson<{ title: string; description: string; path: string }[]>(t.relatedCalculators, []);
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

        setPages((prev) =>
          prev.map((p) => {
            if (p.id !== page.id) return p;
            const hasEnInPage = p.translations.some((t) => t.locale === 'en');
            const updated = p.translations.map((t) =>
              t.locale === 'en'
                ? { ...t, content: newContent, faqItems: newFaqItems.length > 0 ? JSON.stringify(newFaqItems) : t.faqItems }
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
        const msg = err instanceof Error
          ? (err.name === 'AbortError' ? 'Timeout — limit 15 min.' : err.message)
          : 'Błąd generowania';
        setGenerateError(`Strona: ${page.slug}. ${msg} — Zaznacz tę stronę (i ewentualnie następne) i kliknij Generate Content, aby spróbować od początku.`);
        hadError = true;
        if (autoResumeOnErrorRef.current) {
          const delaySec = 5;
          setAutoResumeCountdown(delaySec);
          for (let s = delaySec; s >= 1; s--) {
            setAutoResumeCountdown(s);
            await new Promise((r) => setTimeout(r, 1000));
          }
          setAutoResumeCountdown(null);
          setGenerateError('');
          return handleBatchGenerateContent(page.slug);
        }
        break;
      }
    }
    setGenerateProgress(null);
    if (!hadError) {
      setSelectedIds(new Set());
      setGenerateSuccess(`Wygenerowano treść dla ${finalPages.length} stron.`);
      setTimeout(() => setGenerateSuccess(''), 5000);
    }
  }

  function handleBatchTranslate() {
    startTranslate({
      pages,
      selectedIds,
      translateStartFrom,
      translateOnlyOne,
      resumeOverride: translatePausedAt ?? undefined,
      autoResumeOnError: autoResumeOnErrorRef.current,
      onPagesUpdate: (updater) => setPages(updater),
      onComplete: () => setSelectedIds(new Set()),
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this page?')) return;
    const res = await fetch(`/api/twojastara/pages/${id}`, { method: 'DELETE' });
    if (res.ok) setPages((p) => p.filter((x) => x.id !== id));
  }

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Loading pages...</p>;

  const selectedCount = selectedIds.size;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Pages</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {pages.length > 0 && (
            <>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                disabled={!!generateProgress || !!translateProgress}
              >
                {selectedCount === pages.length ? 'Odznacz wszystko' : 'Zaznacz wszystko'}
              </button>
              <button
                type="button"
                onClick={() => handleBatchGenerateContent()}
                disabled={selectedCount === 0 || !!generateProgress || !!translateProgress}
                className="btn btn-primary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
              >
                {generateProgress ? `Generowanie… (${generateProgress.current}/${generateProgress.total})` : 'Generate Content'}
              </button>
              <label
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={autoResumeOnError}
                  onChange={(e) => setAutoResumeOnError(e.target.checked)}
                  disabled={!!translateProgress || !!generateProgress}
                  style={{ width: 14, height: 14 }}
                />
                Auto-resume przy błędzie (Generate + Translate)
              </label>
              {(() => {
                const allNonEn = ADMIN_LOCALES.filter((l) => l !== 'en');
                const effectiveStart =
                  translateStartFrom && allNonEn.includes(translateStartFrom)
                    ? translateStartFrom
                    : allNonEn[0] ?? '';
                return (
                  <>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      Start from:
                      <select
                        value={effectiveStart}
                        onChange={(e) => setTranslateStartFrom(e.target.value)}
                        disabled={!!translateProgress}
                        className="admin-form-select"
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          minWidth: 100,
                        }}
                      >
                        {allNonEn.map((loc) => (
                          <option key={loc} value={loc}>
                            {LOCALE_NAMES[loc] ?? loc} ({loc})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={translateOnlyOne}
                        onChange={(e) => setTranslateOnlyOne(e.target.checked)}
                        disabled={!!translateProgress}
                        style={{ width: 14, height: 14 }}
                      />
                      Only this language
                    </label>
                    {translateProgress && (
                      <button
                        type="button"
                        onClick={pauseTranslate}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.75rem', borderColor: 'var(--error-color)', color: 'var(--error-color)' }}
                      >
                        Pause
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleBatchTranslate}
                      disabled={
                        selectedCount === 0 ||
                        !!generateProgress ||
                        !!translateProgress
                      }
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem 0.75rem' }}
                    >
                      {translateProgress
                        ? `Tłumaczenie… (${translateProgress.current}/${translateProgress.total})`
                        : translatePausedAt
                          ? `Resume od (${effectiveStart})`
                          : translateOnlyOne
                            ? `Translate only (${effectiveStart})`
                            : 'Translate'}
                    </button>
                  </>
                );
              })()}
            </>
          )}
          <Link href="/twojastara/pages/new" className="btn btn-primary">
            + New Page
          </Link>
        </div>
      </div>
      {pages.length > 0 && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', marginTop: '-0.5rem' }}>
          Limit: ~15 min na żądanie (Ollama). Przy timeout — spróbuj ponownie lub skróć treść. Retry: 2x.
        </p>
      )}

      {translatePausedAt && !translateProgress && (
        <div
          role="status"
          style={{
            marginBottom: '1rem',
            padding: '1rem 1.25rem',
            background: 'rgba(249, 115, 22, 0.15)',
            border: '1px solid var(--warning-color, #f97316)',
            borderRadius: 8,
            color: 'var(--warning-color, #ea580c)',
            fontSize: '0.95rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <span>
            ⏸ <strong>Zatrzymano</strong> na stronie <code>{translatePausedAt.pageSlug}</code>, język {translatePausedAt.nextLocale}.
            Zaznacz strony (od tej) i kliknij <strong>Resume</strong>.
          </span>
          <button
            type="button"
            onClick={clearPaused}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.75rem', flexShrink: 0 }}
          >
            Wyczyść status
          </button>
        </div>
      )}
      {(generateError || translateError) && !autoResumeCountdown && (
        <div
          role="alert"
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--error-color)',
            borderRadius: 8,
            color: 'var(--error-color)',
            fontSize: '0.875rem',
          }}
        >
          {[generateError, translateError].filter(Boolean).join(' ')}
        </div>
      )}
      {autoResumeCountdown !== null && (
        <div
          style={{
            marginBottom: '1rem',
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
            marginBottom: '1rem',
            padding: '1rem 1.25rem',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--success-color, #10b981)',
            borderRadius: 8,
            color: 'var(--success-color, #10b981)',
            fontSize: '0.95rem',
            fontWeight: 500,
          }}
        >
          {generateSuccess || translateSuccess}
        </div>
      )}

      {generateProgress && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {generateProgress.current} / {generateProgress.total} — {generateProgress.title || '…'}
          </div>
          <div
            style={{
              height: 8,
              backgroundColor: 'var(--border-color)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(generateProgress.current / generateProgress.total) * 100}%`,
                backgroundColor: 'var(--primary, #2563eb)',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        </div>
      )}

      {pages.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No pages yet. Create your first page.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {pages.map((page) => {
            const enTitle = page.translations.find((t) => t.locale === 'en')?.title ?? page.slug;
            const isSelected = selectedIds.has(page.id);
            return (
              <div
                key={page.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  background: 'var(--bg-primary)',
                  borderRadius: '1rem',
                  border: `2px solid ${isSelected ? 'var(--primary, #2563eb)' : 'var(--border-light)'}`,
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 200px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(page.id)}
                      disabled={!!generateProgress || !!translateProgress}
                      style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                    />
                  </label>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{enTitle}</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.875rem' }}>
                      /calculators/{page.category}/{page.slug}
                      {page.translations.filter((t) => t.locale !== 'en').length > 0 && (
                        <span style={{ marginLeft: '0.25rem' }}>(e.g. /pl/calculators/{page.category}/{page.slug})</span>
                      )}
                    </span>
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 6,
                        background: page.published ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)',
                        color: page.published ? 'var(--success-color)' : 'var(--text-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      {page.published ? 'Published' : 'Draft'}
                    </span>
                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                      {page.translations.length} locales
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {page.translations.map((t) => {
                    const baseUrl = t.locale === 'en' ? `/en/calculators/${page.category}/${page.slug}` : `/${t.locale}/calculators/${page.category}/${page.slug}`;
                    const href = page.published ? baseUrl : `${baseUrl}?preview=1`;
                    return (
                      <Link
                        key={t.locale}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        Preview ({t.locale})
                      </Link>
                    );
                  })}
                  <Link href={`/twojastara/pages/${page.id}/edit`} className="btn btn-primary btn-sm">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(page.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--error-color)', borderColor: 'var(--error-color)' }}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
