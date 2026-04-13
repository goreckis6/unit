import { defineRouting } from 'next-intl/routing';
import { ROUTING_LOCALES_CONST } from './locales';

/**
 * Routing config only — safe for Edge middleware.
 * Do not import `@/i18n/routing` in middleware: that module calls
 * `createNavigation` and pulls React Server Components into the Edge bundle
 * ("react-server condition must be enabled" / broken hooks).
 */
export const routing = defineRouting({
  locales: [...ROUTING_LOCALES_CONST],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false,
});
