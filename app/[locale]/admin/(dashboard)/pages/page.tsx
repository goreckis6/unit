'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ADMIN_LOCALES, LOCALE_NAMES } from '@/lib/admin-locales';
import { useTranslate } from '../../TranslateContext';
import { useGenerate, type GenerateProviderType } from '../../GenerateContext';

export type PageStage = 'new' | 'in-progress' | 'translate-label' | 'completed';

function hasEnContent(page: Page): boolean {
  const en = page.translations.find((t) => t.locale === 'en');
  return !!(en?.content && en.content.trim().length > 0);
}

function hasAllTranslations(page: Page): boolean {
  const localeSet = new Set(page.translations.filter((t) => t.content?.trim()).map((t) => t.locale));
  return ADMIN_LOCALES.every((loc) => localeSet.has(loc));
}

function getPageStage(page: Page): PageStage {
  if (!hasEnContent(page)) return 'new';
  if (!hasAllTranslations(page)) return 'in-progress';
  return 'completed';
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
  calculatorCode?: string | null;
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
    setAutoResumeCountdown,
    startTranslate,
    pauseTranslate,
    clearPaused,
  } = useTranslate();
  const {
    generateProgress,
    generateError,
    generateSuccess,
    pauseGenerate,
    startGenerate,
  } = useGenerate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [translateOnlyOne, setTranslateOnlyOne] = useState(false);
  const [autoResumeOnError, setAutoResumeOnError] = useState(true);
  const [generateProvider, setGenerateProvider] = useState<GenerateProviderType>('ollama');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportJson, setBulkImportJson] = useState('');
  const [bulkImportLoading, setBulkImportLoading] = useState(false);
  const [bulkImportResult, setBulkImportResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkPublishLoading, setBulkPublishLoading] = useState(false);
  const [translateLabelsLoading, setTranslateLabelsLoading] = useState(false);
  const [translateLabelsProgress, setTranslateLabelsProgress] = useState<{ current: number; total: number; pageSlug: string; pageCategory: string; locale: string } | null>(null);
  const [translateLabelsPausedAt, setTranslateLabelsPausedAt] = useState<{ pageSlug: string; nextLocale: string } | null>(null);
  const [translateLabelsSuccess, setTranslateLabelsSuccess] = useState('');
  const translateLabelsPausedRef = useRef(false);
  const translateLabelsAbortRef = useRef<AbortController | null>(null);
  const [generatedIdsThisRun, setGeneratedIdsThisRun] = useState<Set<string>>(new Set());
  const [activeBookmark, setActiveBookmark] = useState<PageStage>('new');

  function setBookmark(stage: PageStage) {
    setActiveBookmark(stage);
    setSelectedIds(new Set());
  }

  const pagesByStage = useMemo(() => {
    const byStage: Record<PageStage, Page[]> = { new: [], 'in-progress': [], 'translate-label': [], completed: [] };
    const translateLabelSlugs = new Set<string>();
    if (translateLabelsProgress?.pageSlug) translateLabelSlugs.add(translateLabelsProgress.pageSlug);
    if (translateLabelsPausedAt?.pageSlug) translateLabelSlugs.add(translateLabelsPausedAt.pageSlug);
    for (const p of pages) {
      if (translateLabelSlugs.has(p.slug)) {
        byStage['translate-label'].push(p);
      } else {
        byStage[getPageStage(p)].push(p);
      }
    }
    return byStage;
  }, [pages, translateLabelsProgress?.pageSlug, translateLabelsPausedAt?.pageSlug]);

  const filteredPages = pagesByStage[activeBookmark];

  useEffect(() => {
    fetch('/api/twojastara/pages')
      .then((res) => res.json())
      .then((data) => {
        setPages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (translateLabelsProgress || translateLabelsPausedAt) {
      setActiveBookmark('translate-label');
    }
  }, [translateLabelsProgress?.pageSlug, translateLabelsPausedAt?.pageSlug]);

  const prevTranslateLabelsLoading = useRef(false);
  useEffect(() => {
    const wasLoading = prevTranslateLabelsLoading.current;
    prevTranslateLabelsLoading.current = translateLabelsLoading;
    if (wasLoading && !translateLabelsLoading) {
      setActiveBookmark('completed');
    }
  }, [translateLabelsLoading]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredPages.length && filteredPages.every((p) => selectedIds.has(p.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPages.map((p) => p.id)));
    }
  }

  async function handleBulkPublish(published: boolean) {
    if (selectedIds.size === 0) return;
    setBulkPublishLoading(true);
    try {
      const res = await fetch('/api/twojastara/pages/bulk-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), published }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Bulk publish failed');
        return;
      }
      setPages((prev) =>
        prev.map((p) => (selectedIds.has(p.id) ? { ...p, published } : p))
      );
      setSelectedIds(new Set());
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Bulk publish failed');
    } finally {
      setBulkPublishLoading(false);
    }
  }

  async function handleBulkTranslateLabels() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const toProcess = pages.filter((p) => ids.includes(p.id) && (p.calculatorCode ?? '').trim());
    const withEnLabels = toProcess.filter((p) => {
      const en = p.translations.find((t) => t.locale === 'en');
      const lab = parseJson<Record<string, string>>(en?.calculatorLabels, {});
      return Object.values(lab).some((v) => v?.trim());
    });
    if (withEnLabels.length === 0) {
      alert('Select pages with Calculator code and EN labels filled. Edit a page, add labels for [en], then try again.');
      return;
    }
    const allNonEn = ADMIN_LOCALES.filter((l) => l !== 'en');
    setTranslateLabelsLoading(true);
    setTranslateLabelsProgress(null);
    setTranslateLabelsPausedAt(null);
    translateLabelsPausedRef.current = false;
    translateLabelsAbortRef.current = new AbortController();
    let step = 0;
    let totalSteps = withEnLabels.length * allNonEn.length;
    try {
      for (const page of withEnLabels) {
        if (translateLabelsAbortRef.current?.signal.aborted) break;
        const enTrans = page.translations.find((t) => t.locale === 'en');
        const enLabels = parseJson<Record<string, string>>(enTrans?.calculatorLabels, {});
        if (!Object.values(enLabels).some((v) => v?.trim())) continue;

        const pageRes = await fetch(`/api/twojastara/pages/${page.id}`);
        const fullPage = await pageRes.json();
        if (!pageRes.ok || !fullPage?.translations) continue;

        const fullTrans = fullPage.translations ?? [];
        const existingLocales = new Set(fullTrans.map((t: { locale: string }) => t.locale));
        const localesToTranslate = allNonEn.filter((l) => existingLocales.has(l));
        if (localesToTranslate.length === 0) continue;

        const translatedLabelsByLocale: Record<string, Record<string, string>> = {};
        for (const t of fullTrans) {
          translatedLabelsByLocale[t.locale] = parseJson<Record<string, string>>(t.calculatorLabels, {});
        }

        for (const loc of localesToTranslate) {
          if (translateLabelsAbortRef.current?.signal.aborted) break;
          if (translateLabelsPausedRef.current) {
            setTranslateLabelsPausedAt({ pageSlug: page.slug, nextLocale: loc });
            while (translateLabelsPausedRef.current && !translateLabelsAbortRef.current?.signal.aborted) {
              await new Promise((r) => setTimeout(r, 300));
            }
            setTranslateLabelsPausedAt(null);
            if (translateLabelsAbortRef.current?.signal.aborted) break;
          }
          step++;
          setTranslateLabelsProgress({ current: step, total: totalSteps, pageSlug: page.slug, pageCategory: page.category ?? 'math', locale: loc });
          let res: Response;
          for (let attempt = 0; attempt <= 2; attempt++) {
            res = await fetch('/api/twojastara/ollama/translate-labels', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ labels: enLabels, targetLocale: loc }),
              credentials: 'include',
              signal: translateLabelsAbortRef.current?.signal,
            });
            if (res.ok || attempt >= 2) break;
            await new Promise((r) => setTimeout(r, 2000)); // retry after 2s
          }
          const data = await res!.json();
          if (!res.ok) throw new Error(data.error || `Translate labels to ${loc} failed`);
          translatedLabelsByLocale[loc] = data.labels ?? {};

          // Save immediately after each locale so user can preview right away
          const translations = fullTrans.map((t: { locale: string; title: string; displayTitle?: string | null; description?: string | null; content?: string | null; relatedCalculators?: unknown; faqItems?: unknown; calculatorLabels?: unknown }) => ({
            locale: t.locale,
            title: t.title ?? '',
            displayTitle: t.displayTitle ?? null,
            description: t.description ?? null,
            content: t.content ?? null,
            relatedCalculators: parseJson<{ title: string; description: string; path: string }[]>(t.relatedCalculators, []),
            faqItems: parseJson<{ question: string; answer: string }[]>(t.faqItems, []),
            calculatorLabels: translatedLabelsByLocale[t.locale] ?? parseJson<Record<string, string>>(t.calculatorLabels, {}),
          }));
          const patchRes = await fetch(`/api/twojastara/pages/${page.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug: fullPage.slug,
              category: fullPage.category,
              published: fullPage.published,
              calculatorCode: fullPage.calculatorCode,
              linkedCalculatorPath: fullPage.linkedCalculatorPath,
              relatedCalculatorsMode: fullPage.relatedCalculatorsMode ?? 'manual',
              relatedCalculatorsCount: fullPage.relatedCalculatorsCount ?? 6,
              translations,
            }),
            credentials: 'include',
          });
          if (!patchRes.ok) throw new Error((await patchRes.json()).error || `Failed to save page after ${loc}`);

          setPages((prev) =>
            prev.map((p) => {
              if (p.id !== page.id) return p;
              const updated = p.translations.map((t) => {
                const lab = translatedLabelsByLocale[t.locale];
                return lab && Object.keys(lab).length ? { ...t, calculatorLabels: JSON.stringify(lab) } : t;
              });
              return { ...p, translations: updated };
            })
          );
        }
      }
      setSelectedIds(new Set());
      setTranslateLabelsSuccess(`Translated labels for ${withEnLabels.length} page(s)`);
      setTimeout(() => setTranslateLabelsSuccess(''), 5000);
    } catch (e) {
      const isAbort = e instanceof Error && e.name === 'AbortError';
      if (!isAbort) alert(e instanceof Error ? e.message : 'Translate labels failed');
    } finally {
      setTranslateLabelsLoading(false);
      setTranslateLabelsProgress(null);
      setTranslateLabelsPausedAt(null);
      translateLabelsAbortRef.current = null;
    }
  }

  function pauseTranslateLabels() {
    translateLabelsPausedRef.current = true;
  }

  function resumeTranslateLabels() {
    translateLabelsPausedRef.current = false;
  }

  function abortTranslateLabels() {
    translateLabelsAbortRef.current?.abort();
  }

  function handleBatchGenerate() {
    setGeneratedIdsThisRun(new Set());
    startGenerate({
      pages,
      selectedIds,
      provider: generateProvider,
      autoResumeOnError,
      onPagesUpdate: (updater) => setPages(updater),
      onPageGenerated: (id) => setGeneratedIdsThisRun((prev) => new Set([...prev, id])),
      onComplete: () => setSelectedIds(new Set()),
    });
  }

  function handleBatchTranslate() {
    startTranslate({
      pages,
      selectedIds,
      translateStartFrom,
      translateOnlyOne,
      resumeOverride: translatePausedAt ?? undefined,
      autoResumeOnError,
      onPagesUpdate: (updater) => setPages(updater),
      onComplete: () => setSelectedIds(new Set()),
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this page?')) return;
    const res = await fetch(`/api/twojastara/pages/${id}`, { method: 'DELETE' });
    if (res.ok) setPages((p) => p.filter((x) => x.id !== id));
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected page(s)? This cannot be undone.`)) return;
    setBulkDeleteLoading(true);
    try {
      const res = await fetch('/api/twojastara/pages/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Bulk delete failed');
        return;
      }
      setPages((p) => p.filter((x) => !selectedIds.has(x.id)));
      setSelectedIds(new Set());
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Bulk delete failed');
    } finally {
      setBulkDeleteLoading(false);
    }
  }

  async function handleBulkImport() {
    setBulkImportResult(null);
    let items: unknown[];
    try {
      const parsed = JSON.parse(bulkImportJson);
      items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : [];
    } catch {
      setBulkImportResult({ type: 'error', msg: 'Invalid JSON' });
      return;
    }
    if (items.length === 0) {
      setBulkImportResult({ type: 'error', msg: 'No items. Use format: [{ "category": "math", "slug": "my-page", "title": "SEO Title", "displayTitle": "H1 Title", "description": "Meta description" }, ...]' });
      return;
    }
    setBulkImportLoading(true);
    try {
      const res = await fetch('/api/twojastara/pages/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setBulkImportResult({ type: 'error', msg: data.error || 'Import failed' });
        return;
      }
      setBulkImportResult({ type: 'success', msg: data.message || `Created ${data.created}, skipped ${data.skipped}` });
      setBulkImportJson('');
      const listRes = await fetch('/api/twojastara/pages');
      const listData = await listRes.json();
      if (Array.isArray(listData)) setPages(listData);
    } catch (e) {
      setBulkImportResult({ type: 'error', msg: e instanceof Error ? e.message : 'Import failed' });
    } finally {
      setBulkImportLoading(false);
    }
  }

  function handleBulkImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBulkImportJson(String(reader.result ?? ''));
      setBulkImportResult(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleDownloadTemplate() {
    const template = [
      {
        category: 'math',
        slug: 'fractions-averaging',
        title: 'Fractions Averaging Calculator - Free Online Tool | Site Name',
        displayTitle: 'Fractions Averaging Calculator',
        description: 'Calculate the average of multiple fractions instantly. Free online tool.',
      },
      {
        category: 'electric',
        slug: 'amp-to-kw-converter',
        title: 'Amps to kW Converter | Free Calculator',
        displayTitle: 'Amps to kW Converter',
        description: 'Convert amperes to kilowatts easily. Free online calculator.',
      },
    ];
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pages-bulk-import-template.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Loading pages...</p>;

  const selectedCount = selectedIds.size;

  const bookmarkTabs: { stage: PageStage; label: string; count: number }[] = [
    { stage: 'new', label: 'New', count: pagesByStage.new.length },
    { stage: 'in-progress', label: 'In progress', count: pagesByStage['in-progress'].length },
    { stage: 'translate-label', label: 'Translate labels', count: pagesByStage['translate-label'].length },
    { stage: 'completed', label: 'Completed', count: pagesByStage.completed.length },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Pages</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {pages.length > 0 && (
            <>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                disabled={!!generateProgress || !!translateProgress || !!translateLabelsLoading || filteredPages.length === 0}
              >
                {filteredPages.every((p) => selectedIds.has(p.id)) && filteredPages.length > 0
                  ? 'Odznacz wszystko'
                  : 'Zaznacz wszystko'}
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={selectedCount === 0 || !!generateProgress || !!translateProgress || !!translateLabelsLoading || bulkDeleteLoading}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem', color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
              >
                {bulkDeleteLoading ? 'Deleting…' : `Delete (${selectedCount})`}
              </button>
              <select
                value={generateProvider}
                onChange={(e) => setGenerateProvider(e.target.value as GenerateProviderType)}
                disabled={!!generateProgress || !!translateProgress || !!translateLabelsLoading}
                className="admin-form-select"
                style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
              >
                <option value="ollama">Ollama</option>
                <option value="claude">Claude 4.6</option>
              </select>
              {generateProgress && (
                <button
                  type="button"
                  onClick={pauseGenerate}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.35rem 0.75rem', borderColor: 'var(--error-color)', color: 'var(--error-color)' }}
                >
                  Pause
                </button>
              )}
              <button
                type="button"
                onClick={handleBatchGenerate}
                disabled={selectedCount === 0 || !!generateProgress || !!translateProgress || !!translateLabelsLoading}
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
                    {translateLabelsProgress && !translateLabelsPausedAt && (
                      <>
                        <button
                          type="button"
                          onClick={pauseTranslateLabels}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.75rem', borderColor: 'var(--error-color)', color: 'var(--error-color)' }}
                        >
                          Pause
                        </button>
                        <button
                          type="button"
                          onClick={abortTranslateLabels}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.75rem', color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {translateLabelsPausedAt && (
                      <>
                        <button
                          type="button"
                          onClick={resumeTranslateLabels}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.35rem 0.75rem' }}
                        >
                          Resume
                        </button>
                        <button
                          type="button"
                          onClick={abortTranslateLabels}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.75rem', color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={handleBulkTranslateLabels}
                      disabled={selectedCount === 0 || !!generateProgress || !!translateProgress || !!translateLabelsLoading}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem 0.75rem' }}
                      title="Translate Calculator labels from EN to all other languages (Ollama). Limit: ~15 min na żądanie. Przy timeout — spróbuj ponownie lub skróć treść. Retry: 2x."
                    >
                      {translateLabelsLoading ? 'Translate Labels…' : 'Translate Labels'}
                    </button>
                    <button
                      type="button"
                      onClick={handleBatchTranslate}
                disabled={
                  selectedCount === 0 ||
                  !!generateProgress ||
                  !!translateProgress ||
                  !!translateLabelsLoading
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
          <button
            type="button"
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem' }}
          >
            {showBulkImport ? '−' : '+'} Bulk Import JSON
          </button>
        </div>
      </div>

      {pages.length > 0 && (
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          {bookmarkTabs.map(({ stage, label, count }) => (
            <button
              key={stage}
              type="button"
              onClick={() => setBookmark(stage)}
              style={{
                padding: '0.6rem 1rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                border: 'none',
                borderBottom: activeBookmark === stage ? '2px solid var(--primary, #2563eb)' : '2px solid transparent',
                background: activeBookmark === stage ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                color: activeBookmark === stage ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                borderRadius: '0.5rem 0.5rem 0 0',
              }}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      )}

      {activeBookmark === 'completed' && filteredPages.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleBulkPublish(true)}
            disabled={selectedIds.size === 0 || bulkPublishLoading || !!generateProgress || !!translateProgress}
            className="btn btn-primary btn-sm"
            style={{ padding: '0.35rem 0.75rem' }}
          >
            {bulkPublishLoading ? 'Publishing…' : `Mark & Publish (${selectedIds.size})`}
          </button>
          <button
            type="button"
            onClick={() => handleBulkPublish(false)}
            disabled={selectedIds.size === 0 || bulkPublishLoading || !!generateProgress || !!translateProgress}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.75rem' }}
          >
            Unpublish ({selectedIds.size})
          </button>
        </div>
      )}

      {showBulkImport && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1.25rem',
            background: 'var(--bg-tertiary)',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Upload or paste JSON. Each item: <code>category</code>, <code>slug</code>, <code>title</code> (SEO), <code>displayTitle</code> (H1), <code>description</code> (meta).
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="btn btn-secondary btn-sm"
            >
              Download template
            </button>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
              Choose JSON file
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleBulkImportFile}
                style={{ display: 'none' }}
              />
            </label>
            <button
              type="button"
              onClick={handleBulkImport}
              disabled={bulkImportLoading || !bulkImportJson.trim()}
              className="btn btn-primary btn-sm"
            >
              {bulkImportLoading ? 'Importing…' : 'Import'}
            </button>
          </div>
          <textarea
            value={bulkImportJson}
            onChange={(e) => { setBulkImportJson(e.target.value); setBulkImportResult(null); }}
            placeholder={`[\n  { "category": "math", "slug": "my-calculator", "title": "SEO Title Here", "displayTitle": "H1 Title", "description": "Meta description" },\n  ...\n]`}
            style={{
              width: '100%',
              minHeight: 120,
              padding: '0.75rem',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              background: 'var(--bg-primary)',
              resize: 'vertical',
            }}
          />
          {bulkImportResult && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.5rem 0.75rem',
                borderRadius: 6,
                background: bulkImportResult.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                color: bulkImportResult.type === 'success' ? 'var(--success-color)' : 'var(--error-color)',
                fontSize: '0.875rem',
              }}
            >
              {bulkImportResult.msg}
            </div>
          )}
        </div>
      )}

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
        {(generateSuccess || translateSuccess || translateLabelsSuccess) && (
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
          {generateSuccess || translateSuccess || translateLabelsSuccess}
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

      {translateLabelsProgress && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span>Translate Labels: {translateLabelsProgress.current} / {translateLabelsProgress.total} — {translateLabelsProgress.pageSlug} ({translateLabelsProgress.locale})</span>
            {translateLabelsPausedAt && <span style={{ color: 'var(--warning-color, #f97316)' }}>• Paused</span>}
            <a
              href={translateLabelsProgress.locale === 'en' ? `/calculators/${translateLabelsProgress.pageCategory}/${translateLabelsProgress.pageSlug}?preview=1` : `/${translateLabelsProgress.locale}/calculators/${translateLabelsProgress.pageCategory}/${translateLabelsProgress.pageSlug}?preview=1`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: '0.25rem', fontSize: '0.8rem', color: 'var(--primary)' }}
            >
              Preview →
            </a>
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
                width: `${translateLabelsProgress.total > 0 ? (translateLabelsProgress.current / translateLabelsProgress.total) * 100 : 0}%`,
                backgroundColor: 'var(--primary, #2563eb)',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            Keep this tab open. You can switch to other tabs; don&apos;t close or navigate away.
          </div>
        </div>
      )}

      {pages.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No pages yet. Create your first page.</p>
      ) : filteredPages.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>
          No pages in <strong>{activeBookmark === 'new' ? 'New' : activeBookmark === 'in-progress' ? 'In progress' : activeBookmark === 'translate-label' ? 'Translate labels' : 'Completed'}</strong>. Switch tab or create a page.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredPages.map((page) => {
            const enTitle = page.translations.find((t) => t.locale === 'en')?.title ?? page.slug;
            const isSelected = selectedIds.has(page.id);
            const isGeneratedThisRun = generatedIdsThisRun.has(page.id);
            return (
              <div
                key={page.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  background: isGeneratedThisRun ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-primary)',
                  borderRadius: '1rem',
                  border: `2px solid ${isSelected ? 'var(--primary, #2563eb)' : isGeneratedThisRun ? 'var(--success-color, #10b981)' : 'var(--border-light)'}`,
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
