import { routing } from '@/i18n/routing';

const BASE_URL = 'https://unitconverterhub.com';

/**
 * Generates hreflang language alternates for a given path.
 * Used in generateMetadata as alternates.languages.
 * Includes x-default pointing to the default locale (en) URL.
 *
 * @param path - Path without locale prefix. Use '' for homepage; use a leading slash
 *   for all other pages (e.g. '/calculators/math'). Passing '/' for homepage would
 *   yield double slashes (e.g. https://unitconverterhub.com//).
 * @returns Record<locale | 'x-default', absolute URL>
 */
export function generateHreflangUrls(path: string): Record<string, string> {
  const normalized =
    path === '/' ? '' : path !== '' && !path.startsWith('/') ? `/${path}` : path;
  const languages: Record<string, string> = {};
  const defaultLocale = routing.defaultLocale;

  for (const loc of routing.locales) {
    const url =
      loc === defaultLocale ? `${BASE_URL}${normalized}` : `${BASE_URL}/${loc}${normalized}`;
    languages[loc] = url;
  }

  languages['x-default'] = languages[defaultLocale];

  return languages;
}

export { BASE_URL };
