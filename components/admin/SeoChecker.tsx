'use client';

export interface SeoCheckInput {
  title: string;
  displayTitle: string;
  description: string;
  slug?: string;
  category?: string;
  locale?: string;
}

interface CheckItem {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  value?: string;
}

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 160;

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function SeoChecker({ title, displayTitle, description, slug = '', category = '', locale = '' }: SeoCheckInput) {
  const checks: CheckItem[] = [];
  const t = (title?.trim() ?? '');
  const d = (displayTitle?.trim() ?? '');
  const desc = (description?.trim() ?? '');
  const sl = (slug?.trim() ?? '').toLowerCase().replace(/\s+/g, '-');
  const cat = (category?.trim() ?? '').toLowerCase();

  if (!t) {
    checks.push({ id: 'title', label: 'SEO Title', status: 'fail', message: 'Required for search results', value: t });
  } else if (t.length < TITLE_MIN) {
    checks.push({
      id: 'title',
      label: 'SEO Title',
      status: 'warn',
      message: `Short (${t.length} chars). Aim 30–60 for best display.`,
      value: t,
    });
  } else if (t.length > TITLE_MAX) {
    checks.push({
      id: 'title',
      label: 'SEO Title',
      status: 'warn',
      message: `Long (${t.length} chars). Google may truncate after ~60.`,
      value: t,
    });
  } else {
    checks.push({ id: 'title', label: 'SEO Title', status: 'pass', message: `${t.length} chars ✓`, value: t });
  }

  if (!d) {
    checks.push({ id: 'displayTitle', label: 'H1 Title', status: 'warn', message: 'Empty — page may lack clear heading', value: d });
  } else {
    checks.push({ id: 'displayTitle', label: 'H1 Title', status: 'pass', message: 'Set ✓', value: d });
  }

  if (!desc) {
    checks.push({ id: 'description', label: 'Meta Description', status: 'fail', message: 'Required for search snippets', value: desc });
  } else if (desc.length < DESC_MIN) {
    checks.push({
      id: 'description',
      label: 'Meta Description',
      status: 'warn',
      message: `Short (${desc.length} chars). Aim 150–160 for best results.`,
      value: desc,
    });
  } else if (desc.length > DESC_MAX) {
    checks.push({
      id: 'description',
      label: 'Meta Description',
      status: 'warn',
      message: `Long (${desc.length} chars). May be truncated in results.`,
      value: desc,
    });
  } else {
    checks.push({ id: 'description', label: 'Meta Description', status: 'pass', message: `${desc.length} chars ✓`, value: desc });
  }

  if (!cat) {
    checks.push({ id: 'category', label: 'Category', status: 'fail', message: 'Required for URL path', value: cat });
  } else {
    checks.push({ id: 'category', label: 'Category', status: 'pass', message: `${cat} ✓`, value: cat });
  }

  if (!sl) {
    checks.push({ id: 'slug', label: 'Slug / URL', status: 'fail', message: 'Required for page URL', value: sl });
  } else if (!SLUG_REGEX.test(sl)) {
    checks.push({
      id: 'slug',
      label: 'Slug / URL',
      status: 'warn',
      message: 'Use lowercase, hyphens only (e.g. adding-fractions)',
      value: sl,
    });
  } else {
    const path = `/calculators/${cat}/${sl}`;
    const url = locale && locale !== 'en' ? `/${locale}${path}` : path;
    checks.push({ id: 'slug', label: 'Slug / URL', status: 'pass', message: url, value: sl });
  }

  const passCount = checks.filter((c) => c.status === 'pass').length;
  const hasFail = checks.some((c) => c.status === 'fail');

  return (
    <div
      className="seo-checker"
      style={{
        marginTop: '0.75rem',
        padding: '0.75rem 1rem',
        background: hasFail ? 'rgba(220, 53, 69, 0.08)' : 'var(--bg-tertiary)',
        borderRadius: 8,
        border: `1px solid ${hasFail ? 'rgba(220, 53, 69, 0.3)' : 'var(--border-color)'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
        <span>SEO Check {locale ? `[${locale}]` : ''}</span>
        <span style={{ color: hasFail ? '#dc3545' : '#198754', fontSize: '0.75rem', fontWeight: 400 }}>
          {passCount}/{checks.length}
        </span>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {checks.map((c) => (
          <li
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              fontSize: '0.8rem',
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: 18,
                height: 18,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  c.status === 'pass' ? '#198754' : c.status === 'warn' ? '#ffc107' : '#dc3545',
                color: c.status === 'pass' ? '#fff' : '#fff',
                fontSize: 10,
                lineHeight: 1,
              }}
            >
              {c.status === 'pass' ? '✓' : c.status === 'warn' ? '!' : '✗'}
            </span>
            <div>
              <strong>{c.label}:</strong> {c.message}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
