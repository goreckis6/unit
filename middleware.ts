import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(de|en|pl|fr|es|it|nl|pt|cs|sk|hu|sv|no|da|fi|ro)/:path*']
};
