'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ADMIN_LOCALES, LOCALE_NAMES } from '@/lib/admin-locales';
import { useTranslate } from '../../TranslateContext';
import { useGenerate, type GenerateProviderType } from '../../GenerateContext';
import { SeoChecker } from '@/components/admin/SeoChecker';
import { resolveCalculatorPath } from '@/lib/gsc-redirects';

export type PageStage = 'new' | 'content-en-done' | 'translation-done' | 'calculator-done' | 'done' | 'completed-alive';

const LIST_FILTER_STORAGE_KEY = 'twojastara-pages-list-filter';

const OLLAMA_MODELS: { id: string; label: string; desc: string }[] = [
  { id: 'glm-4.6:cloud', label: 'GLM-4.6 (domyślny)', desc: 'Domyślny model. Stabilny, dobre wyniki.' },
  { id: 'gemini-3-flash-preview:cloud', label: 'Gemini 3 Flash', desc: 'Najszybszy model od Google, zoptymalizowany pod kątem niskich opóźnień i ogromnego kontekstu (1 mln tokenów).' },
  { id: 'gemini-3-pro-preview:cloud', label: 'Gemini 3 Pro', desc: 'Potężniejsza wersja Gemini, lepsza w logice i analizie wideo.' },
  { id: 'deepseek-v3.2:671b-cloud', label: 'DeepSeek V3.2 671B', desc: 'Jeden z najpotężniejszych modeli open-weights, dostępny w chmurze ze względu na ogromny rozmiar.' },
  { id: 'qwen3.5:cloud', label: 'Qwen3.5 (cloud)', desc: 'Model Qwen3.5 w chmurze Ollama (ogólny tag :cloud). Dobry do kodowania i zadań agenturalnych.' },
  { id: 'glm-5:cloud', label: 'GLM-5', desc: 'Najnowszy model od Z.ai, zoptymalizowany pod kątem inżynierii systemowej i długich zadań.' },
];

type SortByVal = 'latest' | 'oldest' | 'category' | 'slug';

function getInitialListFilter(searchParams: URLSearchParams): { searchQuery: string; categoryFilter: string; sortBy: SortByVal } {
  if (typeof window === 'undefined') return { searchQuery: '', categoryFilter: '', sortBy: 'latest' };
  const q = searchParams.get('q') ?? '';
  const cat = searchParams.get('category') ?? '';
  const sort = searchParams.get('sort') ?? '';
  if (q || cat || sort) {
    const validSort: SortByVal = ['latest', 'oldest', 'category', 'slug'].includes(sort) ? (sort as SortByVal) : 'latest';
    return { searchQuery: q, categoryFilter: cat, sortBy: validSort };
  }
  try {
    const s = localStorage.getItem(LIST_FILTER_STORAGE_KEY);
    if (s) {
      const v = JSON.parse(s) as Record<string, unknown>;
      const sq = typeof v.searchQuery === 'string' ? v.searchQuery : '';
      const cf = typeof v.categoryFilter === 'string' ? v.categoryFilter : '';
      const sb: SortByVal = ['latest', 'oldest', 'category', 'slug'].includes(String(v.sortBy)) ? (v.sortBy as SortByVal) : 'latest';
      return { searchQuery: sq, categoryFilter: cf, sortBy: sb };
    }
  } catch {
    /* ignore */
  }
  return { searchQuery: '', categoryFilter: '', sortBy: 'latest' };
}

function hasEnContent(page: Page): boolean {
  const en = page.translations.find((t) => t.locale === 'en');
  return !!(en?.content && en.content.trim().length > 0);
}

function hasAllTranslations(page: Page): boolean {
  const localeSet = new Set(page.translations.filter((t) => t.content?.trim()).map((t) => t.locale));
  return ADMIN_LOCALES.every((loc) => localeSet.has(loc));
}

function hasAllLabelsTranslated(page: Page): boolean {
  if (!(page.calculatorCode ?? '').trim()) return true;
  const en = page.translations.find((t) => t.locale === 'en');
  const enLab = parseJson<Record<string, string>>(en?.calculatorLabels, {});
  const enKeys = Object.keys(enLab).filter((k) => enLab[k]?.trim());
  if (enKeys.length === 0) return false;
  for (const loc of ADMIN_LOCALES) {
    const t = page.translations.find((tr) => tr.locale === loc);
    const lab = parseJson<Record<string, string>>(t?.calculatorLabels, {});
    for (const k of enKeys) {
      if (!lab[k]?.trim()) return false;
    }
  }
  return true;
}

/** Unicode ranges for non-Latin scripts. If locale uses these, text must contain them to count as translated. */
const SCRIPT_RANGES: Record<string, RegExp> = {
  zh: /[\u4e00-\u9fff\u3400-\u4dbf]/,           // CJK (Chinese)
  ja: /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/, // Hiragana, Katakana, Kanji
  ko: /[\uac00-\ud7af\u1100-\u11ff]/,            // Hangul
  ar: /[\u0600-\u06ff]/,                         // Arabic
  fa: /[\u0600-\u06ff]/,                         // Persian (Arabic script)
  hi: /[\u0900-\u097f]/,                         // Devanagari (Hindi)
  th: /[\u0e00-\u0e7f]/,                        // Thai
  ru: /[\u0400-\u04ff]/,                        // Cyrillic (Russian)
};

function isLikelyTranslated(text: string, locale: string): boolean {
  if (!text?.trim() || locale === 'en') return true;
  const re = SCRIPT_RANGES[locale];
  if (!re) return true; // Latin-script locales: cannot reliably detect, assume OK
  return re.test(text);
}

function getMissingTranslations(page: Page): string[] {
  const enTrans = page.translations.find((t) => t.locale === 'en');
  const missing: string[] = [];
  for (const loc of ADMIN_LOCALES) {
    if (loc === 'en') continue;
    const t = page.translations.find((tr) => tr.locale === loc);
    const content = t?.content?.trim();
    if (!content) {
      missing.push(loc);
      continue;
    }
    const title = (t?.displayTitle?.trim() || t?.title?.trim()) ?? '';
    const desc = (t?.description?.trim()) ?? '';
    const sample = [title, desc, content.slice(0, 400)].filter(Boolean).join(' ');
    if (!isLikelyTranslated(sample, loc)) missing.push(loc);
  }
  return missing;
}

function getMissingLabels(page: Page): string[] {
  if (!(page.calculatorCode ?? '').trim()) return [];
  const en = page.translations.find((t) => t.locale === 'en');
  const enLab = parseJson<Record<string, string>>(en?.calculatorLabels, {});
  const enKeys = Object.keys(enLab).filter((k) => enLab[k]?.trim());
  if (enKeys.length === 0) return [...ADMIN_LOCALES];
  const missing: string[] = [];
  for (const loc of ADMIN_LOCALES) {
    if (loc === 'en') continue;
    const t = page.translations.find((tr) => tr.locale === loc);
    const lab = parseJson<Record<string, string>>(t?.calculatorLabels, {});
    let ok = true;
    for (const k of enKeys) {
      const val = lab[k]?.trim();
      if (!val) {
        ok = false;
        break;
      }
      if (!isLikelyTranslated(val, loc)) {
        ok = false;
        break;
      }
    }
    if (!ok) missing.push(loc);
  }
  return missing;
}

/** Keys from enLabels that are empty or not translated in target locale */
function getMissingLabelKeysForLocale(
  enLabels: Record<string, string>,
  targetLabels: Record<string, string>,
  targetLocale: string
): string[] {
  const missing: string[] = [];
  for (const k of Object.keys(enLabels)) {
    if (!enLabels[k]?.trim()) continue;
    const val = targetLabels[k]?.trim();
    if (!val || !isLikelyTranslated(val, targetLocale)) missing.push(k);
  }
  return missing;
}

const VALID_MANUAL_BOOKMARKS: PageStage[] = ['content-en-done', 'translation-done', 'calculator-done', 'done', 'completed-alive'];

/** Page has calculator code/link and valid EN labels (at least one non-empty key). */
function hasCalculatorWithEnLabels(page: Page): boolean {
  const hasCalc = !!(page.calculatorCode ?? '').trim() || !!(page.linkedCalculatorPath ?? '').trim();
  if (!hasCalc) return false;
  const en = page.translations.find((t) => t.locale === 'en');
  const enLab = parseJson<Record<string, string>>(en?.calculatorLabels, {});
  const enKeys = Object.keys(enLab).filter((k) => enLab[k]?.trim());
  return enKeys.length > 0;
}

function getPageStage(page: Page): PageStage {
  if (!hasEnContent(page)) return 'new';
  if (!hasAllTranslations(page)) return 'content-en-done';
  const hasCalc = !!(page.calculatorCode ?? '').trim() || !!(page.linkedCalculatorPath ?? '').trim();
  if (!hasCalc) return 'translation-done'; // 24 langs done, next: add calculator + EN labels
  if (!hasCalculatorWithEnLabels(page)) return 'calculator-done';
  if (!hasAllLabelsTranslated(page)) return 'calculator-done';
  return page.published ? 'completed-alive' : 'done'; // Done (TR+LB)
}

/** Stage used for tab placement; manualBookmark overrides. */
function getEffectiveStage(page: Page): PageStage {
  const legacy = { 'in-progress': 'content-en-done', 'translate-label': 'calculator-done', completed: 'done' } as const;
  const bookmark = page.manualBookmark;
  if (bookmark && (VALID_MANUAL_BOOKMARKS.includes(bookmark as PageStage) || bookmark in legacy)) {
    return (legacy[bookmark as keyof typeof legacy] ?? bookmark) as PageStage;
  }
  return getPageStage(page);
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
  linkedCalculatorPath?: string | null;
  manualBookmark?: string | null;
  relatedCalculatorsMode?: string | null;
  relatedCalculatorsCount?: number | null;
  updatedAt?: string;
  translations: PageTranslation[];
};

function sortPagesLatestFirst(pages: Page[]): Page[] {
  return [...pages].sort((a, b) => {
    const aT = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bT = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bT - aT;
  });
}

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

