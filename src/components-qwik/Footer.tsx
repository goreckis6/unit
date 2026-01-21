import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';

export default component$(() => {
  const loc = useLocation();
  const { t } = useTranslate();
  const currentLocale = useSignal('en');
  const currentYear = new Date().getFullYear();

  useTask$(({ track }) => {
    track(() => loc.url.pathname);
    const pathParts = loc.url.pathname.split('/').filter(p => p);
    const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh'];
    const localeFromPath = pathParts[0] && supportedLocales.includes(pathParts[0]) ? pathParts[0] : 'en';
    currentLocale.value = localeFromPath;
  });

  const homePath = currentLocale.value === 'en' ? '/' : `/${currentLocale.value}/`;
  const mathPath = currentLocale.value === 'en' ? '/calculators/math-calculators' : `/${currentLocale.value}/calculators/math-calculators`;
  const electricalPath = currentLocale.value === 'en' ? '/calculators/electrical-calculator' : `/${currentLocale.value}/calculators/electrical-calculator`;

  return (
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <Link href={homePath} class="footer-logo">
              <span class="logo-icon">🔢</span>
              <span class="logo-text">{t('home.title')}</span>
            </Link>
            <p class="footer-tagline">{t('footer.tagline')}</p>
          </div>

          <div class="footer-links">
            <div class="footer-column">
              <h3 class="footer-heading">{t('footer.calculators')}</h3>
              <ul class="footer-list">
                <li>
                  <Link href={mathPath} class="footer-link">
                    {t('calculators.mathCalculators.title')}
                  </Link>
                </li>
                <li>
                  <Link href={electricalPath} class="footer-link">
                    {t('calculators.electrical.title')}
                  </Link>
                </li>
              </ul>
            </div>

            <div class="footer-column">
              <h3 class="footer-heading">{t('footer.resources')}</h3>
              <ul class="footer-list">
                <li>
                  <Link href={homePath} class="footer-link">
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <a href="#" class="footer-link">{t('footer.about')}</a>
                </li>
                <li>
                  <a href="#" class="footer-link">{t('footer.contact')}</a>
                </li>
                <li>
                  <a href="#" class="footer-link">{t('footer.privacy')}</a>
                </li>
                <li>
                  <a href="#" class="footer-link">{t('footer.terms')}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="footer-copyright">
            &copy; {currentYear} {t('footer.copyright')}
          </p>
          <div class="footer-social">
            {/* Social links can be added here if needed */}
          </div>
        </div>
      </div>
    </footer>
  );
});
