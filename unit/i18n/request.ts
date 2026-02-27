import { getRequestConfig } from 'next-intl/server';
import { routing, ROUTING_LOCALES } from './routing';
import { createGetMessageFallback } from './get-message-fallback';

const getMessageFallback = createGetMessageFallback();

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || typeof locale !== 'string' || !ROUTING_LOCALES.includes(locale)) {
    locale = routing.defaultLocale ?? 'en';
  }

  return {
    locale,
    messages: (await import(`./${locale}.json`)).default,
    getMessageFallback,
    onError(err: { code?: string } | null) {
      if (err?.code === 'MISSING_MESSAGE' || err?.code === 'ENVIRONMENT_FALLBACK') return;
      console.error(err);
    },
  };
});
