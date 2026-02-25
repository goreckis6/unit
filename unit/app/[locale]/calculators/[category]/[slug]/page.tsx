import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { ROUTING_LOCALES } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FaqSection } from '@/components/FaqSection';
import { FaqSchema } from '@/components/FaqSchema';
import { renderMarkdown } from '@/lib/markdown';
import { getRelatedCalculatorsForPage } from '@/lib/related-calculators';
import { hasCalculatorEmbed } from '@/lib/calculator-embeds';
import { getDefaultCalculatorLabels } from '@/lib/calculator-default-labels';
import { Link } from '@/i18n/routing';
import { CalculatorSandpackClient } from '@/components/CalculatorSandpackClient';

type Props = {
  params: Promise<{ locale: string; category: string; slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
};

function getCategoryBadge(category: string): string {
  const labels: Record<string, string> = {
    math: 'Math Calculator',
    electric: 'Electric Calculator',
    biology: 'Biology Calculator',
    conversion: 'Conversion Calculator',
    physics: 'Physics Calculator',
    'real-life': 'Real Life Calculator',
    finance: 'Finance Calculator',
    others: 'Others',
    health: 'Health Calculator',
    chemistry: 'Chemistry Calculator',
    construction: 'Construction Calculator',
    ecology: 'Ecology Calculator',
    food: 'Food Calculator',
    statistics: 'Statistics Calculator',
    info: 'Info',
    blog: 'Blog',
  };
  return labels[category] ?? `${category.charAt(0).toUpperCase()}${category.slice(1)} Calculator`;
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale, category, slug } = await params;
  const page = await prisma.page.findFirst({
    where: { category, slug },
    include: { translations: true },
  });
  if (!page) return { title: 'Not Found' };
  const isPreview = (await searchParams)?.preview === '1';
  const session = isPreview ? await getSession() : null;
  const canView = page.published || (isPreview && session);
  if (!canView) return { title: 'Not Found' };
  const t = page.translations.find((x) => x.locale === locale) ?? page.translations[0];
  return {
    title: t?.title ?? 'Page',
    description: t?.description ?? undefined,
  };
}

export default async function CalculatorPage({ params, searchParams }: Props) {
  const { locale, category, slug } = await params;
  setRequestLocale(locale);

  if (!ROUTING_LOCALES.includes(locale)) {
    notFound();
  }

  const page = await prisma.page.findFirst({
    where: { category, slug },
    include: { translations: true },
  });

  if (!page) notFound();

  const isPreview = (await searchParams)?.preview === '1';
  const session = await getSession();
  const canView = page.published || (isPreview && session);

  if (!canView) notFound();

  const translation = page.translations.find((t) => t.locale === locale)
    ?? page.translations.find((t) => t.locale === 'en')
    ?? page.translations[0];

  if (!translation) notFound();

  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const htmlContent = translation.content
    ? await renderMarkdown(translation.content)
    : '';

  let manualRelated: { title: string; description: string; path: string }[] = [];
  let faqItems: { question: string; answer: string }[] = [];
  let calculatorLabels: Record<string, string> | null = null;
  try {
    if (translation.relatedCalculators) manualRelated = JSON.parse(translation.relatedCalculators) as { title: string; description: string; path: string }[];
  } catch {}
  try {
    if (translation.faqItems) faqItems = JSON.parse(translation.faqItems) as { question: string; answer: string }[];
  } catch {}
  try {
    if (translation.calculatorLabels) {
      const parsed = JSON.parse(translation.calculatorLabels) as Record<string, unknown>;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        calculatorLabels = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof k === 'string' && typeof v === 'string') calculatorLabels[k] = v;
        }
      }
    }
  } catch {}
  if (!Array.isArray(manualRelated)) manualRelated = [];
  if (!Array.isArray(faqItems)) faqItems = [];

  const mode = (page.relatedCalculatorsMode as 'manual' | 'random' | 'both') || 'manual';
  const count = Math.min(12, Math.max(1, page.relatedCalculatorsCount ?? 6));
  const relatedCalculators = await getRelatedCalculatorsForPage(
    category,
    slug,
    locale,
    manualRelated,
    mode,
    count
  );

  const hasCalculator = !!(page.calculatorCode || page.linkedCalculatorPath);
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const rawPath = page.linkedCalculatorPath?.trim();
  const calculatorFullPath = rawPath
    ? (rawPath.startsWith('/') ? rawPath : rawPath.startsWith('calculators/') ? `/${rawPath}` : `/calculators/${rawPath}`)
    : null;
  // Use embed URL when available (calculator only, no header/footer)
  const hasEmbedRoute = rawPath ? hasCalculatorEmbed(rawPath) : false;
  const fullPathForIframe = calculatorFullPath && hasEmbedRoute ? `${calculatorFullPath}/embed` : calculatorFullPath;
  const iframeSrc = fullPathForIframe
    ? (basePath ? `${basePath}${fullPathForIframe}` : fullPathForIframe)
    : null;

  const relatedHeading = tCommon('relatedHeading');
  const faqHeading = tCommon('faqHeading');

  return (
    <>
      {faqItems.length > 0 && <FaqSchema items={faqItems} />}
      <Header />

      <div className="calculator-header">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Link href={`/calculators/${category}`} className="back-button">
              <svg className="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{tCommon('calculators')}</span>
            </Link>
            {session && (
              <a
                href={`/twojastara/pages/${page.id}/edit`}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              >
                Edit page
              </a>
            )}
          </div>
          <div className="header-content">
            <div className="title-badge">{getCategoryBadge(category)}</div>
            <h1 className="page-title">{translation.displayTitle?.trim() || translation.title}</h1>
            <p className="page-description">{translation.description ?? ''}</p>
          </div>
        </div>
      </div>

      <div className="calculator-container">
        <div className="container">
          <div className="calculator-card">
            {hasCalculator && (
              <>
                {iframeSrc && (
                  <iframe
                    src={iframeSrc}
                    title={(translation.displayTitle?.trim() || translation.title) ?? 'Calculator'}
                    style={{
                      width: '100%',
                      minHeight: 520,
                      border: 'none',
                      borderRadius: 8,
                    }}
                  />
                )}
                {!iframeSrc && page.calculatorCode && (
                  <CalculatorSandpackClient code={page.calculatorCode} labels={(calculatorLabels && Object.keys(calculatorLabels).length > 0) ? calculatorLabels : getDefaultCalculatorLabels(locale)} />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {htmlContent && (
        <div className="seo-content-section">
          <div className="container">
            <div className="seo-content-card">
              <article
                className="seo-prose-content"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        </div>
      )}

      {relatedCalculators.length > 0 && (
        <div className="related-calculators-section">
          <div className="related-content-card">
            <h2 className="related-heading">{relatedHeading}</h2>
            <div className="related-grid">
              {relatedCalculators.map((rc, i) => {
                const href = rc.path.startsWith('/') ? rc.path : `/calculators/${rc.path}`;
                return (
                  <Link key={i} href={href} className="related-card">
                    <h3 className="related-title">{rc.title}</h3>
                    {rc.description ? <p className="related-desc">{rc.description}</p> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {faqItems.length > 0 && (
        <FaqSection heading={faqHeading} items={faqItems} />
      )}

      <Footer />
    </>
  );
}