/** Parse response as JSON; if HTML (e.g. 502/404), return { error } to avoid "Unexpected token '<'" */
async function safeResJson(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  const ct = res.headers.get('content-type') ?? '';
  if (text.trimStart().startsWith('<') || !ct.includes('json')) {
    const hint = res.status === 502 || res.status === 503 ? ' — Spróbuj ponownie za chwilę lub zmniejsz Parallel (labels).' : '';
    return { error: `Server returned ${res.status} (expected JSON, got ${ct || 'HTML'})${hint}` };
  }
  try {
    return (JSON.parse(text) as Record<string, unknown>) ?? {};
  } catch {
    return { error: `Invalid JSON response (${res.status})` };
  }
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
    setTranslateSuccess,
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
    setGenerateSuccess,
    pauseGenerate,
    startGenerate,
  } = useGenerate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [translateOnlyOne, setTranslateOnlyOne] = useState(false);
  const [translateConcurrency, setTranslateConcurrency] = useState(4);
  const [contentParallel, setContentParallel] = useState(4);
  const [translateLabelsConcurrency, setTranslateLabelsConcurrency] = useState(3);
  const [autoResumeOnError, setAutoResumeOnError] = useState(true);
  const [generateProvider, setGenerateProvider] = useState<GenerateProviderType>('ollama');
  const [ollamaModel, setOllamaModel] = useState('glm-4.6:cloud');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportJson, setBulkImportJson] = useState('');
  const [bulkImportLoading, setBulkImportLoading] = useState(false);
  const [bulkImportResult, setBulkImportResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkPublishLoading, setBulkPublishLoading] = useState(false);
  const [bulkRelatedLoading, setBulkRelatedLoading] = useState(false);
  const [bulkRelatedMode, setBulkRelatedMode] = useState<'manual' | 'random' | 'both'>('random');
  const [bulkRelatedCount, setBulkRelatedCount] = useState(6);
  const [cleanContentLoading, setCleanContentLoading] = useState(false);
  const [translateLabelsLoading, setTranslateLabelsLoading] = useState(false);
  const [translateLabelsProgress, setTranslateLabelsProgress] = useState<{ current: number; total: number; pageSlug: string; pageCategory: string; locale: string; startedAt?: number } | null>(null);
  const [translateLabelsPausedAt, setTranslateLabelsPausedAt] = useState<{ pageSlug: string; nextLocale: string } | null>(null);
  const [translateLabelsSuccess, setTranslateLabelsSuccess] = useState('');
  const [translateLabelsError, setTranslateLabelsError] = useState('');
  const [elapsedTick, setElapsedTick] = useState(0);
  const translateLabelsPausedRef = useRef(false);
  const translateLabelsAbortRef = useRef<AbortController | null>(null);
  const [generatedIdsThisRun, setGeneratedIdsThisRun] = useState<Set<string>>(new Set());
  const [calcCodeGenLoading, setCalcCodeGenLoading] = useState(false);
  const [calcCodeGenError, setCalcCodeGenError] = useState('');
  const [calcCodeGenProgress, setCalcCodeGenProgress] = useState<{ current: number; total: number; pageTitle: string } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');
  const validStages: PageStage[] = ['new', 'content-en-done', 'translation-done', 'calculator-done', 'done', 'completed-alive'];
  const [activeBookmark, setActiveBookmark] = useState<PageStage>(() =>
    tabParam && validStages.includes(tabParam as PageStage) ? (tabParam as PageStage) : 'new'
  );

  useEffect(() => {
    if (tabParam && validStages.includes(tabParam as PageStage) && tabParam !== activeBookmark) {
      setActiveBookmark(tabParam as PageStage);
    }
  }, [tabParam]);

  useEffect(() => {
    if (!translateLabelsProgress?.startedAt && !translateProgress?.startedAt) return;
    const id = setInterval(() => setElapsedTick((t) => t + 1), 10000);
    return () => clearInterval(id);
  }, [translateLabelsProgress?.startedAt, translateProgress?.startedAt]);

  function setBookmark(stage: PageStage) {
    setActiveBookmark(stage);
    setSelectedIds(new Set());
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', stage);
    router.replace(`/twojastara/pages?${params.toString()}`, { scroll: false });
  }

  const pagesByStage = useMemo(() => {
    const byStage: Record<PageStage, Page[]> = { new: [], 'content-en-done': [], 'translation-done': [], 'calculator-done': [], done: [], 'completed-alive': [] };
    const translateLabelSlugs = new Set<string>();
    if (translateLabelsProgress?.pageSlug) translateLabelSlugs.add(translateLabelsProgress.pageSlug);
    if (translateLabelsPausedAt?.pageSlug) translateLabelSlugs.add(translateLabelsPausedAt.pageSlug);
    for (const p of pages) {
      let stage: PageStage;
      if (translateLabelSlugs.has(p.slug)) {
        stage = 'calculator-done';
      } else {
        stage = getEffectiveStage(p);
      }
      byStage[stage].push(p);
    }
    for (const stage of Object.keys(byStage) as PageStage[]) {
      byStage[stage] = sortPagesLatestFirst(byStage[stage]);
    }
    return byStage;
  }, [pages, translateLabelsProgress?.pageSlug, translateLabelsPausedAt?.pageSlug]);

  const initFilter = useMemo(() => getInitialListFilter(searchParams), [searchParams.toString()]);
  const [searchQuery, setSearchQuery] = useState(initFilter.searchQuery);
  const [categoryFilter, setCategoryFilter] = useState(initFilter.categoryFilter);
  const [sortBy, setSortBy] = useState<SortByVal>(initFilter.sortBy);
  const [pageNum, setPageNum] = useState(1);
  const PAGE_SIZE = 50;

  useEffect(() => {
    const init = getInitialListFilter(searchParams);
    setSearchQuery(init.searchQuery);
    setCategoryFilter(init.categoryFilter);
    setSortBy(init.sortBy);
  }, [searchParams.toString()]);

  // Reset categoryFilter when it's invalid (e.g. from URL/localStorage, category no longer exists)
  const categoryOptions = useMemo(() => {
    const cats = new Set<string>();
    for (const p of pages) {
      const c = (p.category ?? '').trim() || 'uncategorized';
      cats.add(c);
    }
    return Array.from(cats).sort((a, b) => a.localeCompare(b, 'en'));
  }, [pages]);

  useEffect(() => {
    if (categoryFilter && !categoryOptions.includes(categoryFilter)) {
      setCategoryFilter('');
    }
  }, [categoryFilter, categoryOptions]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) params.set('q', searchQuery);
    else params.delete('q');
    if (categoryFilter) params.set('category', categoryFilter);
    else params.delete('category');
    if (sortBy !== 'latest') params.set('sort', sortBy);
    else params.delete('sort');
    router.replace(`/twojastara/pages?${params.toString()}`, { scroll: false });
    try {
      localStorage.setItem(LIST_FILTER_STORAGE_KEY, JSON.stringify({ searchQuery, categoryFilter, sortBy }));
    } catch {
      /* ignore */
    }
  }, [searchQuery, categoryFilter, sortBy]);

  const filteredPages = useMemo(() => {
    const stagePages = pagesByStage[activeBookmark];
    const q = searchQuery.trim().toLowerCase();
    let list = stagePages;
    if (q) {
      list = list.filter((p) => {
        const enTitle = p.translations.find((t) => t.locale === 'en')?.title ?? '';
        const displayTitle = p.translations.find((t) => t.locale === 'en')?.displayTitle ?? '';
        return (
          enTitle.toLowerCase().includes(q) ||
          displayTitle.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
        );
      });
    }
    if (categoryFilter) {
      const cat = categoryFilter === 'uncategorized' ? '' : categoryFilter;
      list = list.filter((p) => ((p.category ?? '').trim() || 'uncategorized') === (cat || 'uncategorized'));
    }
    if (sortBy === 'latest') {
      list = [...list].sort((a, b) => {
        const aT = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bT = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bT - aT;
      });
    } else if (sortBy === 'oldest') {
      list = [...list].sort((a, b) => {
        const aT = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bT = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return aT - bT;
      });
    } else if (sortBy === 'category') {
      list = [...list].sort((a, b) => {
        const ca = (a.category ?? '').trim() || 'uncategorized';
        const cb = (b.category ?? '').trim() || 'uncategorized';
        return ca.localeCompare(cb, 'en') || a.slug.localeCompare(b.slug, 'en');
      });
    } else if (sortBy === 'slug') {
      list = [...list].sort((a, b) => a.slug.localeCompare(b.slug, 'en'));
    }
    return list;
  }, [pagesByStage, activeBookmark, searchQuery, categoryFilter, sortBy]);

  const paginatedPages = useMemo(() => {
    if (filteredPages.length <= PAGE_SIZE) return filteredPages;
    const start = (pageNum - 1) * PAGE_SIZE;
    return filteredPages.slice(start, start + PAGE_SIZE);
  }, [filteredPages, pageNum]);

  const totalPages = Math.ceil(filteredPages.length / PAGE_SIZE);
  const showPagination = filteredPages.length > PAGE_SIZE;

  useEffect(() => {
    setPageNum(1);
  }, [activeBookmark, searchQuery, categoryFilter, sortBy]);

  useEffect(() => {
    fetch('/api/twojastara/pages')
      .then((res) => res.json())
      .then((data) => {
        setPages(Array.isArray(data) ? sortPagesLatestFirst(data) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (translateProgress || translatePausedAt) {
      setActiveBookmark('content-en-done');
    }
  }, [translateProgress?.pageTitle, translatePausedAt?.pageSlug]);

  useEffect(() => {
    if (translateLabelsProgress || translateLabelsPausedAt) {
      setActiveBookmark('calculator-done');
    }
  }, [translateLabelsProgress?.pageSlug, translateLabelsPausedAt?.pageSlug]);

  const prevTranslateLabelsLoading = useRef(false);
  const prevTranslateProgress = useRef<typeof translateProgress>(null);
  useEffect(() => {
    const hadProgress = !!prevTranslateProgress.current;
    prevTranslateProgress.current = translateProgress;
    if (hadProgress && !translateProgress && !translatePausedAt) {
      setActiveBookmark('translation-done');
    }
  }, [translateProgress, translatePausedAt]);

  useEffect(() => {
    const wasLoading = prevTranslateLabelsLoading.current;
    prevTranslateLabelsLoading.current = translateLabelsLoading;
    if (wasLoading && !translateLabelsLoading) {
      setActiveBookmark('done');
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
    const pageIds = paginatedPages.map((p) => p.id);
    const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
    if (allOnPageSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageIds));
    }
  }

  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [checkFailedIds, setCheckFailedIds] = useState<Set<string>>(new Set());
  const [checkFailedType, setCheckFailedType] = useState<'translations' | 'labels' | null>(null);
  const [showSeoCheckModal, setShowSeoCheckModal] = useState(false);

  function handleCheckTranslations() {
    const toCheck = selectedIds.size > 0
      ? pages.filter((p) => selectedIds.has(p.id))
      : filteredPages;
    if (toCheck.length === 0) {
      alert('Select pages or ensure the tab has pages.');
      return;
    }
    const lines: string[] = [`Check translations (${ADMIN_LOCALES.length} locales expected):`];
    const failedIds = new Set<string>();
    let allOk = 0;
    for (const p of toCheck) {
      const missing = getMissingTranslations(p);
      const enTitle = p.translations.find((t) => t.locale === 'en')?.title ?? p.slug;
      if (missing.length === 0) {
        allOk++;
        lines.push(`✓ ${enTitle}: all ${ADMIN_LOCALES.length} translations OK`);
      } else {
        failedIds.add(p.id);
        lines.push(`✗ ${enTitle}: missing ${missing.length} (${missing.join(', ')})`);
      }
    }
    lines.push('');
    lines.push(`${allOk}/${toCheck.length} pages have all translations`);
    setCheckFailedIds(failedIds);
    setCheckFailedType(failedIds.size > 0 ? 'translations' : null);
    setCheckResult(lines.join('\n'));
  }

  function handleCheckLabels() {
    const toCheck = selectedIds.size > 0
      ? pages.filter((p) => selectedIds.has(p.id))
      : filteredPages;
    if (toCheck.length === 0) {
      alert('Select pages or ensure the tab has pages.');
      return;
    }
    const lines: string[] = [`Check labels (${ADMIN_LOCALES.length} locales expected):`];
    const failedIds = new Set<string>();
    let allOk = 0;
    for (const p of toCheck) {
      const enTitle = p.translations.find((t) => t.locale === 'en')?.title ?? p.slug;
      if (!(p.calculatorCode ?? '').trim()) {
        allOk++;
        lines.push(`✓ ${enTitle}: no calculator (N/A)`);
      } else {
        const missing = getMissingLabels(p);
        if (missing.length === 0) {
          allOk++;
          lines.push(`✓ ${enTitle}: all ${ADMIN_LOCALES.length} labels OK`);
        } else {
          failedIds.add(p.id);
          lines.push(`✗ ${enTitle}: missing ${missing.length} (${missing.join(', ')})`);
        }
      }
    }
    lines.push('');
    lines.push(`${allOk}/${toCheck.length} pages have all labels`);
    setCheckFailedIds(failedIds);
    setCheckFailedType(failedIds.size > 0 ? 'labels' : null);
    setCheckResult(lines.join('\n'));
  }

  function handleCompleteTranslationsFromCheck() {
    if (checkFailedIds.size === 0 || checkFailedType !== 'translations') return;
    const failedPages = pages.filter((p) => checkFailedIds.has(p.id) && hasEnContent(p) && !hasAllTranslations(p));
    if (failedPages.length === 0) return;
    setSelectedIds(checkFailedIds);
    startTranslate({
      pages,
      selectedIds: checkFailedIds,
      translateStartFrom,
      translateOnlyOne: false,
      translateConcurrency,
      contentParallel,
      resumeOverride: translatePausedAt ?? undefined,
      autoResumeOnError,
      onPagesUpdate: (updater) => setPages(updater),
      onComplete: () => {
        setSelectedIds(new Set());
        setCheckResult(null);
        setCheckFailedIds(new Set());
        setCheckFailedType(null);
      },
    });
  }

  function handleCompleteLabelsFromCheck(fillMissingOnly = false) {
    if (checkFailedIds.size === 0 || checkFailedType !== 'labels') return;
    setSelectedIds(checkFailedIds);
    const clearCheck = () => {
      setCheckResult(null);
      setCheckFailedIds(new Set());
      setCheckFailedType(null);
    };
    if (fillMissingOnly) {
      handleBulkTranslateMissingLabels(Array.from(checkFailedIds), clearCheck);
    } else {
      handleBulkTranslateLabels(Array.from(checkFailedIds), clearCheck);
    }
  }

  const [bulkBookmarkLoading, setBulkBookmarkLoading] = useState(false);

  async function handleBulkBookmark(manualBookmark: PageStage) {
    if (selectedIds.size === 0) return;
    if (!VALID_MANUAL_BOOKMARKS.includes(manualBookmark)) return;
    setBulkBookmarkLoading(true);
    try {
      const res = await fetch('/api/twojastara/pages/bulk-bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), manualBookmark }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Move failed');
        return;
      }
      const updated = Array.isArray(data) ? data : [];
      setPages((prev) =>
        prev.map((p) => {
          const u = updated.find((x: { id: string }) => x.id === p.id);
          return u ? { ...p, manualBookmark: (u as Page).manualBookmark ?? null } : p;
        })
      );
      setActiveBookmark(manualBookmark);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Move failed');
    } finally {
      setBulkBookmarkLoading(false);
    }
  }

  async function handleBulkRelatedSettings() {
    const ids =
      selectedIds.size > 0 ? Array.from(selectedIds) : filteredPages.map((p) => p.id);
    if (ids.length === 0) {
      alert('No pages in this tab.');
      return;
    }
    if (selectedIds.size === 0) {
      if (
        !confirm(
          `Set related calculators to "${bulkRelatedMode}", count ${bulkRelatedCount} for ALL ${ids.length} page(s) in this tab?`
        )
      ) {
        return;
      }
    }
    setBulkRelatedLoading(true);
    try {
      const res = await fetch('/api/twojastara/pages/bulk-related-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids,
          relatedCalculatorsMode: bulkRelatedMode,
          relatedCalculatorsCount: bulkRelatedCount,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Bulk related settings failed');
        return;
      }
      setPages((prev) =>
        prev.map((p) =>
          ids.includes(p.id)
            ? { ...p, relatedCalculatorsMode: bulkRelatedMode, relatedCalculatorsCount: bulkRelatedCount }
            : p
        )
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Bulk related settings failed');
    } finally {
      setBulkRelatedLoading(false);
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
        prev.map((p) =>
          selectedIds.has(p.id)
            ? { ...p, published, manualBookmark: published ? 'completed-alive' : 'done' }
            : p
        )
      );
      setSelectedIds(new Set());
      if (published && activeBookmark === 'done') setActiveBookmark('completed-alive');
      if (!published && activeBookmark === 'completed-alive') setActiveBookmark('done');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Bulk publish failed');
    } finally {
      setBulkPublishLoading(false);
    }
  }

  async function handleCleanContentAndLabels() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Wyczyścić content i labels dla ${selectedIds.size} stron? Zostanie tylko oryginalny EN.`)) return;
    setCleanContentLoading(true);
    try {
      const res = await fetch('/api/twojastara/pages/clean-translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Clean translations failed');
        return;
      }
      const listRes = await fetch('/api/twojastara/pages');
      const listData = await listRes.json();
      if (Array.isArray(listData)) setPages(sortPagesLatestFirst(listData));
      setSelectedIds(new Set());
      setCheckResult(null);
      setCheckFailedIds(new Set());
      setCheckFailedType(null);
      setTranslateLabelsSuccess(data.message ?? `Wyczyszczono content i labels dla ${data.cleaned ?? 0} stron(ach).`);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Clean translations failed');
    } finally {
      setCleanContentLoading(false);
    }
  }

  async function fetchWithRetry(url: string, opts: RequestInit, maxAttempts = 4): Promise<Response> {
    const timeoutMs = 300_000; // 5 min for long Ollama responses
    let lastErr: Error | null = null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const res = await fetch(url, { ...opts, signal: ctrl.signal });
        clearTimeout(tid);
        return res;
      } catch (e) {
        clearTimeout(tid);
        lastErr = e instanceof Error ? e : new Error(String(e));
        const isRetryable = /failed to fetch|load failed|fetch|timeout|econnreset|network|abort/i.test(lastErr.message);
        if (attempt < maxAttempts - 1 && isRetryable) {
          await new Promise((r) => setTimeout(r, 3000 + attempt * 5000));
        } else {
          throw lastErr;
        }
      }
    }
    throw lastErr || new Error('Request failed');
  }

  async function handleBulkGenerateCalcCode() {
    const toProcess = selectedIds.size > 0
      ? pages.filter((p) => selectedIds.has(p.id))
      : filteredPages;
    if (toProcess.length === 0) {
      alert('Select pages or ensure the tab has pages.');
      return;
    }
    setCalcCodeGenLoading(true);
    setCalcCodeGenError('');
    const total = toProcess.length;
    let done = 0;
    const failedSlugs: string[] = [];
    const updatedPages: Page[] = [...pages];
    try {
      for (const page of toProcess) {
        setCalcCodeGenProgress({ current: done, total, pageTitle: page.translations.find((t) => t.locale === 'en')?.displayTitle ?? page.slug });
        const en = page.translations.find((t) => t.locale === 'en');
        const title = en?.displayTitle?.trim() || en?.title?.trim() || page.slug;
        const content = en?.content?.trim() || '';
        try {
          const res = await fetchWithRetry('/api/twojastara/ollama/generate-calculator-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageId: page.id, title, slug: page.slug, content, model: ollamaModel }),
            credentials: 'include',
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Generate failed');
          const code = (data.code as string)?.trim();
          if (!code) throw new Error('Empty code from API');
          const looksLikeTsx = /(?:use client|import\s+|export\s+)/.test(code);
          const labels = (data.labels as Record<string, string> | undefined) ?? {};
          const patchRes = await fetchWithRetry(`/api/twojastara/pages/${page.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              calculatorCode: code,
              ...(looksLikeTsx ? { manualBookmark: 'calculator-done' } : {}),
            }),
            credentials: 'include',
          });
          if (!patchRes.ok) {
            const pd = await patchRes.json();
            throw new Error(pd.error || 'Save failed');
          }
          let updated = await patchRes.json();
          if (Object.keys(labels).length > 0) {
            const labelsRes = await fetchWithRetry(`/api/twojastara/pages/${page.id}/labels`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ updates: [{ locale: 'en', calculatorLabels: labels }] }),
              credentials: 'include',
            });
            if (labelsRes.ok) updated = await labelsRes.json();
          }
          const idx = updatedPages.findIndex((p) => p.id === page.id);
          if (idx >= 0) updatedPages[idx] = updated;
        } catch (pageErr) {
          failedSlugs.push(page.slug);
          setCalcCodeGenError(`${done}/${total} done. Failed: ${page.slug} — ${pageErr instanceof Error ? pageErr.message : 'unknown'}. Continuing…`);
        }
        done++;
      }
      setPages(sortPagesLatestFirst(updatedPages));
      if (failedSlugs.length > 0) {
        setCalcCodeGenError(`Done. Failed (${failedSlugs.length}/${total}): ${failedSlugs.slice(0, 5).join(', ')}${failedSlugs.length > 5 ? '…' : ''}`);
      } else {
        setCalcCodeGenError('');
        setActiveBookmark('calculator-done');
        setSelectedIds(new Set());
      }
    } catch (e) {
      setCalcCodeGenError(e instanceof Error ? e.message : 'Generate calculator code failed');
    } finally {
      setCalcCodeGenLoading(false);
      setCalcCodeGenProgress(null);
    }
  }

  async function handleBulkTranslateLabels(overrideIds?: string[], onCompleteCallback?: () => void) {
    const ids = overrideIds ?? Array.from(selectedIds);
    if (ids.length === 0) return;
    const toProcess = pages.filter((p) => ids.includes(p.id) && (p.calculatorCode ?? '').trim());
    const withEnLabels = sortPagesLatestFirst(
      toProcess.filter((p) => {
        const en = p.translations.find((t) => t.locale === 'en');
        const lab = parseJson<Record<string, string>>(en?.calculatorLabels, {});
        return Object.values(lab).some((v) => v?.trim());
      })
    );
    if (withEnLabels.length === 0) {
      alert('Select pages with Calculator code and EN labels filled. Edit a page, add labels for [en], then try again.');
      return;
    }
    const alreadyTranslated = withEnLabels.filter((p) => hasAllLabelsTranslated(p));
    if (alreadyTranslated.length > 0) {
      const msg =
        alreadyTranslated.length === withEnLabels.length
          ? `Etykiety są już przetłumaczone dla wszystkich ${alreadyTranslated.length} zaznaczonych stron. Przetłumaczyć ponownie?`
          : `${alreadyTranslated.length} z ${withEnLabels.length} stron ma już przetłumaczone etykiety. Przetłumaczyć ponownie (też te już gotowe)?`;
      if (!confirm(msg)) return;
    }
    const allNonEn = [...ADMIN_LOCALES.filter((l) => l !== 'en')].reverse();
    const labelTasks: { page: Page; loc: string; enLabels: Record<string, string> }[] = [];
    for (const page of withEnLabels) {
      const enTrans = page.translations.find((t) => t.locale === 'en');
      const enLabels = parseJson<Record<string, string>>(enTrans?.calculatorLabels, {});
      if (!Object.values(enLabels).some((v) => v?.trim())) continue;
      const existingLocales = new Set(page.translations.map((t) => t.locale));
      const localesToTranslate = allNonEn.filter((l) => existingLocales.has(l));
      for (const loc of localesToTranslate) {
        labelTasks.push({ page, loc, enLabels });
      }
    }
    const totalSteps = labelTasks.length;
    if (totalSteps === 0) {
      alert('No labels to translate. Ensure pages have content translated to all locales first (run Translate), then Translate Labels.');
      return;
    }
    const tasksPerPage = new Map<string, number>();
    for (const { page } of labelTasks) {
      tasksPerPage.set(page.id, (tasksPerPage.get(page.id) ?? 0) + 1);
    }
    const tasksLeftPerPage = new Map(tasksPerPage);
    const movePageToDoneIfComplete = async (pageId: string) => {
      const left = (tasksLeftPerPage.get(pageId) ?? 0) - 1;
      tasksLeftPerPage.set(pageId, left);
      if (left !== 0) return;
      try {
        const pageRes = await fetch(`/api/twojastara/pages/${pageId}`, { credentials: 'include' });
        if (!pageRes.ok) return;
        const freshPage = (await pageRes.json()) as Page;
        if (!hasAllLabelsTranslated(freshPage)) return;
        const br = await fetch('/api/twojastara/pages/bulk-bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: [pageId], manualBookmark: 'done' }),
          credentials: 'include',
        });
        const bd = await br.json();
        if (br.ok && Array.isArray(bd)) {
          const u = bd.find((x: { id: string }) => x.id === pageId);
          if (u) {
            setPages((prev) =>
              prev.map((p) => (p.id !== pageId ? p : { ...p, manualBookmark: (u as Page).manualBookmark ?? 'done' }))
            );
            setActiveBookmark('done');
          }
        }
      } catch {
        /* ignore */
      }
    };
    setActiveBookmark('calculator-done');
    setTranslateLabelsLoading(true);
    setTranslateLabelsError('');
    setTranslateLabelsProgress({ current: 0, total: totalSteps, pageSlug: '', pageCategory: 'math', locale: '', startedAt: Date.now() });
    setTranslateLabelsPausedAt(null);
    translateLabelsPausedRef.current = false;
    translateLabelsAbortRef.current = new AbortController();
    const concurrency = Math.max(1, Math.min(6, translateLabelsConcurrency));
    const stepRef = { current: 0 };
    try {
      if (concurrency <= 1) {
        for (const { page, loc, enLabels } of labelTasks) {
          if (translateLabelsAbortRef.current?.signal.aborted) break;
          if (translateLabelsPausedRef.current) {
            setTranslateLabelsPausedAt({ pageSlug: page.slug, nextLocale: loc });
            while (translateLabelsPausedRef.current && !translateLabelsAbortRef.current?.signal.aborted) {
              await new Promise((r) => setTimeout(r, 300));
            }
            setTranslateLabelsPausedAt(null);
            if (translateLabelsAbortRef.current?.signal.aborted) break;
          }
          stepRef.current++;
          setTranslateLabelsProgress((p) => ({ ...(p ?? {}), current: stepRef.current, total: totalSteps, pageSlug: page.slug, pageCategory: page.category ?? 'math', locale: loc }));
          let res: Response;
          let data: Record<string, unknown>;
          const maxAttempts = 5;
          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            res = await fetch('/api/twojastara/ollama/translate-labels', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ labels: enLabels, targetLocale: loc, model: ollamaModel }),
              credentials: 'include',
              signal: translateLabelsAbortRef.current?.signal,
            });
            if (res.status === 401 && typeof window !== 'undefined') {
              window.location.href = '/twojastara/login';
              return;
            }
            data = await safeResJson(res);
            if (res.ok) break;
            const is502or503 = res.status === 502 || res.status === 503;
            const hint = is502or503 ? ' (Ollama/proxy overloaded — retry za chwilę)' : '';
            if (attempt < maxAttempts - 1 && is502or503) {
              await new Promise((r) => setTimeout(r, 5000));
            } else if (attempt < maxAttempts - 1) {
              await new Promise((r) => setTimeout(r, 2000));
            } else {
              throw new Error(String(data?.error || `Translate labels to ${loc} failed`) + hint);
            }
          }
          if (!res!.ok) throw new Error(String(data?.error || `Translate labels to ${loc} failed`));
          const lab = (data?.labels && typeof data.labels === 'object' && !Array.isArray(data.labels) ? data.labels : {}) as Record<string, string>;
          const patchRes = await fetch(`/api/twojastara/pages/${page.id}/labels`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates: [{ locale: loc, calculatorLabels: lab }] }),
            credentials: 'include',
          });
          if (!patchRes.ok) throw new Error(String((await safeResJson(patchRes)).error || 'Failed to save'));
          setPages((prev) =>
            prev.map((p) => (p.id !== page.id ? p : {
              ...p,
              translations: p.translations.map((t) => (t.locale === loc ? { ...t, calculatorLabels: JSON.stringify(lab) } : t)),
            }))
          );
          await movePageToDoneIfComplete(page.id);
        }
      } else {
        let taskIdx = 0;
        const PROGRESS_THROTTLE_MS = 120;
        let lastProgressTime = 0;
        const throttledSetProgress = (cur: number, pageSlug: string, pageCategory: string, locale: string) => {
          const now = Date.now();
          if (now - lastProgressTime >= PROGRESS_THROTTLE_MS || cur >= totalSteps) {
            lastProgressTime = now;
            setTranslateLabelsProgress((p) => ({ ...(p ?? {}), current: cur, total: totalSteps, pageSlug, pageCategory: pageCategory ?? 'math', locale }));
          }
        };
        const runTask = async () => {
          while (!translateLabelsAbortRef.current?.signal.aborted) {
            const i = taskIdx++;
            if (i >= labelTasks.length) break;
            const { page, loc, enLabels } = labelTasks[i];
            throttledSetProgress(stepRef.current, page.slug, page.category ?? 'math', loc);
            let res: Response;
            let data: Record<string, unknown>;
            const maxAttempts = 5;
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
              res = await fetch('/api/twojastara/ollama/translate-labels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ labels: enLabels, targetLocale: loc, model: ollamaModel }),
                credentials: 'include',
                signal: translateLabelsAbortRef.current?.signal,
              });
              if (res.status === 401 && typeof window !== 'undefined') {
                window.location.href = '/twojastara/login';
                return;
              }
              data = await safeResJson(res);
              if (res.ok) break;
              const is502or503 = res.status === 502 || res.status === 503;
              const hint = is502or503 ? ' (Ollama/proxy overloaded — retry za chwilę)' : '';
              if (attempt < maxAttempts - 1 && is502or503) {
                await new Promise((r) => setTimeout(r, 5000));
              } else if (attempt < maxAttempts - 1) {
                await new Promise((r) => setTimeout(r, 2000));
              } else {
                throw new Error(String(data?.error || `Translate labels to ${loc} failed`) + hint);
              }
            }
            if (!res!.ok) throw new Error(String(data?.error || `Translate labels to ${loc} failed`));
            const lab = (data?.labels && typeof data.labels === 'object' && !Array.isArray(data.labels) ? data.labels : {}) as Record<string, string>;
            const patchRes = await fetch(`/api/twojastara/pages/${page.id}/labels`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ updates: [{ locale: loc, calculatorLabels: lab }] }),
              credentials: 'include',
            });
            if (!patchRes.ok) throw new Error(String((await safeResJson(patchRes)).error || 'Failed to save'));
            setPages((prev) =>
              prev.map((p) => (p.id !== page.id ? p : {
                ...p,
                translations: p.translations.map((t) => (t.locale === loc ? { ...t, calculatorLabels: JSON.stringify(lab) } : t)),
              }))
            );
            stepRef.current++;
            throttledSetProgress(stepRef.current, page.slug, page.category ?? 'math', loc);
            await movePageToDoneIfComplete(page.id);
          }
        };
        await Promise.all(Array(Math.min(concurrency, labelTasks.length)).fill(0).map(() => runTask()));
      }
      setSelectedIds(new Set());
      setTranslateLabelsSuccess(`Zakończono tłumaczenie etykiet kalkulatorów: ${withEnLabels.length} stron(ach).`);
      onCompleteCallback?.();
      const completedIds = withEnLabels.map((p) => p.id);
      if (completedIds.length > 0) {
        try {
          const br = await fetch('/api/twojastara/pages/bulk-bookmark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: completedIds, manualBookmark: 'done' }),
            credentials: 'include',
          });
          const bd = await br.json();
          if (br.ok && Array.isArray(bd)) {
            setPages((prev) =>
              prev.map((p) => {
                const u = bd.find((x: { id: string }) => x.id === p.id);
                return u ? { ...p, manualBookmark: (u as Page).manualBookmark ?? 'done' } : p;
              })
            );
            setActiveBookmark('done');
          }
        } catch {
          /* ignore */
        }
      }
    } catch (e) {
      const isAbort = e instanceof Error && e.name === 'AbortError';
      if (!isAbort) {
        const msg = e instanceof Error ? e.message : 'Translate labels failed';
        setTranslateLabelsError(msg);
      }
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

  async function handleBulkTranslateMissingLabels(overrideIds?: string[], onCompleteCallback?: () => void) {
    const ids = overrideIds ?? Array.from(selectedIds);
    if (ids.length === 0) return;
    const toProcess = pages.filter((p) => ids.includes(p.id) && (p.calculatorCode ?? '').trim());
    const withEnLabels = sortPagesLatestFirst(
      toProcess.filter((p) => {
        const en = p.translations.find((t) => t.locale === 'en');
        const lab = parseJson<Record<string, string>>(en?.calculatorLabels, {});
        return Object.values(lab).some((v) => v?.trim());
      })
    );
    if (withEnLabels.length === 0) {
      alert('Select pages with Calculator code and EN labels filled.');
      return;
    }
    const allNonEn = [...ADMIN_LOCALES.filter((l) => l !== 'en')].reverse();
    setTranslateLabelsLoading(true);
    setTranslateLabelsError('');
    setTranslateLabelsProgress(null);
    setTranslateLabelsPausedAt(null);
    translateLabelsPausedRef.current = false;
    translateLabelsAbortRef.current = new AbortController();
    const steps: { page: Page; loc: string }[] = [];
    for (const page of withEnLabels) {
      const enTrans = page.translations.find((t) => t.locale === 'en');
      const enLabels = parseJson<Record<string, string>>(enTrans?.calculatorLabels, {});
      if (!Object.values(enLabels).some((v) => v?.trim())) continue;
      for (const loc of allNonEn) {
        const t = page.translations.find((tr) => tr.locale === loc);
        const existing = parseJson<Record<string, string>>(t?.calculatorLabels, {});
        const missingKeys = getMissingLabelKeysForLocale(enLabels, existing, loc);
        if (missingKeys.length > 0) steps.push({ page, loc });
      }
    }
    const totalSteps = steps.length;
    if (totalSteps === 0) {
      setTranslateLabelsLoading(false);
      alert('No missing labels. All selected pages have full label translations.');
      return;
    }
    setActiveBookmark('calculator-done');
    setTranslateLabelsProgress({ current: 0, total: totalSteps, pageSlug: '', pageCategory: 'math', locale: '', startedAt: Date.now() });
    const concurrency = Math.max(1, Math.min(6, translateLabelsConcurrency));
    const stepRef = { current: 0 };
    try {
      const runTask = async (task: { page: Page; loc: string }) => {
        const { page, loc } = task;
        const enTrans = page.translations.find((t) => t.locale === 'en');
        const enLabels = parseJson<Record<string, string>>(enTrans?.calculatorLabels, {});
        const t = page.translations.find((tr) => tr.locale === loc);
        const existing = parseJson<Record<string, string>>(t?.calculatorLabels, {});
        const missingKeys = getMissingLabelKeysForLocale(enLabels, existing, loc);
        if (missingKeys.length === 0) return;
        const labelsToTranslate = Object.fromEntries(missingKeys.map((k) => [k, enLabels[k]]));
        let res: Response;
        let data: Record<string, unknown>;
        const maxAttempts = 5;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
res = await fetch('/api/twojastara/ollama/translate-labels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ labels: labelsToTranslate, targetLocale: loc, model: ollamaModel }),
          credentials: 'include',
          signal: translateLabelsAbortRef.current?.signal,
        });
          if (res.status === 401 && typeof window !== 'undefined') {
            window.location.href = '/twojastara/login';
            return;
          }
          data = await safeResJson(res);
          if (res.ok) break;
          const is502or503 = res.status === 502 || res.status === 503;
          const hint = is502or503 ? ' (Ollama/proxy overloaded — retry za chwilę)' : '';
          if (attempt < maxAttempts - 1 && is502or503) {
            await new Promise((r) => setTimeout(r, 5000));
          } else if (attempt < maxAttempts - 1) {
            await new Promise((r) => setTimeout(r, 2000));
          } else {
            throw new Error(String(data?.error || `Translate missing labels to ${loc} failed`) + hint);
          }
        }
        if (!res!.ok) throw new Error(String(data?.error || `Translate missing labels to ${loc} failed`));
        const translated = data?.labels;
        const merged = { ...existing, ...(translated && typeof translated === 'object' && !Array.isArray(translated) ? translated : {}) };
        const patchRes = await fetch(`/api/twojastara/pages/${page.id}/labels`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: [{ locale: loc, calculatorLabels: merged }] }),
          credentials: 'include',
        });
        if (!patchRes.ok) throw new Error(String((await safeResJson(patchRes)).error || 'Failed to save'));
        setPages((prev) =>
          prev.map((p) => (p.id !== page.id ? p : {
            ...p,
            translations: p.translations.map((t) => (t.locale === loc ? { ...t, calculatorLabels: JSON.stringify(merged) } : t)),
          }))
        );
      };

      if (concurrency <= 1) {
        for (const task of steps) {
          if (translateLabelsAbortRef.current?.signal.aborted) break;
          if (translateLabelsPausedRef.current) {
            setTranslateLabelsPausedAt({ pageSlug: task.page.slug, nextLocale: task.loc });
            while (translateLabelsPausedRef.current && !translateLabelsAbortRef.current?.signal.aborted) {
              await new Promise((r) => setTimeout(r, 300));
            }
            setTranslateLabelsPausedAt(null);
            if (translateLabelsAbortRef.current?.signal.aborted) break;
          }
          stepRef.current++;
          setTranslateLabelsProgress({ current: stepRef.current, total: totalSteps, pageSlug: task.page.slug, pageCategory: task.page.category ?? 'math', locale: task.loc });
          await runTask(task);
        }
      } else {
        let taskIdx = 0;
        const PROGRESS_THROTTLE_MS = 120;
        let lastProgressTime = 0;
        const throttledSetProgress = (cur: number, pageSlug: string, locale: string) => {
          const now = Date.now();
          if (now - lastProgressTime >= PROGRESS_THROTTLE_MS || cur >= totalSteps) {
            lastProgressTime = now;
            setTranslateLabelsProgress({ current: cur, total: totalSteps, pageSlug, pageCategory: 'math', locale });
          }
        };
        const worker = async () => {
          while (!translateLabelsAbortRef.current?.signal.aborted) {
            const i = taskIdx++;
            if (i >= steps.length) break;
            const task = steps[i];
            stepRef.current++;
            throttledSetProgress(stepRef.current, task.page.slug, task.loc);
            await runTask(task);
          }
        };
        await Promise.all(Array(Math.min(concurrency, steps.length)).fill(0).map(() => worker()));
      }
      setTranslateLabelsSuccess(`Zakończono tłumaczenie brakujących etykiet: ${withEnLabels.length} stron(ach).`);
      onCompleteCallback?.();
    } catch (e) {
      const isAbort = e instanceof Error && e.name === 'AbortError';
      if (!isAbort) {
        setTranslateLabelsError(e instanceof Error ? e.message : 'Translate missing labels failed');
      }
    } finally {
      setTranslateLabelsLoading(false);
      setTranslateLabelsProgress(null);
      setTranslateLabelsPausedAt(null);
      translateLabelsAbortRef.current = null;
    }
  }

  function handleBatchGenerate() {
    setGeneratedIdsThisRun(new Set());
    startGenerate({
      pages,
      selectedIds,
      provider: generateProvider,
      ollamaModel,
      autoResumeOnError,
      onPagesUpdate: (updater) => setPages(updater),
      onPageGenerated: (id) => setGeneratedIdsThisRun((prev) => new Set([...prev, id])),
      onComplete: () => setSelectedIds(new Set()),
    });
  }

  async function movePageToTranslationDone(pageId: string) {
    try {
      const br = await fetch('/api/twojastara/pages/bulk-bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [pageId], manualBookmark: 'translation-done' }),
        credentials: 'include',
      });
      const bd = await br.json();
      if (br.ok && Array.isArray(bd)) {
        const u = bd.find((x: { id: string }) => x.id === pageId);
        if (u) {
          setPages((prev) =>
            prev.map((p) => (p.id !== pageId ? p : { ...p, manualBookmark: (u as Page).manualBookmark ?? 'translation-done' }))
          );
          setActiveBookmark('translation-done');
        }
      }
    } catch {
      /* ignore */
    }
  }

  function handleBatchTranslate() {
    setActiveBookmark('content-en-done');
    startTranslate({
      pages,
      selectedIds,
      translateStartFrom,
      translateOnlyOne,
      translateConcurrency,
      contentParallel,
      ollamaModel,
      resumeOverride: translatePausedAt ?? undefined,
      autoResumeOnError,
      onPagesUpdate: (updater) => setPages(updater),
      onPageTranslated: movePageToTranslationDone,
      onComplete: () => {
        setSelectedIds(new Set());
        setActiveBookmark('translation-done');
      },
    });
  }

  function handleTranslateMissingTranslations() {
    const candidates = selectedIds.size > 0
      ? filteredPages.filter((p) => selectedIds.has(p.id))
      : filteredPages;
    const withMissing = candidates.filter((p) => hasEnContent(p) && !hasAllTranslations(p));
    if (withMissing.length === 0) {
      if (selectedIds.size > 0) alert('Selected pages have no missing translations.');
      return;
    }
    setSelectedIds(new Set(withMissing.map((p) => p.id)));
    setActiveBookmark('content-en-done');
    startTranslate({
      pages,
      selectedIds: new Set(withMissing.map((p) => p.id)),
      translateStartFrom,
      translateOnlyOne: false,
      translateConcurrency,
      contentParallel,
      ollamaModel,
      resumeOverride: translatePausedAt ?? undefined,
      autoResumeOnError,
      onPagesUpdate: (updater) => setPages(updater),
      onPageTranslated: movePageToTranslationDone,
      onComplete: () => {
        setSelectedIds(new Set());
        setActiveBookmark('translation-done');
      },
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
      if (Array.isArray(listData)) setPages(sortPagesLatestFirst(listData));
      setActiveBookmark('new');
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

  const bookmarkTabs: { stage: PageStage; label: string; count: number; green?: boolean }[] = [
    { stage: 'new', label: 'NEW', count: pagesByStage.new.length },
    { stage: 'content-en-done', label: 'Content EN - Done', count: pagesByStage['content-en-done'].length, green: true },
    { stage: 'translation-done', label: '24 Languages Translation done', count: pagesByStage['translation-done'].length, green: true },
    { stage: 'calculator-done', label: 'Calc Code Generator Done', count: pagesByStage['calculator-done'].length, green: true },
    { stage: 'done', label: 'Done (TR+LB)', count: pagesByStage.done.length, green: true },
    { stage: 'completed-alive', label: 'Alive', count: pagesByStage['completed-alive'].length, green: true },
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
                {paginatedPages.length > 0 && paginatedPages.every((p) => selectedIds.has(p.id))
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
              <label
                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                title="Model Ollama dla Generate, Translate i Translate Labels"
              >
                Ollama model:
                <select
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  disabled={!!generateProgress || !!translateProgress || !!translateLabelsLoading}
                  className="admin-form-select"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', minWidth: 160 }}
                >
                  {OLLAMA_MODELS.map((m) => (
                    <option key={m.id} value={m.id} title={m.desc}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
              {generateProgress && (
                <button
                  type="button"
                  onClick={pauseGenerate}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.35rem 0.75rem', borderColor: 'var(--error-color)', color: 'var(--error-color)' }}
                >
                  Cancel
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
                    <label
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      Parallel (content):
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={String(translateConcurrency)}
                        onChange={(e) => {
                          const v = Math.min(6, Math.max(1, parseInt(e.target.value, 10) || 1));
                          setTranslateConcurrency(v);
                        }}
                        onBlur={(e) => {
                          const v = Math.min(6, Math.max(1, parseInt(e.target.value, 10) || 1));
                          setTranslateConcurrency(v);
                        }}
                        disabled={!!translateProgress || !!translateLabelsLoading}
                        className="admin-form-select"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 48 }}
                        title="Strony tłumaczonych równolegle (content). Zalecane: 3-8. Więcej = szybsze, może obciążyć API."
                      />
                    </label>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      Locales/batch:
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={String(contentParallel)}
                        onChange={(e) => {
                          const v = Math.min(8, Math.max(1, parseInt(e.target.value, 10) || 1));
                          setContentParallel(v);
                        }}
                        onBlur={(e) => {
                          const v = Math.min(8, Math.max(1, parseInt(e.target.value, 10) || 1));
                          setContentParallel(v);
                        }}
                        disabled={!!translateProgress || !!translateLabelsLoading}
                        className="admin-form-select"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 48 }}
                        title="Języków równolegle na stronę. 4 = ~4× szybsze. OLLAMA_MAX_CONCURRENT=4 na serwerze."
                      />
                    </label>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      Parallel (labels):
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={String(translateLabelsConcurrency)}
                        onChange={(e) => {
                          const v = Math.min(6, Math.max(1, parseInt(e.target.value, 10) || 1));
                          setTranslateLabelsConcurrency(v);
                        }}
                        onBlur={(e) => {
                          const v = Math.min(6, Math.max(1, parseInt(e.target.value, 10) || 1));
                          setTranslateLabelsConcurrency(v);
                        }}
                        disabled={!!translateProgress || !!translateLabelsLoading}
                        className="admin-form-select"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 48 }}
                        title="Zadań (strona+locale) równolegle dla etykiet. Zalecane: 3-8. Więcej = szybsze, może powodować obciążenie."
                      />
                    </label>
                    {translateProgress && (
                      <button
                        type="button"
                        onClick={pauseTranslate}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.75rem', borderColor: 'var(--error-color)', color: 'var(--error-color)' }}
                      >
                        Cancel
                      </button>
                    )}
                    {translateLabelsProgress && !translateLabelsPausedAt && (
                      <button
                        type="button"
                        onClick={abortTranslateLabels}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.75rem', color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
                      >
                        Cancel
                      </button>
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
                      onClick={() => handleBulkTranslateLabels()}
                      disabled={selectedCount === 0 || !!generateProgress || !!translateProgress || !!translateLabelsLoading}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem 0.75rem' }}
                      title="Translate Calculator labels from EN to all other languages (Ollama). Limit: 48 h. Przy timeout — spróbuj ponownie. Retry: 2x."
                    >
                      {translateLabelsLoading ? 'Translate Labels…' : 'Translate Labels'}
                    </button>
                    {filteredPages.filter((p) => hasEnContent(p) && !hasAllTranslations(p)).length > 0 && (
                      <button
                        type="button"
                        onClick={handleTranslateMissingTranslations}
                        disabled={!!generateProgress || !!translateProgress || !!translateLabelsLoading}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.35rem 0.75rem' }}
                        title="Translate content to missing languages (24 locales). Saves after each language."
                      >
                        Translate missing translations
                      </button>
                    )}
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
        <>
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.75rem',
            padding: '0.5rem 0',
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: 'var(--text-primary)' }}>Workflow:</strong>
          <ol style={{ margin: '0.25rem 0 0 1rem', paddingLeft: '0.5rem' }}>
            <li>Upload JSON to create site/sites</li>
            <li>Generate content (Claude)</li>
            <li>Create calculator</li>
            <li>Translate content to other languages</li>
            <li>Translate labels</li>
          </ol>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          {bookmarkTabs.map(({ stage, label, count, green }) => {
            const isActive = activeBookmark === stage;
            const accent = green && isActive ? 'var(--success-color, #10b981)' : 'var(--primary, #2563eb)';
            return (
              <button
                key={stage}
                type="button"
                onClick={() => setBookmark(stage)}
                style={{
                  padding: '0.6rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${accent}` : '2px solid transparent',
                  background: isActive ? (green ? 'rgba(16, 185, 129, 0.12)' : 'rgba(37, 99, 235, 0.08)') : 'transparent',
                  color: isActive ? accent : (green ? 'var(--success-color, #10b981)' : 'var(--text-secondary)'),
                  cursor: 'pointer',
                  borderRadius: '0.5rem 0.5rem 0 0',
                }}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
        </>
      )}

      {pages.length > 0 && (
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.9rem',
              border: '1px solid var(--border-color)',
              borderRadius: 6,
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              minWidth: 200,
              maxWidth: 320,
            }}
            aria-label="Search by page title"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.9rem',
              border: '1px solid var(--border-color)',
              borderRadius: 6,
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              minWidth: 140,
            }}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'latest' | 'oldest' | 'category' | 'slug')}
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.9rem',
              border: '1px solid var(--border-color)',
              borderRadius: 6,
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              minWidth: 140,
            }}
            aria-label="Sort by"
          >
            <option value="latest">Latest → Older</option>
            <option value="oldest">Oldest → Newer</option>
            <option value="category">Category A–Z</option>
            <option value="slug">Slug A–Z</option>
          </select>
        </div>
      )}

      {(activeBookmark === 'new' || activeBookmark === 'content-en-done' || activeBookmark === 'translation-done' || activeBookmark === 'calculator-done' || activeBookmark === 'done' || activeBookmark === 'completed-alive') && filteredPages.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Move to:
            <select
              value=""
              onChange={(e) => {
                const v = e.target.value as PageStage;
                if (v && VALID_MANUAL_BOOKMARKS.includes(v)) handleBulkBookmark(v);
                e.target.value = '';
              }}
              disabled={selectedCount === 0 || !!generateProgress || !!translateProgress || bulkBookmarkLoading}
              className="admin-form-select"
              style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', minWidth: 140 }}
            >
              <option value="">—</option>
              <option value="content-en-done">Content EN - Done</option>
              <option value="translation-done">24 Languages Translation done</option>
              <option value="calculator-done">Calc Code Generator Done</option>
              <option value="done">Done (TR+LB)</option>
              <option value="completed-alive">Alive</option>
            </select>
          </label>
          {(activeBookmark === 'done' || activeBookmark === 'completed-alive') && (
            <label
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                flexWrap: 'wrap',
              }}
            >
              Related calc:
              <select
                value={bulkRelatedMode}
                onChange={(e) => setBulkRelatedMode(e.target.value as 'manual' | 'random' | 'both')}
                disabled={bulkRelatedLoading || !!generateProgress || !!translateProgress}
                className="admin-form-select"
                style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', minWidth: 100 }}
                aria-label="Related calculators mode"
              >
                <option value="random">Random</option>
                <option value="manual">Manual</option>
                <option value="both">Both</option>
              </select>
              <span style={{ whiteSpace: 'nowrap' }}>count</span>
              <select
                value={String(bulkRelatedCount)}
                onChange={(e) => setBulkRelatedCount(Number(e.target.value))}
                disabled={bulkRelatedLoading || !!generateProgress || !!translateProgress}
                className="admin-form-select"
                style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', width: 56 }}
                aria-label="Related calculators count"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void handleBulkRelatedSettings()}
                disabled={
                  bulkRelatedLoading ||
                  filteredPages.length === 0 ||
                  !!generateProgress ||
                  !!translateProgress
                }
                className="btn btn-primary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                title={
                  selectedCount > 0
                    ? `Apply to ${selectedCount} selected page(s)`
                    : `Apply to all ${filteredPages.length} page(s) in this tab (nothing selected)`
                }
              >
                {bulkRelatedLoading
                  ? 'Saving…'
                  : selectedCount > 0
                    ? `Apply related (${selectedCount})`
                    : `Apply to all in tab (${filteredPages.length})`}
              </button>
            </label>
          )}
          {activeBookmark === 'new' && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Generate Content to add EN → moves to Content EN - Done</span>
          )}
          {activeBookmark === 'translation-done' && (
            <>
              <button
                type="button"
                onClick={handleBulkGenerateCalcCode}
                disabled={calcCodeGenLoading || !!generateProgress || !!translateProgress || !!translateLabelsLoading || (selectedCount === 0 && filteredPages.length === 0)}
                className="btn btn-primary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                title="Generate calculator TSX code from page title + How to Use content (Ollama). Overwrites existing code."
              >
                {calcCodeGenLoading
                  ? (calcCodeGenProgress ? `Generating… (${calcCodeGenProgress.current}/${calcCodeGenProgress.total}) ${calcCodeGenProgress.pageTitle}` : 'Generating…')
                  : `Generate calc script${(() => {
                      const n = selectedCount > 0 ? selectedCount : filteredPages.length;
                      return n > 0 ? ` (${n})` : '';
                    })()}`}
              </button>
              {calcCodeGenError && (
                <span style={{ fontSize: '0.85rem', color: 'var(--error-color)' }}>{calcCodeGenError}</span>
              )}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Uses Ollama model dropdown. Overwrites existing code if present. After generation → Calc Code Generator Done.</span>
            </>
          )}
          {activeBookmark === 'content-en-done' && (
            <>
              {filteredPages.filter((p) => hasEnContent(p) && !hasAllTranslations(p)).length > 0 && (
                <button
                  type="button"
                  onClick={handleTranslateMissingTranslations}
                  disabled={!!generateProgress || !!translateProgress || !!translateLabelsLoading}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '0.35rem 0.75rem' }}
                  title="Translate content to missing languages (24 locales)"
                >
                  Translate missing translations
                </button>
              )}
              <button
                type="button"
                onClick={handleBatchTranslate}
                disabled={selectedCount === 0 || !!generateProgress || !!translateProgress || !!translateLabelsLoading}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
              >
                {translateProgress
                  ? `Tłumaczenie… (${translateProgress.current}/${translateProgress.total})`
                  : translatePausedAt
                    ? `Resume od (${translateStartFrom || ''})`
                    : translateOnlyOne
                      ? `Translate only (${translateStartFrom || ''})`
                      : 'Translate'}
              </button>
              {translateProgress && (
                <>
                  <button type="button" onClick={pauseTranslate} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.75rem' }}>
                    Pause
                  </button>
                  <button type="button" onClick={clearPaused} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.75rem' }}>
                    Wyczyść status
                  </button>
                </>
              )}
              {translatePausedAt && !translateProgress && (
                <button type="button" onClick={() => handleBatchTranslate()} className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.75rem' }}>
                  Resume
                </button>
              )}
            </>
          )}
          {activeBookmark === 'calculator-done' && (
            <>
              <button
                type="button"
                onClick={handleBulkGenerateCalcCode}
                disabled={calcCodeGenLoading || !!generateProgress || !!translateProgress || !!translateLabelsLoading || (selectedCount === 0 && filteredPages.length === 0)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                title="Regenerate calculator code (overwrites existing). Use after interrupted generation."
              >
                {calcCodeGenLoading ? `Generating… (${calcCodeGenProgress?.current ?? 0}/${calcCodeGenProgress?.total ?? 0})` : `Regenerate calc script${selectedCount > 0 || filteredPages.length > 0 ? ` (${selectedCount > 0 ? selectedCount : filteredPages.length})` : ''}`}
              </button>
              {calcCodeGenError && (
                <span style={{ fontSize: '0.85rem', color: 'var(--error-color)' }}>{calcCodeGenError}</span>
              )}
              <button
                type="button"
                onClick={() => handleBulkTranslateLabels()}
                disabled={selectedCount === 0 || !!generateProgress || !!translateProgress || !!translateLabelsLoading}
                className="btn btn-primary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                title="Translate Calculator labels from EN to all other languages (Ollama)"
              >
                {translateLabelsLoading ? 'Translate Labels…' : 'Translate Labels'}
              </button>
              <button
                type="button"
                onClick={() => handleBulkTranslateMissingLabels()}
                disabled={selectedCount === 0 || !!generateProgress || !!translateProgress || !!translateLabelsLoading}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                title="Translate only empty/missing labels (for recovery after errors, timeouts, internet issues)"
              >
                {translateLabelsLoading ? 'Translating…' : 'Translate missing labels'}
              </button>
              <button
                type="button"
                onClick={() => setShowSeoCheckModal(true)}
                disabled={!!generateProgress || !!translateProgress}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                title="Check SEO (title, meta, slug) for selected pages"
              >
                SEO Check
              </button>
            </>
          )}
          {activeBookmark === 'done' && (
            <>
              <button
                type="button"
                onClick={handleCheckTranslations}
                disabled={!!generateProgress || !!translateProgress}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                title={`Check if selected pages have content for all ${ADMIN_LOCALES.length} locales`}
              >
                Check translations
              </button>
              <button
                type="button"
                onClick={handleCheckLabels}
                disabled={!!generateProgress || !!translateProgress}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                title={`Check if selected pages have calculator labels for all ${ADMIN_LOCALES.length} locales`}
              >
                Check labels
              </button>
              <button
                type="button"
                onClick={() => setShowSeoCheckModal(true)}
                disabled={!!generateProgress || !!translateProgress}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                title="Check SEO (title, meta, slug) for selected pages"
              >
                SEO Check
              </button>
              <button
                type="button"
                onClick={() => handleBulkTranslateMissingLabels()}
                disabled={selectedCount === 0 || !!generateProgress || !!translateProgress || !!translateLabelsLoading}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                title="Translate only empty/missing labels"
              >
                {translateLabelsLoading ? 'Translating…' : 'Translate missing labels'}
              </button>
              <button
                type="button"
                onClick={handleCleanContentAndLabels}
                disabled={selectedIds.size === 0 || cleanContentLoading || !!generateProgress || !!translateProgress}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem', color: 'var(--warning-color, #f97316)', borderColor: 'var(--warning-color, #f97316)' }}
                title="Wyczyść content i labels dla zaznaczonych stron. Zostanie tylko oryginalny EN."
              >
                {cleanContentLoading ? 'Cleaning…' : `Clean Content and Labels (${selectedIds.size})`}
              </button>
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
                {bulkPublishLoading ? 'Unpublishing…' : `Unpublish (${selectedIds.size})`}
              </button>
            </>
          )}
          {activeBookmark === 'completed-alive' && (
            <>
              <button
                type="button"
                onClick={handleCheckTranslations}
                disabled={!!generateProgress || !!translateProgress}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                title={`Check if selected pages have content for all ${ADMIN_LOCALES.length} locales`}
              >
                Check translations
              </button>
              <button
                type="button"
                onClick={handleCheckLabels}
                disabled={!!generateProgress || !!translateProgress}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                title={`Check if selected pages have calculator labels for all ${ADMIN_LOCALES.length} locales`}
              >
                Check labels
              </button>
              <button
                type="button"
                onClick={() => setShowSeoCheckModal(true)}
                disabled={!!generateProgress || !!translateProgress}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                title="Check SEO (title, meta, slug) for selected pages"
              >
                SEO Check
              </button>
              <button
                type="button"
                onClick={() => handleBulkTranslateMissingLabels()}
                disabled={selectedCount === 0 || !!generateProgress || !!translateProgress || !!translateLabelsLoading}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
                title="Translate only empty/missing labels"
              >
                {translateLabelsLoading ? 'Translating…' : 'Translate missing labels'}
              </button>
              <button
                type="button"
                onClick={() => handleBulkPublish(false)}
                disabled={selectedIds.size === 0 || bulkPublishLoading || !!generateProgress || !!translateProgress}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
              >
                {bulkPublishLoading ? 'Unpublishing…' : `Unpublish (${selectedIds.size})`}
              </button>
            </>
          )}
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
          Limit: 48 h (Ollama). Przy timeout — spróbuj ponownie. Retry: 2x.
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
      {(generateError || translateError || translateLabelsError) && !autoResumeCountdown && (
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
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <span style={{ flex: 1 }}>
            {[generateError, translateError, translateLabelsError].filter(Boolean).join(' ')}
          </span>
          <button
            type="button"
            onClick={() => setTranslateLabelsError('')}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.2rem 0.5rem', flexShrink: 0 }}
            title="Zamknij"
          >
            ×
          </button>
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
        <>
          <div
            role="status"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              margin: 0,
              padding: '1rem 1.25rem',
              background: 'rgba(16, 185, 129, 0.95)',
              borderBottom: '2px solid var(--success-color, #10b981)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <span>✓ {generateSuccess || translateSuccess || translateLabelsSuccess}</span>
            <button
              type="button"
              onClick={() => {
                setTranslateLabelsSuccess('');
                setGenerateSuccess('');
                setTranslateSuccess('');
              }}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.5)', color: '#fff', flexShrink: 0 }}
            >
              Zamknij
            </button>
          </div>
          <div style={{ height: 56 }} />
        </>
      )}
      {checkResult && (
        <div
          role="status"
          style={{
            marginBottom: '1rem',
            padding: '1rem 1.25rem',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            fontSize: '0.85rem',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Check result</strong>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {checkFailedType === 'translations' && checkFailedIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleCompleteTranslationsFromCheck}
                  disabled={!!translateProgress || !!translateLabelsLoading}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  Complete translations
                </button>
              )}
              {checkFailedType === 'labels' && checkFailedIds.size > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleCompleteLabelsFromCheck(false)}
                    disabled={!!translateProgress || !!translateLabelsLoading}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '0.25rem 0.5rem' }}
                  >
                    Complete labels
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCompleteLabelsFromCheck(true)}
                    disabled={!!translateProgress || !!translateLabelsLoading}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.5rem' }}
                    title="Translate only empty/missing labels"
                  >
                    Complete missing labels
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setCheckResult(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.25rem 0.5rem' }}
              >
                Dismiss
              </button>
            </div>
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>{checkResult}</div>
        </div>
      )}

      {showSeoCheckModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '2rem 1rem',
            overflow: 'auto',
          }}
          onClick={() => setShowSeoCheckModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-primary)',
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              maxWidth: 560,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '1.25rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '1.1rem' }}>SEO Check</strong>
              <button
                type="button"
                onClick={() => setShowSeoCheckModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem' }}
              >
                Close
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(selectedCount > 0 ? pages.filter((p) => selectedIds.has(p.id)) : filteredPages).map((p) => {
                const en = p.translations.find((t) => t.locale === 'en');
                const title = en?.title?.trim() ?? '';
                const displayTitle = en?.displayTitle?.trim() ?? '';
                const description = en?.description?.trim() ?? '';
                return (
                  <div key={p.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      {p.slug} ({p.category ?? '—'})
                    </div>
                    <SeoChecker
                      title={title}
                      displayTitle={displayTitle}
                      description={description}
                      slug={p.slug}
                      category={p.category ?? ''}
                      locale="en"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {generateProgress && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span>{generateProgress.current} / {generateProgress.total} — {generateProgress.title || '…'}</span>
            <button
              type="button"
              onClick={pauseGenerate}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.35rem 0.75rem', color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
            >
              Cancel
            </button>
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

      {translateProgress && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ flex: 1 }}>
              Translate content: {translateProgress.current} / {translateProgress.total}
              {translateProgress.pageTitle && translateProgress.locale && (
                <> — <strong>Translating:</strong> {translateProgress.pageTitle} ({translateProgress.locale})</>
              )}
              {translateProgress.startedAt && (
                <span style={{ marginLeft: '0.5rem', color: 'var(--text-tertiary)' }}>
                  (running {Math.floor((Date.now() - translateProgress.startedAt) / 60000)}m {Math.floor(((Date.now() - translateProgress.startedAt) % 60000) / 1000)}s)
                </span>
              )}
              {translatePauseCountdown !== null && <span style={{ marginLeft: '0.5rem', color: 'var(--warning-color, #f97316)' }}>• Pauza {translatePauseCountdown}s</span>}
            </span>
            <button
              type="button"
              onClick={pauseTranslate}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.35rem 0.75rem', color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
            >
              Cancel
            </button>
            {translateProgress.pageTitle && translateProgress.pageCategory && (
              <a
                href={(() => {
                  const r = resolveCalculatorPath(`/calculators/${translateProgress.pageCategory}/${translateProgress.pageTitle}`);
                  const firstLoc = translateProgress.locale?.split(',')[0]?.trim() || 'en';
                  const base = firstLoc === 'en' ? `/en${r}` : `/${firstLoc}${r}`;
                  return `${base}?preview=1`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: '0.25rem', fontSize: '0.8rem', color: 'var(--primary)' }}
              >
                Preview →
              </a>
            )}
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
                width: `${translateProgress.total > 0 ? (translateProgress.current / translateProgress.total) * 100 : 0}%`,
                backgroundColor: 'var(--primary, #2563eb)',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            Keep this tab open. Ollama may take 5–30+ min per locale.
          </div>
        </div>
      )}

      {translateLabelsProgress && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ flex: 1 }}>
              Translate Labels: {translateLabelsProgress.current} / {translateLabelsProgress.total}
              {translateLabelsProgress.pageSlug && translateLabelsProgress.locale && (
                <> — <strong>Translating:</strong> {translateLabelsProgress.pageSlug} → {translateLabelsProgress.locale}</>
              )}
              {translateLabelsProgress.startedAt && (
                <span style={{ marginLeft: '0.5rem', color: 'var(--text-tertiary)' }}>
                  (running {Math.floor((Date.now() - translateLabelsProgress.startedAt) / 60000)}m {Math.floor(((Date.now() - translateLabelsProgress.startedAt) % 60000) / 1000)}s)
                </span>
              )}
            </span>
            {translateLabelsPausedAt && <span style={{ color: 'var(--warning-color, #f97316)' }}>• Paused</span>}
            <button
              type="button"
              onClick={abortTranslateLabels}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.35rem 0.75rem', color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
            >
              Cancel
            </button>
            {translateLabelsProgress.pageSlug && (
              <a
                href={(() => {
                  const r = resolveCalculatorPath(`/calculators/${translateLabelsProgress.pageCategory}/${translateLabelsProgress.pageSlug}`);
                  const base = translateLabelsProgress.locale === 'en' ? `/en${r}` : `/${translateLabelsProgress.locale}${r}`;
                  return `${base}?preview=1`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: '0.25rem', fontSize: '0.8rem', color: 'var(--primary)' }}
              >
                Preview →
              </a>
            )}
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
            Keep this tab open. Ollama may take 5–30+ min per locale. You can switch to other tabs; don&apos;t close or navigate away.
          </div>
        </div>
      )}

      {pages.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No pages yet. Create your first page.</p>
      ) : filteredPages.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>
          No pages in <strong>
            {activeBookmark === 'new' ? 'NEW' : activeBookmark === 'content-en-done' ? 'Content EN - Done' : activeBookmark === 'translation-done' ? '24 Languages Translation done' : activeBookmark === 'calculator-done' ? 'Calc Code Generator Done' : activeBookmark === 'completed-alive' ? 'Alive' : 'Done (TR+LB)'}
          </strong>
          {searchQuery.trim() ? ' matching search' : ''}. Switch tab or create a page.
        </p>
      ) : (
        <>
        {showPagination && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Page {pageNum} of {totalPages} ({filteredPages.length} total)
            </span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                type="button"
                onClick={() => setPageNum((n) => Math.max(1, n - 1))}
                disabled={pageNum <= 1}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.6rem' }}
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => setPageNum((n) => Math.min(totalPages, n + 1))}
                disabled={pageNum >= totalPages}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.6rem' }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {paginatedPages.map((page) => {
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
                  {page.published && (
                    <a
                      href={resolveCalculatorPath(`/calculators/${page.category}/${page.slug}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ background: 'var(--success-color, #10b981)', borderColor: 'var(--success-color)' }}
                    >
                      Show
                    </a>
                  )}
                  {page.translations.map((t) => {
                    const resolvedPath = resolveCalculatorPath(`/calculators/${page.category}/${page.slug}`);
                    const baseUrl = t.locale === 'en' ? `/en${resolvedPath}` : `/${t.locale}${resolvedPath}`;
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
                  <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>→</span>
                    <select
                      value=""
                      onChange={async (e) => {
                        const v = e.target.value as PageStage;
                        e.target.value = '';
                        if (!v || !VALID_MANUAL_BOOKMARKS.includes(v)) return;
                        setBulkBookmarkLoading(true);
                        try {
                          const res = await fetch('/api/twojastara/pages/bulk-bookmark', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ids: [page.id], manualBookmark: v }),
                            credentials: 'include',
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Move failed');
                          const updated = Array.isArray(data) ? data : [];
                          const u = updated.find((x: { id: string }) => x.id === page.id);
                          if (u) {
                            setPages((prev) =>
                              prev.map((p) => (p.id === page.id ? { ...p, manualBookmark: (u as Page).manualBookmark ?? null } : p))
                            );
                            setActiveBookmark(v);
                          }
                        } catch (err) {
                          alert(err instanceof Error ? err.message : 'Move failed');
                        } finally {
                          setBulkBookmarkLoading(false);
                        }
                      }}
                      disabled={!!generateProgress || !!translateProgress || bulkBookmarkLoading}
                      className="admin-form-select"
                      style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem' }}
                    >
                      <option value="">Move</option>
                      <option value="content-en-done">Content EN</option>
                      <option value="translation-done">Translation done</option>
                      <option value="calculator-done">Calc Code Gen Done</option>
                      <option value="done">Done (TR+LB)</option>
                      <option value="completed-alive">Alive</option>
                    </select>
                  </label>
                  <Link href={`/twojastara/pages/${page.id}/edit?tab=${activeBookmark}`} className="btn btn-primary btn-sm">
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
        </>
      )}
    </div>
  );
}
