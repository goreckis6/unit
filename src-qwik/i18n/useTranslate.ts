import { useSignal, useTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import en from '../locales/en.json';
import pl from '../locales/pl.json';
import de from '../locales/de.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import it from '../locales/it.json';
import nl from '../locales/nl.json';
import pt from '../locales/pt.json';
import sv from '../locales/sv.json';
import vi from '../locales/vi.json';
import tr from '../locales/tr.json';
import ru from '../locales/ru.json';
import fa from '../locales/fa.json';
import th from '../locales/th.json';
import ja from '../locales/ja.json';
import zh from '../locales/zh.json';

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

  return t;
}

