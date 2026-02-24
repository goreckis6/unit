import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing, ROUTING_LOCALES } from '@/i18n/routing';
import { GlobalEnterToCalculate } from '@/components/GlobalEnterToCalculate';

export function generateStaticParams() {
  return ROUTING_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!ROUTING_LOCALES.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <GlobalEnterToCalculate />
      {children}
    </NextIntlClientProvider>
  );
}
