import { getRequestConfig } from 'next-intl/server';
import { routing, ROUTING_LOCALES } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || typeof locale !== 'string' || !ROUTING_LOCALES.includes(locale)) {
    locale = routing.defaultLocale ?? 'en';
  }

  return {
    locale,
    messages: (await import(`./${locale}.json`)).default,
    getMessageFallback({ namespace, key }) {
      const path = [namespace, key].filter(Boolean).join('.');
      return path || '?';
    },
    onError(err: { code?: string } | null) {
      if (err?.code === 'MISSING_MESSAGE') return;
      console.error(err);
    },
  };
});
