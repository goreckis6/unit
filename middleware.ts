import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

type Locale = (typeof routing.locales)[number];

function hasLocalePrefix(pathname: string) {
  return routing.locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}

function isSupportedLocale(value: string | undefined): value is Locale {
  return typeof value === 'string' && routing.locales.includes(value as Locale);
}

function getBrowserLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return 'en';
  }

  // Parse Accept-Language header (e.g., "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7")
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, qValue] = lang.trim().split(';');
      const q = qValue ? parseFloat(qValue.split('=')[1]) : 1.0;
      return { locale: locale.split('-')[0].toLowerCase(), q };
    })
    .sort((a, b) => b.q - a.q);

  // Find first supported locale
  for (const { locale } of languages) {
    if (isSupportedLocale(locale)) {
      return locale;
    }
  }

  return 'en';
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If URL already has a locale prefix, just handle the routing
  if (hasLocalePrefix(pathname)) {
    return handleI18nRouting(request);
  }

  // For root path or paths without locale, detect browser language
  const acceptLanguage = request.headers.get('accept-language');
  const detectedLocale = getBrowserLocale(acceptLanguage);

  // Let next-intl handle the routing with detected locale
  // It will redirect to the appropriate locale path
  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)']
};
