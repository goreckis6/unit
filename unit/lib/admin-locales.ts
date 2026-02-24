/**
 * Shared locale list and names for admin (new/edit page forms).
 * Uses BCP 47 / ISO 639-1 codes. Single source of truth aligned with routing.
 */
import { ROUTING_LOCALES } from '@/i18n/routing';

const FALLBACK_LOCALES = ['en', 'pl', 'de', 'fr', 'es', 'it', 'nl', 'pt', 'cs', 'sk', 'hu', 'sv', 'no', 'da', 'fi', 'ro', 'ru', 'ja', 'zh', 'ko', 'ar', 'hi', 'id', 'tr'];
export const ADMIN_LOCALES: readonly string[] = Array.isArray(ROUTING_LOCALES) && ROUTING_LOCALES.length > 0
  ? [...ROUTING_LOCALES]
  : FALLBACK_LOCALES;
if (typeof window !== 'undefined' && (!Array.isArray(ROUTING_LOCALES) || ADMIN_LOCALES.length === 0)) console.warn('[admin-locales] ROUTING_LOCALES:', ROUTING_LOCALES, 'ADMIN_LOCALES len:', ADMIN_LOCALES.length);

/** Locale code → native language name for template documentation */
export const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  pl: 'Polski',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  nl: 'Nederlands',
  pt: 'Português',
  cs: 'Čeština',
  sk: 'Slovenčina',
  hu: 'Magyar',
  sv: 'Svenska',
  no: 'Norsk',
  da: 'Dansk',
  fi: 'Suomi',
  ro: 'Română',
  ru: 'Русский',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
  ar: 'العربية',
  hi: 'हिन्दी',
  id: 'Bahasa Indonesia',
  tr: 'Türkçe',
};

/** Build _meta for exported JSON (locale code → name). Omit from import. */
export function getLocaleMeta(): Record<string, string> {
  return Object.fromEntries(
    ADMIN_LOCALES.map((code) => [code, LOCALE_NAMES[code] ?? code])
  );
}
