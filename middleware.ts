import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

function hasLocalePrefix(pathname: string) {
  return routing.locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;

  if (hasLocalePrefix(pathname)) {
    const locale = pathname.split('/')[1];
    if (locale && routing.locales.includes(locale) && locale !== localeCookie) {
      const response = handleI18nRouting(request);
      response.cookies.set('NEXT_LOCALE', locale, { path: '/', sameSite: 'lax' });
      return response;
    }

    return handleI18nRouting(request);
  }

  if (localeCookie && localeCookie !== 'en' && routing.locales.includes(localeCookie)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${localeCookie}${pathname}`;
    return NextResponse.redirect(redirectUrl);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)']
};
