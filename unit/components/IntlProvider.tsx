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
