'use client';

import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import { createGetMessageFallback } from '@/i18n/get-message-fallback';

interface IntlProviderProps {
  locale: string;
  messages: AbstractIntlMessages;
  children: React.ReactNode;
}

const getMessageFallback = createGetMessageFallback();

/** Client wrapper: suppresses MISSING_MESSAGE log spam, provides safe fallbacks */
export function IntlProvider({ locale, messages, children }: IntlProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      getMessageFallback={getMessageFallback}
      onError={(err) => {
        if (err?.code === 'MISSING_MESSAGE' || err?.code === 'ENVIRONMENT_FALLBACK') return;
        console.error(err);
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
