/**
 * Locale list only — no next-intl/navigation.
 * Import from API routes / lib (not `@/i18n/routing`) so bundles do not load
 * `createNavigation` (uses React `cache`, breaks some Node/Edge collect-page-data paths).
 */
export const ROUTING_LOCALES_CONST = [
  'en',
  'pl',
  'de',
  'fr',
  'es',
  'it',
  'nl',
  'pt',
  'cs',
  'sk',
  'hu',
  'sv',
  'no',
  'da',
  'fi',
  'ro',
  'ru',
  'ja',
  'zh',
  'ko',
  'ar',
  'hi',
  'id',
  'tr',
] as const;

export type AppLocale = (typeof ROUTING_LOCALES_CONST)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';

/** Mutable string list — same order as next-intl routing (for loops, admin, sitemap). */
export const ROUTING_LOCALES: readonly string[] = [...ROUTING_LOCALES_CONST];

export function isAppLocale(s: string): s is AppLocale {
  return (ROUTING_LOCALES_CONST as readonly string[]).includes(s);
}
