import { LOCALES, type Locale } from './i18n';

export function useTranslate(locale: Locale) {
  const dict = LOCALES[locale] ?? LOCALES.en;

  return (key: string): string => {
    const keys = key.split('.');
    let value: any = dict;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };
}
