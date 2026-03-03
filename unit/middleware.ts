import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing, ROUTING_LOCALES } from './i18n/routing';
import { SLUG_TO_PATH } from '@/lib/gsc-redirects';

const handleI18nRouting = createMiddleware(routing);

type Locale = (typeof routing.locales)[number];

function isSupportedLocale(value: string | undefined): value is Locale {
  return typeof value === 'string' && ROUTING_LOCALES.includes(value as Locale);
}

function getLocaleFromPathname(pathname: string): Locale | null {
  // Extract locale from URL path (e.g., /fr/about -> fr)
  const pathnameLocale = ROUTING_LOCALES.find(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );
  return (pathnameLocale ?? null) as Locale | null;
}

function getBrowserLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return 'en';
  }

  // Parse Accept-Language header (e.g., "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7")
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [localePart, qValue] = lang.trim().split(';');
      const q = qValue ? parseFloat(qValue.split('=')[1]) : 1.0;
      const locale = (localePart ?? '').split('-')[0]?.toLowerCase() ?? '';
      return { locale, q };
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

// Known unsupported locales (were indexed by Google but site no longer supports them)
const UNSUPPORTED_LOCALES = ['fa', 'th', 'vi'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const safePathname = pathname ?? '';

  // Malformed URLs (e.g. /$) → redirect to home
  if (safePathname === '/$') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Blog redirect (no longer exists)
  const blogMatch = safePathname.match(/^\/([a-z]{2})\/blog\/?$/);
  if (safePathname === '/blog' || safePathname === '/blog/' || blogMatch) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = blogMatch ? `/${blogMatch[1]}` : '/';
    return NextResponse.redirect(redirectUrl, 301);
  }

  // GSC 404 redirects: old slugs / non-existent pages → correct paths (run before unsupported locale)
  const calcMatch = safePathname.match(/^\/([a-z]{2})\/calculators\/([^/]+)\/?([^/]*)\/?$/);
  const calcMatchEn = safePathname.match(/^\/calculators\/([^/]+)\/?([^/]*)\/?$/);
  let localePrefix = '';
  let localeCode = '';
  let slugOrCategory = '';
  let slug = '';
  if (calcMatch) {
    localeCode = calcMatch[1];
    localePrefix = `/${localeCode}`;
    slugOrCategory = calcMatch[2];
    slug = calcMatch[3] || '';
  } else if (calcMatchEn) {
    slugOrCategory = calcMatchEn[1];
    slug = calcMatchEn[2] || '';
  }
  if (slugOrCategory) {
    const targetSlug = slug || slugOrCategory;
    const dest = SLUG_TO_PATH[targetSlug] ?? (slug ? SLUG_TO_PATH[slugOrCategory] : null);
    if (dest) {
      const destPath = dest.startsWith('/') ? dest : `/${dest}`;
      const redirectUrl = request.nextUrl.clone();
      // Unsupported locale (fa, th, vi) → redirect to EN path (no locale prefix)
      const usePrefix = localeCode && UNSUPPORTED_LOCALES.includes(localeCode) ? '' : localePrefix;
      redirectUrl.pathname = usePrefix ? `${usePrefix}${destPath}` : destPath;
      return NextResponse.redirect(redirectUrl, 301);
    }
    if (!slug && SLUG_TO_PATH[slugOrCategory]) {
      const destPath = SLUG_TO_PATH[slugOrCategory].startsWith('/') ? SLUG_TO_PATH[slugOrCategory] : `/${SLUG_TO_PATH[slugOrCategory]}`;
      const redirectUrl = request.nextUrl.clone();
      const usePrefix = localeCode && UNSUPPORTED_LOCALES.includes(localeCode) ? '' : localePrefix;
      redirectUrl.pathname = usePrefix ? `${usePrefix}${destPath}` : destPath;
      return NextResponse.redirect(redirectUrl, 301);
    }
  }

  // Redirect unsupported locales (fa, th, vi) to English equivalent — fixes GSC 404s
  const firstSegment = safePathname.split('/').filter(Boolean)[0];
  if (firstSegment && UNSUPPORTED_LOCALES.includes(firstSegment)) {
    const pathWithoutLocale = safePathname.replace(new RegExp(`^/${firstSegment}(/|$)`), '$1') || '/';
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathWithoutLocale;
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Rewrite /twojastara to /en/admin so it matches [locale]/admin (locale=en)
  if (safePathname.startsWith('/twojastara')) {
    const rewritePath = safePathname.replace(/^\/twojastara/, '/en/admin') || '/en/admin';
    const url = request.nextUrl.clone();
    url.pathname = rewritePath;
    return NextResponse.rewrite(url);
  }
  
  // 1. Check if URL has an explicit locale (e.g., /fr/, /de/, /pl/, /en/)
  const pathnameLocale = getLocaleFromPathname(safePathname);
  
  // 2. If URL has a locale, "stick" it in a cookie for future visits
  if (pathnameLocale) {
    // Special handling for English: update cookie and redirect to unprefixed URL
    if (pathnameLocale === 'en') {
      const currentCookie = request.cookies.get('NEXT_LOCALE')?.value;
      
      // If cookie needs to be updated to 'en', clear it and redirect to unprefixed URL
      if (currentCookie !== 'en') {
        const pathWithoutLocale = safePathname.replace(/^\/en(\/|$)/, '/');
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
      const pathWithoutLocale = safePathname.replace(/^\/en(\/|$)/, '/');
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
    redirectUrl.pathname = `/${cookieLocale}${safePathname}`;
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
    redirectUrl.pathname = `/${browserLocale}${safePathname}`;
    return NextResponse.redirect(redirectUrl);
  }
  
  // 5. Default: let next-intl handle it (will use English)
  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)']
};
