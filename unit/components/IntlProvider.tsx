'use client';

import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';

interface IntlProviderProps {
  locale: string;
  messages: AbstractIntlMessages;
  children: React.ReactNode;
}

/** Client wrapper: suppresses MISSING_MESSAGE log spam, provides safe fallbacks */
export function IntlProvider({ locale, messages, children }: IntlProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      getMessageFallback={({ namespace, key }) => {
        const path = [namespace, key].filter(Boolean).join('.');
        if (path.includes('armyBodyFat')) {
          if (path.endsWith('.title') || key === 'title') return 'Army Body Fat Calculator';
          if (path.endsWith('.description') || key === 'description') return 'Calculate your body fat percentage using the official US Army tape test method per AR 600-9. Supports 2026 ACFT exemption for soldiers scoring 540+.';
        }
        return path || '?';
      }}
      onError={(err) => {
        if (err?.code === 'MISSING_MESSAGE') return;
        console.error(err);
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
