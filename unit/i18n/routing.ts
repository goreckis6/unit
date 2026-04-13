import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { ROUTING_LOCALES_CONST } from './locales';

export const routing = defineRouting({
  locales: [...ROUTING_LOCALES_CONST],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // EN bez prefiksu, inne języki z prefiksem
  localeDetection: false, // Wyłączony — middleware sam decyduje (cookie/browser tylko na /)
});

export { ROUTING_LOCALES, ROUTING_LOCALES_CONST, DEFAULT_LOCALE, isAppLocale, type AppLocale } from './locales';

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
