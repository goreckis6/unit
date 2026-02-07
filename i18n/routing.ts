import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'pl', 'de', 'fr', 'es', 'it', 'nl', 'pt', 'cs', 'sk', 'hu', 'sv', 'no', 'da', 'fi', 'ro', 'ru', 'ja', 'zh', 'ko', 'ar', 'hi', 'id', 'tr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // EN bez prefiksu, inne języki z prefiksem
  localeDetection: true // Enable automatic browser language detection
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
