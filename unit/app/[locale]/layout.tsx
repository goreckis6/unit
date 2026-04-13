import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ROUTING_LOCALES, isAppLocale } from '@/i18n/locales';
import { generateHreflangUrls, BASE_URL } from '@/lib/hreflang';
import { IntlProvider } from '@/components/IntlProvider';
import { GlobalEnterToCalculate } from '@/components/GlobalEnterToCalculate';

export function generateStaticParams() {
  return ROUTING_LOCALES.map((locale) => ({ locale }));
}

/** Default canonical + hreflang for all pages under [locale]. Child pages can override. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';

  // Strip locale prefix to get logical path
  const firstSeg = pathname.split('/').filter(Boolean)[0];
  const logicalPath =
    firstSeg && isAppLocale(firstSeg)
      ? pathname.replace(new RegExp(`^/${firstSeg}(/|$)`), '$1') || '/'
      : pathname || '/';

  const pathPart = logicalPath === '/' ? '' : logicalPath;
  const canonicalPath = locale === 'en' ? pathPart : `/${locale}${pathPart}`;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  const hreflangPath = logicalPath === '/' ? '' : logicalPath;

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: generateHreflangUrls(hreflangPath),
    },
    openGraph: {
      url: canonicalUrl,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <IntlProvider locale={locale} messages={messages}>
      <GlobalEnterToCalculate />
      {children}
    </IntlProvider>
  );
}
