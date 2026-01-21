import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';

export default component$(() => {
  const loc = useLocation();
  const { t } = useTranslate();
  const showLanguageMenu = useSignal(false);
  const showMobileMenu = useSignal(false);
  const currentLocale = useSignal('en');

  useTask$(({ track }) => {
    track(() => loc.url.pathname);
    const pathParts = loc.url.pathname.split('/').filter(p => p);
    const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh'];
    const localeFromPath = pathParts[0] && supportedLocales.includes(pathParts[0]) ? pathParts[0] : 'en';
    currentLocale.value = localeFromPath;
    
    if (typeof document !== 'undefined') {
      document.documentElement.lang = localeFromPath;
    }
  });

  const toggleLanguageMenu = $(() => {
    showLanguageMenu.value = !showLanguageMenu.value;
  });

  const toggleMobileMenu = $(() => {
    showMobileMenu.value = !showMobileMenu.value;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = showMobileMenu.value ? 'hidden' : '';
    }
  });

  const closeMobileMenu = $(() => {
    showMobileMenu.value = false;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  });

  const selectLanguage = $((locale: string) => {
    currentLocale.value = locale;
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      if (window.localStorage) {
        localStorage.setItem('preferred-language', locale);
      }
    }
    
    const currentPath = loc.url.pathname;
    const pathParts = currentPath.split('/').filter(p => p);
    const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh'];
    const hasLocalePrefix = pathParts[0] && supportedLocales.includes(pathParts[0]);
    
    let newPath: string;
    if (hasLocalePrefix) {
      if (locale === 'en') {
        pathParts.shift();
        newPath = pathParts.length > 0 ? '/' + pathParts.join('/') : '/';
      } else {
        pathParts[0] = locale;
        newPath = '/' + pathParts.join('/');
      }
    } else {
      if (locale === 'en') {
        newPath = currentPath;
      } else {
        newPath = `/${locale}${currentPath === '/' ? '/' : currentPath}`;
      }
    }
    
    showLanguageMenu.value = false;
    closeMobileMenu();
    
    window.location.href = newPath;
  });

  const homePath = currentLocale.value === 'en' ? '/' : `/${currentLocale.value}/`;
  const mathPath = currentLocale.value === 'en' ? '/calculators/math-calculators' : `/${currentLocale.value}/calculators/math-calculators`;
  const electricalPath = currentLocale.value === 'en' ? '/calculators/electrical-calculator' : `/${currentLocale.value}/calculators/electrical-calculator`;

  const getFlagSvg = (code: string) => {
    const flags: Record<string, string> = {
      'en': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="24" fill="#B22234"/><rect width="36" height="1.85" y="2.67" fill="#FFFFFF"/><rect width="36" height="1.85" y="5.33" fill="#FFFFFF"/><rect width="36" height="1.85" y="8" fill="#FFFFFF"/><rect width="36" height="1.85" y="10.67" fill="#FFFFFF"/><rect width="36" height="1.85" y="13.33" fill="#FFFFFF"/><rect width="36" height="1.85" y="16" fill="#FFFFFF"/><rect width="36" height="1.85" y="18.67" fill="#FFFFFF"/><rect width="14.4" height="10.67" fill="#3C3B6E"/><circle cx="2.4" cy="2.4" r="0.6" fill="#FFFFFF"/><circle cx="4.8" cy="2.4" r="0.6" fill="#FFFFFF"/><circle cx="7.2" cy="2.4" r="0.6" fill="#FFFFFF"/><circle cx="9.6" cy="2.4" r="0.6" fill="#FFFFFF"/><circle cx="12" cy="2.4" r="0.6" fill="#FFFFFF"/><circle cx="3.6" cy="4.2" r="0.6" fill="#FFFFFF"/><circle cx="6" cy="4.2" r="0.6" fill="#FFFFFF"/><circle cx="8.4" cy="4.2" r="0.6" fill="#FFFFFF"/><circle cx="10.8" cy="4.2" r="0.6" fill="#FFFFFF"/><circle cx="2.4" cy="6" r="0.6" fill="#FFFFFF"/><circle cx="4.8" cy="6" r="0.6" fill="#FFFFFF"/><circle cx="7.2" cy="6" r="0.6" fill="#FFFFFF"/><circle cx="9.6" cy="6" r="0.6" fill="#FFFFFF"/><circle cx="12" cy="6" r="0.6" fill="#FFFFFF"/></svg>',
      'pl': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="12" y="0" fill="#FFFFFF"/><rect width="36" height="12" y="12" fill="#DC143C"/></svg>',
      'sv': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="24" fill="#006AA7"/><rect width="36" height="6" y="9" fill="#FECC00"/><rect width="6" height="24" x="9" fill="#FECC00"/></svg>',
      'de': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="8" y="0" fill="#000000"/><rect width="36" height="8" y="8" fill="#DD0000"/><rect width="36" height="8" y="16" fill="#FFCE00"/></svg>',
      'es': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="6" y="0" fill="#AA151B"/><rect width="36" height="12" y="6" fill="#F1BF00"/><rect width="36" height="6" y="18" fill="#AA151B"/></svg>',
      'fr': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="12" height="24" x="0" fill="#002654"/><rect width="12" height="24" x="12" fill="#FFFFFF"/><rect width="12" height="24" x="24" fill="#ED2939"/></svg>',
      'it': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="12" height="24" x="0" fill="#009246"/><rect width="12" height="24" x="12" fill="#FFFFFF"/><rect width="12" height="24" x="24" fill="#CE2B37"/></svg>',
      'nl': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="8" y="0" fill="#AE1C28"/><rect width="36" height="8" y="8" fill="#FFFFFF"/><rect width="36" height="8" y="16" fill="#21468B"/></svg>',
      'pt': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="24" x="0" fill="#006600"/><rect width="18" height="12" x="18" y="0" fill="#FF0000"/><rect width="18" height="12" x="18" y="12" fill="#FF0000"/></svg>',
      'vi': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="24" fill="#DA020E"/><polygon points="18,6 20,12 18,10 16,12" fill="#FFFF00"/></svg>',
      'tr': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="24" fill="#E30A17"/><circle cx="18" cy="12" r="6" fill="#FFFFFF"/><circle cx="18" cy="12" r="4" fill="#E30A17"/></svg>',
      'ru': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="8" y="0" fill="#FFFFFF"/><rect width="36" height="8" y="8" fill="#0039A6"/><rect width="36" height="8" y="16" fill="#D52B1E"/></svg>',
      'fa': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="8" y="0" fill="#239F40"/><rect width="36" height="8" y="8" fill="#FFFFFF"/><rect width="36" height="8" y="16" fill="#DA0000"/></svg>',
      'th': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="6" y="0" fill="#ED1C24"/><rect width="36" height="12" y="6" fill="#FFFFFF"/><rect width="36" height="6" y="18" fill="#241D4F"/></svg>',
      'ja': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="24" fill="#FFFFFF"/><circle cx="18" cy="12" r="7" fill="#BC002D"/></svg>',
      'zh': '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="24" fill="#DE2910"/><polygon points="18,4 20,8 24,8 20.5,10.5 22,14.5 18,12 14,14.5 15.5,10.5 12,8 16,8" fill="#FFDE00"/></svg>'
    };
    return flags[code] || flags['en'];
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pl', name: 'Polski', flag: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="12" y="0" fill="#FFFFFF"/><rect width="36" height="12" y="12" fill="#DC143C"/></svg>' },
    { code: 'sv', name: 'Svenska', flag: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="24" fill="#006AA7"/><rect width="36" height="6" y="9" fill="#FECC00"/><rect width="6" height="24" x="9" fill="#FECC00"/></svg>' },
    { code: 'de', name: 'Deutsch', flag: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="8" y="0" fill="#000000"/><rect width="36" height="8" y="8" fill="#DD0000"/><rect width="36" height="8" y="16" fill="#FFCE00"/></svg>' },
    { code: 'es', name: 'Español', flag: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="6" y="0" fill="#AA151B"/><rect width="36" height="12" y="6" fill="#F1BF00"/><rect width="36" height="6" y="18" fill="#AA151B"/></svg>' },
    { code: 'fr', name: 'Français', flag: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="12" height="24" x="0" fill="#002654"/><rect width="12" height="24" x="12" fill="#FFFFFF"/><rect width="12" height="24" x="24" fill="#ED2939"/></svg>' },
    { code: 'it', name: 'Italiano', flag: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="12" height="24" x="0" fill="#009246"/><rect width="12" height="24" x="12" fill="#FFFFFF"/><rect width="12" height="24" x="24" fill="#CE2B37"/></svg>' },
    { code: 'nl', name: 'Nederlands', flag: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="8" y="0" fill="#AE1C28"/><rect width="36" height="8" y="8" fill="#FFFFFF"/><rect width="36" height="8" y="16" fill="#21468B"/></svg>' },
    { code: 'pt', name: 'Português', flag: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="24" x="0" fill="#006600"/><rect width="18" height="12" x="18" y="0" fill="#FF0000"/><rect width="18" height="12" x="18" y="12" fill="#FF0000"/></svg>' },
    { code: 'vi', name: 'Tiếng Việt', flag: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="24" fill="#DA020E"/><polygon points="18,6 20,12 18,10 16,12" fill="#FFFF00"/></svg>' },
    { code: 'tr', name: 'Türkçe', flag: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="24" fill="#E30A17"/><circle cx="18" cy="12" r="6" fill="#FFFFFF"/><circle cx="18" cy="12" r="4" fill="#E30A17"/></svg>' },
    { code: 'ru', name: 'Русский', flag: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="8" y="0" fill="#FFFFFF"/><rect width="36" height="8" y="8" fill="#0039A6"/><rect width="36" height="8" y="16" fill="#D52B1E"/></svg>' },
    { code: 'fa', name: 'فارسی', flag: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="8" y="0" fill="#239F40"/><rect width="36" height="8" y="8" fill="#FFFFFF"/><rect width="36" height="8" y="16" fill="#DA0000"/></svg>' },
    { code: 'th', name: 'ไทย', flag: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="6" y="0" fill="#ED1C24"/><rect width="36" height="12" y="6" fill="#FFFFFF"/><rect width="36" height="6" y="18" fill="#241D4F"/></svg>' },
    { code: 'ja', name: '日本語', flag: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="24" fill="#FFFFFF"/><circle cx="18" cy="12" r="7" fill="#BC002D"/></svg>' },
    { code: 'zh', name: '中文', flag: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="24" fill="#DE2910"/><polygon points="18,4 20,8 24,8 20.5,10.5 22,14.5 18,12 14,14.5 15.5,10.5 12,8 16,8" fill="#FFDE00"/></svg>' }
  ];

  return (
    <nav class="navbar">
      <div class="container">
        <div class="navbar-content">
          <Link href={homePath} class="logo">
            <span class="logo-icon">🔢</span>
            <span class="logo-text">{t('home.title')}</span>
          </Link>
          
          <button 
            onClick$={toggleMobileMenu}
            class={`hamburger-button ${showMobileMenu.value ? 'active' : ''}`}
            aria-label="Toggle menu"
          >
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
          
          <div class="navbar-right">
            <Link href={homePath} class="nav-link">{t('nav.home')}</Link>
            <Link href={mathPath} class="nav-link">{t('nav.math')}</Link>
            <Link href={electricalPath} class="nav-link">{t('nav.electrical')}</Link>
            <div class="language-selector">
              <button 
                onClick$={toggleLanguageMenu}
                class={`language-button ${showLanguageMenu.value ? 'active' : ''}`}
              >
                <span class="current-language-flag" dangerouslySetInnerHTML={getFlagSvg(currentLocale.value)}></span>
                <span class="language-text">{currentLocale.value.toUpperCase()}</span>
                <span class={`language-arrow ${showLanguageMenu.value ? 'rotated' : ''}`}>▼</span>
              </button>
              {showLanguageMenu.value && (
                <div class="language-menu">
                  {languages.map((lang) => (
                    <button 
                      key={lang.code}
                      onClick$={() => selectLanguage(lang.code)}
                      class={`language-option ${currentLocale.value === lang.code ? 'active' : ''}`}
                    >
                      <span class="language-flag" dangerouslySetInnerHTML={getFlagSvg(lang.code)}></span>
                      <span class="language-code">{lang.code.toUpperCase()}</span>
                      <span class="language-name">{lang.name}</span>
                      {currentLocale.value === lang.code && <span class="check-icon">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showMobileMenu.value && (
        <div class="mobile-menu-overlay" onClick$={closeMobileMenu}></div>
      )}
      
      <div class={`mobile-menu ${showMobileMenu.value ? 'active' : ''}`}>
        <div class="mobile-menu-content">
          <Link href={homePath} class="mobile-nav-link" onClick$={closeMobileMenu}>
            {t('nav.home')}
          </Link>
          <Link href={mathPath} class="mobile-nav-link" onClick$={closeMobileMenu}>
            {t('nav.math')}
          </Link>
          <Link href={electricalPath} class="mobile-nav-link" onClick$={closeMobileMenu}>
            {t('nav.electrical')}
          </Link>
          
          <div class="mobile-language-section">
            <div class="mobile-language-label">{t('nav.language') || 'Language'}</div>
            <div class="mobile-language-selector">
              {languages.map((lang) => (
                <button 
                  key={lang.code}
                  onClick$={() => selectLanguage(lang.code)}
                  class={`mobile-language-option ${currentLocale.value === lang.code ? 'active' : ''}`}
                >
                  <span class="language-flag" dangerouslySetInnerHTML={lang.flag}></span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
});
