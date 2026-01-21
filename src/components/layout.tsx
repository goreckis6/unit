import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n/useTranslate';
import type { Locale } from '../i18n/i18n';

interface LayoutProps {
  locale: Locale;
}

export default component$<LayoutProps>(({ locale }) => {
  const t = useTranslate(locale);
  const prefix = locale === 'pl' ? '/pl' : '';

  return (
    <>
      <nav>
        <div class="container nav-container">
          <Link href={prefix || '/'} class="logo">
            UnitConverterHub
          </Link>
          <ul class="nav-links">
            <li><Link href={prefix || '/'}>{t('nav.home')}</Link></li>
            <li><Link href={`${prefix}/length`}>{t('nav.length')}</Link></li>
            <li><Link href={`${prefix}/weight`}>{t('nav.weight')}</Link></li>
            <li><Link href={`${prefix}/temperature`}>{t('nav.temperature')}</Link></li>
            <li><Link href={`${prefix}/volume`}>{t('nav.volume')}</Link></li>
            <li>
              <span class="language-switcher">
                {locale === 'en' ? (
                  <Link href="/pl">PL</Link>
                ) : (
                  <Link href="/">EN</Link>
                )}
              </span>
            </li>
          </ul>
        </div>
      </nav>
      <main>
        <slot />
      </main>
      <footer>
        <div class="container">
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>
    </>
  );
});
