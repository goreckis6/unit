import en from './locales/en.json';
import pl from './locales/pl.json';

export const LOCALES = {
  en,
  pl,
};

export type Locale = keyof typeof LOCALES;

export function getLocaleFromUrl(url: URL): Locale {
  const seg = url.pathname.split('/')[1];
  return seg === 'pl' ? 'pl' : 'en';
}

export function getLocaleFromHeaders(headers: Headers): Locale {
  const acceptLanguage = headers.get('accept-language') || '';
  if (acceptLanguage.includes('pl')) {
    return 'pl';
  }
  return 'en';
}
