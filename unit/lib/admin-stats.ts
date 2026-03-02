/**
 * Shared stats logic for admin dashboard and stats subpage.
 */
import { prisma } from '@/lib/prisma';
import { ADMIN_LOCALES } from '@/lib/admin-locales';

export type PageWithTranslations = Awaited<ReturnType<typeof prisma.page.findMany<{
  include: { translations: true };
}>>>[number];

export type Stage = 'new' | 'in-progress' | 'translate-label' | 'completed' | 'completed-alive';

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw?.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function hasEnContent(page: PageWithTranslations): boolean {
  const en = page.translations.find((t) => t.locale === 'en');
  return !!(en?.content && en.content.trim().length > 0);
}

export function hasAllTranslations(page: PageWithTranslations): boolean {
  const localeSet = new Set(page.translations.filter((t) => t.content?.trim()).map((t) => t.locale));
  return ADMIN_LOCALES.every((loc) => localeSet.has(loc));
}

export function hasAllLabelsTranslated(page: PageWithTranslations): boolean {
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

export function getPageStage(page: PageWithTranslations): Stage {
  if (!hasEnContent(page)) return 'new';
  if (!hasAllTranslations(page)) return 'in-progress';
  if (!hasAllLabelsTranslated(page)) return 'translate-label';
  return page.published ? 'completed-alive' : 'completed';
}

const STAGE_LABELS: Record<Stage, string> = {
  new: 'New',
  'in-progress': 'Translation',
  'translate-label': 'Labels',
  completed: 'Completed',
  'completed-alive': 'Live',
};

export { STAGE_LABELS };

export type StatsExtended = {
  total: number;
  published: number;
  byStage: Record<Stage, number>;
  categories: [string, number][];
  funnelData: { name: string; value: number; stage: Stage; fill: string }[];
  donutData: { name: string; value: number; fill: string }[];
  categoryBarData: { name: string; count: number }[];
  localeCoverage: { locale: string; count: number; pct: number }[];
  activityByWeek: { week: string; created: number; updated: number }[];
  translationProgress: { filled: number; total: number; avgPerPage: number };
  withCalculator: number;
};

const STAGE_COLORS: Record<Stage, string> = {
  new: '#6b7280',
  'in-progress': '#3b82f6',
  'translate-label': '#f59e0b',
  completed: '#8b5cf6',
  'completed-alive': '#10b981',
};

export function getStageColor(stage: Stage): string {
  return STAGE_COLORS[stage];
}

export async function getStatsExtended(): Promise<StatsExtended> {
  const pages = await prisma.page.findMany({
    include: { translations: true },
    orderBy: { updatedAt: 'desc' },
  });

  const byStage: Record<Stage, number> = {
    new: 0,
    'in-progress': 0,
    'translate-label': 0,
    completed: 0,
    'completed-alive': 0,
  };

  const byCategory: Record<string, number> = {};
  const byLocale: Record<string, number> = {};
  let filledSlots = 0;
  let withCalculator = 0;

  const weeksBack = 12;
  const weekKeys: string[] = [];
  const activityCreated: Record<string, number> = {};
  const activityUpdated: Record<string, number> = {};

  for (let i = 0; i < weeksBack; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (weeksBack - 1 - i) * 7);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    const key = d.toISOString().slice(0, 10);
    weekKeys.push(key);
    activityCreated[key] = 0;
    activityUpdated[key] = 0;
  }

  const getWeekKey = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  };

  for (const p of pages) {
    const stage = getPageStage(p);
    byStage[stage]++;
    const cat = p.category || 'uncategorized';
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;

    if ((p.calculatorCode ?? '').trim()) withCalculator++;

    for (const t of p.translations) {
      if (t.content?.trim()) {
        byLocale[t.locale] = (byLocale[t.locale] ?? 0) + 1;
        filledSlots++;
      }
    }

    const createdKey = getWeekKey(p.createdAt);
    const updatedKey = getWeekKey(p.updatedAt);
    if (activityCreated[createdKey] !== undefined) activityCreated[createdKey]++;
    if (activityUpdated[updatedKey] !== undefined) activityUpdated[updatedKey]++;
  }

  const total = pages.length;
  const published = pages.filter((p) => p.published).length;
  const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  const funnelData: { name: string; value: number; stage: Stage; fill: string }[] = [
    { name: STAGE_LABELS.new, value: byStage.new, stage: 'new', fill: STAGE_COLORS.new },
    { name: STAGE_LABELS['in-progress'], value: byStage['in-progress'], stage: 'in-progress', fill: STAGE_COLORS['in-progress'] },
    { name: STAGE_LABELS['translate-label'], value: byStage['translate-label'], stage: 'translate-label', fill: STAGE_COLORS['translate-label'] },
    { name: STAGE_LABELS.completed, value: byStage.completed, stage: 'completed', fill: STAGE_COLORS.completed },
    { name: STAGE_LABELS['completed-alive'], value: byStage['completed-alive'], stage: 'completed-alive', fill: STAGE_COLORS['completed-alive'] },
  ];

  const donutData = funnelData.map((d) => ({
    name: d.name,
    value: d.value,
    fill: d.fill,
  }));

  const categoryBarData = categories.slice(0, 16).map(([name, count]) => ({ name, count }));

  const localeCoverage = ADMIN_LOCALES.map((locale) => {
    const count = byLocale[locale] ?? 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { locale, count, pct };
  }).sort((a, b) => b.count - a.count);

  const activityByWeek = weekKeys.map((key) => ({
    week: key.slice(5),
    created: activityCreated[key] ?? 0,
    updated: activityUpdated[key] ?? 0,
  }));

  const totalSlots = total * ADMIN_LOCALES.length;
  const avgPerPage = total > 0 ? (filledSlots / total) : 0;

  return {
    total,
    published,
    byStage,
    categories,
    funnelData,
    donutData,
    categoryBarData,
    localeCoverage,
    activityByWeek,
    translationProgress: { filled: filledSlots, total: totalSlots, avgPerPage },
    withCalculator,
  };
}
