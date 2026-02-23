import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

type Locale = (typeof routing.locales)[number];

function isSupportedLocale(value: string | undefined): value is Locale {
  return typeof value === 'string' && routing.locales.includes(value as Locale);
}

function getLocaleFromPathname(pathname: string): Locale | null {
  // Extract locale from URL path (e.g., /fr/about -> fr)
  const pathnameLocale = routing.locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  return pathnameLocale || null;
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

  // Skip i18n for twojastara panel - serve /twojastara routes directly
  if (pathname.startsWith('/twojastara')) {
    return NextResponse.next();
  }
  
  // 1. Check if URL has an explicit locale (e.g., /fr/, /de/, /pl/, /en/)
  const pathnameLocale = getLocaleFromPathname(pathname);
  
  // 2. If URL has a locale, "stick" it in a cookie for future visits
  if (pathnameLocale) {
    // Special handling for English: update cookie and redirect to unprefixed URL
    if (pathnameLocale === 'en') {
      const currentCookie = request.cookies.get('NEXT_LOCALE')?.value;
      
      // If cookie needs to be updated to 'en', clear it and redirect to unprefixed URL
      if (currentCookie !== 'en') {
        const pathWithoutLocale = pathname.replace(/^\/en(\/|$)/, '/');
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = pathWithoutLocale || '/';
        
        const response = NextResponse.redirect(redirectUrl);
        response.cookies.set('NEXT_LOCALE', 'en', {
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: 'lax'
        });
        return response;
      }
      
      // Cookie is already 'en', just redirect to unprefixed URL
      const pathWithoutLocale = pathname.replace(/^\/en(\/|$)/, '/');
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = pathWithoutLocale || '/';
      return NextResponse.redirect(redirectUrl);
    }
    
    // For other locales (non-English)
    const response = handleI18nRouting(request);
    
    // Only update cookie if it's different from the current one
    const currentCookie = request.cookies.get('NEXT_LOCALE')?.value;
    if (currentCookie !== pathnameLocale) {
      response.cookies.set('NEXT_LOCALE', pathnameLocale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax'
      });
    }
    
    return response;
  }
  
  // 3. For root path without locale: check cookie first, then browser language
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  
  // If user has a saved preference (cookie) and it's NOT English, redirect to that language
  if (isSupportedLocale(cookieLocale) && cookieLocale !== 'en') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${cookieLocale}${pathname}`;
    return NextResponse.redirect(redirectUrl);
  }
  
  // If cookie is explicitly 'en', just serve English (no redirect needed)
  if (cookieLocale === 'en') {
    return handleI18nRouting(request);
  }
  
  // 4. No cookie? Detect from browser language as fallback
  const acceptLanguage = request.headers.get('accept-language');
  const browserLocale = getBrowserLocale(acceptLanguage);
  
  // If browser locale is not English, redirect to that language
  if (browserLocale !== 'en') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${browserLocale}${pathname}`;
    return NextResponse.redirect(redirectUrl);
  }
  
  // 5. Default: let next-intl handle it (will use English)
  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)']
};
