import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { hasCalculatorEmbed } from '@/lib/calculator-embeds';
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
  if (!page.published && !(isPreview && session)) return { title: 'Not Found' };
  const t = page.translations.find((x) => x.locale === locale) ?? page.translations[0];
  return {
    title: `${t?.title ?? 'Calculator'} — Calculator`,
    description: t?.description ?? undefined,
  };
}

export default async function CalculatorSubpage({ params, searchParams }: Props) {
  const { locale, category, slug } = await params;
  setRequestLocale(locale);

  if (!(routing.locales ?? []).includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const page = await prisma.page.findFirst({
    where: { category, slug },
    include: { translations: true },
  });

  if (!page) notFound();
  const isPreview = (await searchParams)?.preview === '1';
  const session = isPreview ? await getSession() : null;
  const canView = page.published || (isPreview && session);
  if (!canView) notFound();

  const hasCalculator = !!(page.calculatorCode || page.linkedCalculatorPath);
  if (!hasCalculator) notFound();

  const translation = page.translations.find((t) => t.locale === locale)
    ?? page.translations.find((t) => t.locale === 'en')
    ?? page.translations[0];
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const rawPath = page.linkedCalculatorPath?.trim();
  const calculatorFullPath = rawPath
    ? (rawPath.startsWith('/') ? rawPath : rawPath.startsWith('calculators/') ? `/${rawPath}` : `/calculators/${rawPath}`)
    : null;
  const hasEmbedRoute = rawPath ? hasCalculatorEmbed(rawPath) : false;
  const fullPathForIframe = calculatorFullPath && hasEmbedRoute ? `${calculatorFullPath}/embed` : calculatorFullPath;
  const iframeSrc = fullPathForIframe
    ? (basePath ? `${basePath}${fullPathForIframe}` : fullPathForIframe)
    : null;

  return (
    <>
      <Header />

      <div className="calculator-header">
        <div className="container">
          <Link href={`/calculators/${category}`} className="back-button">
            <svg className="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{tCommon('calculators')}</span>
          </Link>
          <div className="header-content">
            <div className="title-badge">{getCategoryBadge(category)}</div>
            <h1 className="page-title">{(translation?.displayTitle?.trim() || translation?.title) ?? 'Calculator'}</h1>
            <p className="page-description">{translation?.description ?? ''}</p>
          </div>
        </div>
      </div>

      <div className="calculator-container">
        <div className="container">
          <div className="calculator-card">
            {iframeSrc && (
              <iframe
                src={iframeSrc}
                title={(translation?.displayTitle?.trim() || translation?.title) ?? 'Calculator'}
                style={{
                  width: '100%',
                  minHeight: 520,
                  border: 'none',
                  borderRadius: 8,
                }}
              />
            )}

            {page.calculatorCode && !iframeSrc && (
              <CalculatorSandpackClient
                code={page.calculatorCode}
                labels={(() => {
                  const t = page.translations.find((x) => x.locale === locale) ?? page.translations[0];
                  if (!t?.calculatorLabels) return undefined;
                  try {
                    const p = JSON.parse(t.calculatorLabels) as Record<string, unknown>;
                    if (p && typeof p === 'object' && !Array.isArray(p)) {
                      const out: Record<string, string> = {};
                      for (const [k, v] of Object.entries(p)) {
                        if (typeof k === 'string' && typeof v === 'string') out[k] = v;
                      }
                      return Object.keys(out).length ? out : undefined;
                    }
                  } catch {}
                  return undefined;
                })()}
              />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
