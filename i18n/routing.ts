import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'pl', 'de', 'fr', 'es', 'it', 'nl', 'pt', 'cs', 'sk', 'hu', 'sv', 'no', 'da', 'fi', 'ro'],
  defaultLocale: 'en',
  localePrefix: 'as-needed' // EN bez prefiksu, inne języki z prefiksem
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
