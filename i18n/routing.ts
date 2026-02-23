import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'pl', 'de', 'fr', 'es', 'it', 'nl', 'pt', 'cs', 'sk', 'hu', 'sv', 'no', 'da', 'fi', 'ro', 'ru', 'ja', 'zh', 'ko', 'ar', 'hi', 'id', 'tr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // EN bez prefiksu, inne języki z prefiksem
  localeDetection: true // Enable automatic browser language detection
});

/** Safe locales array - never undefined (avoids indexOf/includes on undefined) */
const _locales = routing?.locales;
export const ROUTING_LOCALES: readonly string[] = Array.isArray(_locales) && _locales.length > 0
  ? [..._locales]
  : ['en', 'pl', 'de', 'fr', 'es', 'it', 'nl', 'pt', 'cs', 'sk', 'hu', 'sv', 'no', 'da', 'fi', 'ro', 'ru', 'ja', 'zh', 'ko', 'ar', 'hi', 'id', 'tr'];
if (typeof window !== 'undefined' && !(globalThis as any).__routingLogged) {
  (globalThis as any).__routingLogged = true;
  console.log('[routing] _locales type:', typeof _locales, 'isArray:', Array.isArray(_locales), 'ROUTING_LOCALES len:', ROUTING_LOCALES.length);
}

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
