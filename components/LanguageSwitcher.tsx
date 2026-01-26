'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

const FLAGS: Record<string, JSX.Element> = {
  en: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="24" fill="#B22234"/>
      <rect width="36" height="1.85" y="2.67" fill="#FFFFFF"/>
      <rect width="36" height="1.85" y="5.33" fill="#FFFFFF"/>
      <rect width="36" height="1.85" y="8" fill="#FFFFFF"/>
      <rect width="36" height="1.85" y="10.67" fill="#FFFFFF"/>
      <rect width="36" height="1.85" y="13.33" fill="#FFFFFF"/>
      <rect width="36" height="1.85" y="16" fill="#FFFFFF"/>
      <rect width="36" height="1.85" y="18.67" fill="#FFFFFF"/>
      <rect width="14.4" height="10.67" fill="#3C3B6E"/>
      <circle cx="2.4" cy="2.4" r="0.6" fill="#FFFFFF"/>
      <circle cx="4.8" cy="2.4" r="0.6" fill="#FFFFFF"/>
      <circle cx="7.2" cy="2.4" r="0.6" fill="#FFFFFF"/>
      <circle cx="9.6" cy="2.4" r="0.6" fill="#FFFFFF"/>
      <circle cx="12" cy="2.4" r="0.6" fill="#FFFFFF"/>
      <circle cx="3.6" cy="4.2" r="0.6" fill="#FFFFFF"/>
      <circle cx="6" cy="4.2" r="0.6" fill="#FFFFFF"/>
      <circle cx="8.4" cy="4.2" r="0.6" fill="#FFFFFF"/>
      <circle cx="10.8" cy="4.2" r="0.6" fill="#FFFFFF"/>
      <circle cx="2.4" cy="6" r="0.6" fill="#FFFFFF"/>
      <circle cx="4.8" cy="6" r="0.6" fill="#FFFFFF"/>
      <circle cx="7.2" cy="6" r="0.6" fill="#FFFFFF"/>
      <circle cx="9.6" cy="6" r="0.6" fill="#FFFFFF"/>
      <circle cx="12" cy="6" r="0.6" fill="#FFFFFF"/>
    </svg>
  ),
  pl: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="12" y="0" fill="#FFFFFF"/>
      <rect width="36" height="12" y="12" fill="#DC143C"/>
    </svg>
  ),
  de: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="8" y="0" fill="#000000"/>
      <rect width="36" height="8" y="8" fill="#DD0000"/>
      <rect width="36" height="8" y="16" fill="#FFCE00"/>
    </svg>
  ),
  fr: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="12" height="24" x="0" fill="#002654"/>
      <rect width="12" height="24" x="12" fill="#FFFFFF"/>
      <rect width="12" height="24" x="24" fill="#ED2939"/>
    </svg>
  ),
  es: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="6" y="0" fill="#AA151B"/>
      <rect width="36" height="12" y="6" fill="#F1BF00"/>
      <rect width="36" height="6" y="18" fill="#AA151B"/>
    </svg>
  ),
  it: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="12" height="24" x="0" fill="#009246"/>
      <rect width="12" height="24" x="12" fill="#FFFFFF"/>
      <rect width="12" height="24" x="24" fill="#CE2B37"/>
    </svg>
  ),
  nl: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="8" y="0" fill="#AE1C28"/>
      <rect width="36" height="8" y="8" fill="#FFFFFF"/>
      <rect width="36" height="8" y="16" fill="#21468B"/>
    </svg>
  ),
  pt: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="18" height="24" x="0" fill="#006600"/>
      <rect width="18" height="12" x="18" y="0" fill="#FF0000"/>
      <rect width="18" height="12" x="18" y="12" fill="#FF0000"/>
    </svg>
  ),
  cs: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="12" y="0" fill="#FFFFFF"/>
      <rect width="36" height="12" y="12" fill="#D7141A"/>
      <polygon points="0,0 18,12 0,24" fill="#11457E"/>
    </svg>
  ),
  sk: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="8" y="0" fill="#FFFFFF"/>
      <rect width="36" height="8" y="8" fill="#0B4EA2"/>
      <rect width="36" height="8" y="16" fill="#EE1C25"/>
    </svg>
  ),
  hu: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="8" y="0" fill="#FFFFFF"/>
      <rect width="36" height="8" y="8" fill="#CE2939"/>
      <rect width="36" height="8" y="16" fill="#477050"/>
    </svg>
  ),
  sv: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="24" fill="#006AA7"/>
      <rect width="36" height="6" y="9" fill="#FECC00"/>
      <rect width="6" height="24" x="9" fill="#FECC00"/>
    </svg>
  ),
  no: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="24" fill="#BA0C2F"/>
      <rect width="36" height="4" y="10" fill="#FFFFFF"/>
      <rect width="4" height="24" x="10" fill="#FFFFFF"/>
      <rect width="36" height="2" y="11" fill="#00205B"/>
      <rect width="2" height="24" x="11" fill="#00205B"/>
    </svg>
  ),
  da: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="24" fill="#C8102E"/>
      <rect width="36" height="4" y="10" fill="#FFFFFF"/>
      <rect width="4" height="24" x="10" fill="#FFFFFF"/>
    </svg>
  ),
  fi: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="24" fill="#FFFFFF"/>
      <rect width="36" height="4" y="10" fill="#003580"/>
      <rect width="4" height="24" x="10" fill="#003580"/>
    </svg>
  ),
  ro: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="12" height="24" x="0" fill="#002B7F"/>
      <rect width="12" height="24" x="12" fill="#FCD116"/>
      <rect width="12" height="24" x="24" fill="#CE1126"/>
    </svg>
  ),
  ru: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="8" y="0" fill="#FFFFFF"/>
      <rect width="36" height="8" y="8" fill="#0039A6"/>
      <rect width="36" height="8" y="16" fill="#D52B1E"/>
    </svg>
  ),
  ja: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="24" fill="#FFFFFF"/>
      <circle cx="18" cy="12" r="7.2" fill="#BC002D"/>
    </svg>
  ),
  zh: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="24" fill="#DE2910"/>
      <circle cx="9" cy="6" r="1.2" fill="#FFDE00"/>
      <circle cx="11.4" cy="7.2" r="0.8" fill="#FFDE00"/>
      <circle cx="10.2" cy="8.4" r="0.8" fill="#FFDE00"/>
      <circle cx="8.4" cy="8.4" r="0.8" fill="#FFDE00"/>
      <circle cx="7.2" cy="7.2" r="0.8" fill="#FFDE00"/>
    </svg>
  ),
  ko: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="24" fill="#FFFFFF"/>
      <circle cx="18" cy="12" r="6" fill="#CE1126"/>
      <path d="M 18 6 Q 14 12 18 18 Q 22 12 18 6" fill="#003478"/>
      <circle cx="18" cy="12" r="3" fill="#FFFFFF"/>
      <circle cx="18" cy="12" r="2" fill="#003478"/>
    </svg>
  ),
  ar: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="24" fill="#006C35"/>
      <path d="M 8 12 L 28 12" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
      <path d="M 18 6 L 18 18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M 12 8 L 18 12 L 12 16" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  hi: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="8" y="0" fill="#FF9933"/>
      <rect width="36" height="8" y="8" fill="#FFFFFF"/>
      <rect width="36" height="8" y="16" fill="#138808"/>
      <circle cx="18" cy="12" r="3" fill="#000080"/>
    </svg>
  ),
  id: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="12" y="0" fill="#CE1126"/>
      <rect width="36" height="12" y="12" fill="#FFFFFF"/>
    </svg>
  ),
  tr: (
    <svg viewBox="0 0 36 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="24" fill="#E30A17"/>
      <circle cx="12" cy="12" r="5" fill="#FFFFFF"/>
      <circle cx="13.5" cy="12" r="4" fill="#E30A17"/>
      <circle cx="15" cy="12" r="1.5" fill="#FFFFFF"/>
    </svg>
  ),
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  pl: 'Polski',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  nl: 'Nederlands',
  pt: 'Português',
  cs: 'Čeština',
  sk: 'Slovenčina',
  hu: 'Magyar',
  sv: 'Svenska',
  no: 'Norsk',
  da: 'Dansk',
  fi: 'Suomi',
  ro: 'Română',
  ru: 'Русский',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
  ar: 'العربية',
  hi: 'हिन्दी',
  id: 'Bahasa Indonesia',
  tr: 'Türkçe',
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    const nextPath = pathname || '/';
    router.replace(nextPath, { locale: newLocale });
    setIsOpen(false);
  };

  const currentFlag = FLAGS[locale] || FLAGS.en;
  const currentName = LANGUAGE_NAMES[locale] || 'English';

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`language-button ${isOpen ? 'active' : ''}`}
        aria-label="Select language"
      >
        <span className="current-language-flag">{currentFlag}</span>
        <span className="language-text">{locale.toUpperCase()}</span>
        <span className={`language-arrow ${isOpen ? 'rotated' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="language-menu">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLanguageChange(loc)}
              className={`language-option ${locale === loc ? 'active' : ''}`}
            >
              <span className="language-flag">{FLAGS[loc] || FLAGS.en}</span>
              <span className="language-code">{loc.toUpperCase()}</span>
              <span className="language-name">{LANGUAGE_NAMES[loc] || loc}</span>
              {locale === loc && <span className="check-icon">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
