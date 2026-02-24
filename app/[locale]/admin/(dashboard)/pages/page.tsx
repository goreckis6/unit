'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ADMIN_LOCALES, LOCALE_NAMES } from '@/lib/admin-locales';
import { useTranslate } from '../../TranslateContext';
import { useGenerate, type GenerateProviderType } from '../../GenerateContext';

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
    setAutoResumeCountdown,
    startTranslate,
    pauseTranslate,
    clearPaused,
  } = useTranslate();
  const {
    generateProgress,
    generateError,
    generateSuccess,
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
  const [generatedIdsThisRun, setGeneratedIdsThisRun] = useState<Set<string>>(new Set());

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
                onClick={handleBulkDelete}
                disabled={selectedCount === 0 || !!generateProgress || !!translateProgress || bulkDeleteLoading}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem', color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
              >
                {bulkDeleteLoading ? 'Deleting…' : `Delete (${selectedCount})`}
              </button>
              <select
                value={generateProvider}
                onChange={(e) => setGenerateProvider(e.target.value as GenerateProviderType)}
                disabled={!!generateProgress || !!translateProgress}
                className="admin-form-select"
                style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
              >
                <option value="ollama">Ollama</option>
                <option value="claude">Claude 4.6</option>
              </select>
              <button
                type="button"
                onClick={handleBatchGenerate}
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
