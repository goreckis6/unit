import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ADMIN_LOCALES } from '@/lib/admin-locales';

type PageWithTranslations = Awaited<ReturnType<typeof prisma.page.findMany<{
  include: { translations: true };
}>>>[number];

function hasEnContent(page: PageWithTranslations): boolean {
  const en = page.translations.find((t) => t.locale === 'en');
  return !!(en?.content && en.content.trim().length > 0);
}

function hasAllTranslations(page: PageWithTranslations): boolean {
  const localeSet = new Set(page.translations.filter((t) => t.content?.trim()).map((t) => t.locale));
  return ADMIN_LOCALES.every((loc) => localeSet.has(loc));
}

function hasCalculatorWithEnLabels(page: PageWithTranslations): boolean {
  const hasCalc = !!(page.calculatorCode ?? '').trim() || !!(page.linkedCalculatorPath ?? '').trim();
  if (!hasCalc) return false;
  const en = page.translations.find((t) => t.locale === 'en');
  const enLab = parseJson<Record<string, string>>(en?.calculatorLabels, {});
  return Object.keys(enLab).filter((k) => enLab[k]?.trim()).length > 0;
}

function hasAllLabelsTranslated(page: PageWithTranslations): boolean {
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

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw?.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

type Stage = 'new' | 'content-en-done' | 'translation-done' | 'calculator-done' | 'done' | 'completed-alive';

function getPageStage(page: PageWithTranslations): Stage {
  if (!hasEnContent(page)) return 'new';
  if (!hasAllTranslations(page)) return 'content-en-done';
  const hasCalc = !!(page.calculatorCode ?? '').trim() || !!(page.linkedCalculatorPath ?? '').trim();
  if (!hasCalc) return 'translation-done'; // 24 langs done, next: add calculator + EN labels
  if (!hasCalculatorWithEnLabels(page)) return 'calculator-done';
  if (!hasAllLabelsTranslated(page)) return 'calculator-done';
  return page.published ? 'completed-alive' : 'done'; // Done (TR+LB)
}

async function getStats() {
  const pages = await prisma.page.findMany({
    include: { translations: true },
    orderBy: { updatedAt: 'desc' },
  });

  const byStage: Record<Stage, number> = {
    new: 0,
    'content-en-done': 0,
    'translation-done': 0,
    'calculator-done': 0,
    done: 0,
    'completed-alive': 0,
  };

  const byCategory: Record<string, number> = {};

  for (const p of pages) {
    const stage = getPageStage(p);
    byStage[stage]++;
    const cat = p.category || 'uncategorized';
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;
  }

  const published = pages.filter((p) => p.published).length;
  const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  return {
    total: pages.length,
    published,
    byStage,
    categories,
    recentPages: pages.slice(0, 8),
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const { total, published, byStage, categories, recentPages } = stats;

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        Admin Dashboard
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Manage pages with multi-language support.
      </p>

      {/* Stats cards */}
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card dashboard-stat-primary">
          <span className="dashboard-stat-value">{total}</span>
          <span className="dashboard-stat-label">Total Pages</span>
        </div>
        <div className="dashboard-stat-card dashboard-stat-success">
          <span className="dashboard-stat-value">{published}</span>
          <span className="dashboard-stat-label">Published</span>
        </div>
        <div className="dashboard-stat-card dashboard-stat-info">
          <span className="dashboard-stat-value">{byStage['content-en-done'] + byStage['translation-done']}</span>
          <span className="dashboard-stat-label">In Progress</span>
        </div>
        <div className="dashboard-stat-card dashboard-stat-warning">
          <span className="dashboard-stat-value">{byStage['calculator-done']}</span>
          <span className="dashboard-stat-label">Calculator Pending</span>
        </div>
        <div className="dashboard-stat-card dashboard-stat-muted">
          <span className="dashboard-stat-value">{byStage.new}</span>
          <span className="dashboard-stat-label">New</span>
        </div>
      </div>

      {/* Stage funnel chart */}
      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Pipeline Funnel</h2>
        <div className="dashboard-funnel">
          <div className="dashboard-funnel-row" data-stage="new">
            <span className="dashboard-funnel-label">New</span>
            <div className="dashboard-funnel-bar-wrap">
              <div
                className="dashboard-funnel-bar"
                style={{ width: total ? `${(byStage.new / total) * 100}%` : 0 }}
              />
            </div>
            <span className="dashboard-funnel-count">{byStage.new}</span>
          </div>
          <div className="dashboard-funnel-row" data-stage="content-en-done">
            <span className="dashboard-funnel-label">Content EN</span>
            <div className="dashboard-funnel-bar-wrap">
              <div
                className="dashboard-funnel-bar"
                style={{ width: total ? `${(byStage['content-en-done'] / total) * 100}%` : 0 }}
              />
            </div>
            <span className="dashboard-funnel-count">{byStage['content-en-done']}</span>
          </div>
          <div className="dashboard-funnel-row" data-stage="translation-done">
            <span className="dashboard-funnel-label">24 Languages</span>
            <div className="dashboard-funnel-bar-wrap">
              <div
                className="dashboard-funnel-bar"
                style={{ width: total ? `${(byStage['translation-done'] / total) * 100}%` : 0 }}
              />
            </div>
            <span className="dashboard-funnel-count">{byStage['translation-done']}</span>
          </div>
          <div className="dashboard-funnel-row" data-stage="calculator-done">
            <span className="dashboard-funnel-label">Calculator</span>
            <div className="dashboard-funnel-bar-wrap">
              <div
                className="dashboard-funnel-bar"
                style={{ width: total ? `${(byStage['calculator-done'] / total) * 100}%` : 0 }}
              />
            </div>
            <span className="dashboard-funnel-count">{byStage['calculator-done']}</span>
          </div>
          <div className="dashboard-funnel-row" data-stage="done">
            <span className="dashboard-funnel-label">Done (TR+LB)</span>
            <div className="dashboard-funnel-bar-wrap">
              <div
                className="dashboard-funnel-bar"
                style={{ width: total ? `${(byStage.done / total) * 100}%` : 0 }}
              />
            </div>
            <span className="dashboard-funnel-count">{byStage.done}</span>
          </div>
          <div className="dashboard-funnel-row" data-stage="completed-alive">
            <span className="dashboard-funnel-label">Live</span>
            <div className="dashboard-funnel-bar-wrap">
              <div
                className="dashboard-funnel-bar"
                style={{ width: total ? `${(byStage['completed-alive'] / total) * 100}%` : 0 }}
              />
            </div>
            <span className="dashboard-funnel-count">{byStage['completed-alive']}</span>
          </div>
        </div>
      </section>

      {/* Categories breakdown */}
      {categories.length > 0 && (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">By Category</h2>
          <div className="dashboard-categories">
            {categories.slice(0, 12).map(([cat, count]) => (
              <div key={cat} className="dashboard-category-pill">
                <span>{cat}</span>
                <span className="dashboard-category-count">{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent pages */}
      {recentPages.length > 0 && (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Recent Updates</h2>
          <ul className="dashboard-recent-list">
            {recentPages.map((p) => (
              <li key={p.id}>
                <Link href={`/twojastara/pages/${p.id}/edit`} className="dashboard-recent-link">
                  <span>{p.category}/{p.slug}</span>
                  <span className="dashboard-recent-stage" data-stage={getPageStage(p)}>
                    {getPageStage(p).replace('-', ' ')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Action cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem',
        }}
      >
        <Link href="/twojastara/pages" className="admin-card">
          <h2>Pages</h2>
          <p>
            Create and manage pages with translations for all 24 languages
          </p>
          <span className="admin-card-cta">View all</span>
        </Link>

        <Link href="/twojastara/pages/new" className="admin-card">
          <h2>Add New Page</h2>
          <p>
            Create a new page with language support
          </p>
          <span className="admin-card-cta">Create</span>
        </Link>
      </div>
    </div>
  );
}
