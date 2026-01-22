'use client';

import { useState, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslations } from 'next-intl';

export function Header() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link href="/" className="logo" onClick={closeMenu}>
            <span className="logo-icon">🔢</span>
            <span className="logo-text">{t('siteName')}</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="nav desktop-nav">
            <Link href="/calculators/math" className="nav-link">
              Math
            </Link>
            <Link href="/calculators/electric" className="nav-link">
              Electric
            </Link>
            <LanguageSwitcher />
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}>
        <nav className={`mobile-nav ${isMenuOpen ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="mobile-nav-header">
            <Link href="/" className="mobile-logo" onClick={closeMenu}>
              <span className="logo-icon">🔢</span>
              <span className="logo-text">{t('siteName')}</span>
            </Link>
            <button
              className="mobile-menu-close"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="mobile-nav-links">
            <Link 
              href="/calculators/math" 
              className={`mobile-nav-link ${pathname.includes('/calculators/math') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Math
            </Link>
            <Link 
              href="/calculators/electric" 
              className={`mobile-nav-link ${pathname.includes('/calculators/electric') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Electric
            </Link>
            <div className="mobile-language-switcher">
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
