import { useSignal, useTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import en from '../../src/locales/en.json';
import pl from '../../src/locales/pl.json';
import de from '../../src/locales/de.json';
import es from '../../src/locales/es.json';
import fr from '../../src/locales/fr.json';
import it from '../../src/locales/it.json';
import nl from '../../src/locales/nl.json';
import pt from '../../src/locales/pt.json';
import sv from '../../src/locales/sv.json';
import vi from '../../src/locales/vi.json';
import tr from '../../src/locales/tr.json';
import ru from '../../src/locales/ru.json';
import fa from '../../src/locales/fa.json';
import th from '../../src/locales/th.json';
import ja from '../../src/locales/ja.json';
import zh from '../../src/locales/zh.json';

const translations: Record<string, any> = {
  en,
  pl,
  de,
  es,
  fr,
  it,
  nl,
  pt,
  sv,
  vi,
  tr,
  ru,
  fa,
  th,
  ja,
  zh,
};

export function useTranslate() {
  const loc = useLocation();
  const locale = useSignal<string>('en');

  useTask$(({ track }) => {
    track(() => loc.url.pathname);
    // Extract locale from URL path
    const pathParts = loc.url.pathname.split('/').filter(p => p);
    const possibleLocale = pathParts[0];
    const supportedLocales = ['en', 'pl', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'sv', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh'];
    
    if (supportedLocales.includes(possibleLocale)) {
      locale.value = possibleLocale;
    } else {
      locale.value = 'en';
    }
  });

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale.value] || translations['en'];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to English
        value = translations['en'];
        for (const k2 of keys) {
          value = value?.[k2];
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  // Function to get translation value as-is (can return objects, arrays, etc.)
  const getTranslation = (key: string): any => {
    const keys = key.split('.');
    let value: any = translations[locale.value] || translations['en'];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to English
        value = translations['en'];
        for (const k2 of keys) {
          value = value?.[k2];
        }
        break;
      }
    }
    
    return value;
  };

  return { t, getTranslation };
}

