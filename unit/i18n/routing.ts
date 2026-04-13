import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing-config';

export { routing } from './routing-config';
export { ROUTING_LOCALES, ROUTING_LOCALES_CONST, DEFAULT_LOCALE, isAppLocale, type AppLocale } from './locales';

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
