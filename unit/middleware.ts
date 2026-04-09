import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing, ROUTING_LOCALES } from './i18n/routing';
import { SLUG_TO_PATH } from '@/lib/gsc-redirects';

// Canonical domain (no www) — redirect www to avoid duplicate content in Google
const CANONICAL_HOST = 'calculinohub.com';

const handleI18nRouting = createMiddleware(routing);

type Locale = (typeof routing.locales)[number];

/** Edge-safe SHA-256 hex; must match `hashForDisplayName` in `lib/txt-file-hash.ts` for `txt:${lower(name)}`. */
async function sha256HexUtf8(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

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

/** Request with x-pathname header for layout's default canonical/hreflang */
function requestWithPathname(req: NextRequest, pathname: string): NextRequest {
  const h = new Headers(req.headers);
  h.set('x-pathname', pathname);
  return new NextRequest(req.url, { headers: h });
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const safePathname = pathname ?? '';

  // TXT files: /{64hex}.txt -> /api/txt/{hash} (serves admin-created TXT files)
  const txtMatch = safePathname.match(/^\/([a-f0-9]{64})\.txt$/);
  if (txtMatch) {
    const hash = txtMatch[1];
    const url = request.nextUrl.clone();
    url.pathname = `/api/txt/${hash}`;
    return NextResponse.rewrite(url);
  }

  // Named TXT at site root: /klucz.txt -> same hash as admin "klucz.txt" -> /api/txt/{hash}
  const namedTxt = safePathname.match(/^\/([^/]+\.txt)$/i);
  if (namedTxt && !/^\/[a-f0-9]{64}\.txt$/i.test(safePathname)) {
    const displayName = namedTxt[1].toLowerCase();
    const hash = await sha256HexUtf8(`txt:${displayName}`);
    const url = request.nextUrl.clone();
    url.pathname = `/api/txt/${hash}`;
    return NextResponse.rewrite(url);
  }

  // www -> non-www redirect (301) - applies to all current and future pages
  const host = request.headers.get('host') ?? '';
  if (host.toLowerCase().startsWith('www.')) {
    const redirectUrl = new URL(request.url);
    redirectUrl.host = CANONICAL_HOST;
    redirectUrl.protocol = 'https:';
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Sitemap index + numbered chunk feeds (no locale prefix / cookie redirects)
  if (safePathname === '/sitemap.xml' || /^\/sitemap\/\d+$/.test(safePathname)) {
    return NextResponse.next();
  }

  // Malformed URLs (e.g. /$, /&) → redirect to home
  if (safePathname === '/$' || safePathname === '/&') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Blog redirect (no longer exists) — /blog, /blog/post, /{locale}/blog, /{locale}/blog/post
  const blogLocaleDeep = safePathname.match(/^\/([a-z]{2})\/blog(?:\/.*)?$/);
  if (blogLocaleDeep) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${blogLocaleDeep[1]}`;
    return NextResponse.redirect(redirectUrl, 301);
  }
  if (safePathname === '/blog' || safePathname === '/blog/' || /^\/blog\//.test(safePathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
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
      // Unsupported locale (fa, th, vi) → redirect to EN path (no locale prefix)
      const usePrefix = localeCode && UNSUPPORTED_LOCALES.includes(localeCode) ? '' : localePrefix;
      const targetPathname = usePrefix ? `${usePrefix}${destPath}` : destPath;
      // Avoid redirect loop: only redirect when target differs from current path
      const currentNorm = safePathname.replace(/\/$/, '') || '/';
      const targetNorm = targetPathname.replace(/\/$/, '') || '/';
      if (currentNorm !== targetNorm) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = targetPathname;
        return NextResponse.redirect(redirectUrl, 301);
      }
    }
    if (!slug && SLUG_TO_PATH[slugOrCategory]) {
      const destPath = SLUG_TO_PATH[slugOrCategory].startsWith('/') ? SLUG_TO_PATH[slugOrCategory] : `/${SLUG_TO_PATH[slugOrCategory]}`;
      const usePrefix = localeCode && UNSUPPORTED_LOCALES.includes(localeCode) ? '' : localePrefix;
      const targetPathname = usePrefix ? `${usePrefix}${destPath}` : destPath;
      const currentNorm = safePathname.replace(/\/$/, '') || '/';
      const targetNorm = targetPathname.replace(/\/$/, '') || '/';
      if (currentNorm !== targetNorm) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = targetPathname;
        return NextResponse.redirect(redirectUrl, 301);
      }
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
    const h = new Headers(request.headers);
    h.set('x-pathname', rewritePath);
    return NextResponse.rewrite(url, { request: { headers: h } });
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
    const response = handleI18nRouting(requestWithPathname(request, safePathname));
    
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
  
  // 3. Path without locale = canonical English URL (e.g. /calculators/..., /about)
  //    → Always serve English. localeDetection: false w routing = next-intl nie przekierowuje.
  const isRootPath = safePathname === '/' || safePathname === '';
  if (!isRootPath) {
    const response = handleI18nRouting(requestWithPathname(request, safePathname));
    const currentCookie = request.cookies.get('NEXT_LOCALE')?.value;
    if (currentCookie !== 'en') {
      response.cookies.set('NEXT_LOCALE', 'en', {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax'
      });
    }
    return response;
  }

  // 4. Root path "/" only: check cookie first, then browser language (for homepage personalization)
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;

  if (isSupportedLocale(cookieLocale) && cookieLocale !== 'en') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${cookieLocale}`;
    return NextResponse.redirect(redirectUrl);
  }

  if (cookieLocale === 'en') {
    return handleI18nRouting(requestWithPathname(request, safePathname));
  }

  const acceptLanguage = request.headers.get('accept-language');
  const browserLocale = getBrowserLocale(acceptLanguage);

  if (browserLocale !== 'en') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${browserLocale}`;
    return NextResponse.redirect(redirectUrl);
  }

  return handleI18nRouting(requestWithPathname(request, safePathname));
}

export const config = {
  matcher: [
    '/',
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/:hash([a-f0-9]{64}).txt',
    '/:file((?:[a-zA-Z0-9._-])+\\.txt)',
  ],
};
