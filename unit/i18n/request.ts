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
      if (path.includes('armyBodyFat')) {
        if (key === 'title' || path.endsWith('.title')) return 'Army Body Fat Calculator';
        if (key === 'description' || path.endsWith('.description')) return 'Calculate your body fat percentage using the official US Army tape test method per AR 600-9. Supports 2026 ACFT exemption for soldiers scoring 540+.';
      }
      return path || '?';
    },
    onError(err: { code?: string } | null) {
      if (err?.code === 'MISSING_MESSAGE') return;
      console.error(err);
    },
  };
});
