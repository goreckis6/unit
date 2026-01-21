<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-content">
        <router-link :to="currentLocale === 'en' ? '/' : `/${currentLocale}/`" class="logo">
          <span class="logo-icon">🔢</span>
          <span class="logo-text">{{ $t('home.title') }}</span>
        </router-link>
        
        <!-- Hamburger Menu Button (Mobile/Tablet) -->
        <button 
          @click="toggleMobileMenu" 
          class="hamburger-button"
          :class="{ active: showMobileMenu }"
          aria-label="Toggle menu"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
        
        <div class="navbar-right">
          <router-link :to="currentLocale === 'en' ? '/' : `/${currentLocale}/`" class="nav-link">{{ $t('nav.home') }}</router-link>
          <router-link :to="currentLocale === 'en' ? '/calculators/math-calculators' : `/${currentLocale}/calculators/math-calculators`" class="nav-link">{{ $t('nav.math') }}</router-link>
          <router-link :to="currentLocale === 'en' ? '/calculators/electrical-calculator' : `/${currentLocale}/calculators/electrical-calculator`" class="nav-link">{{ $t('nav.electrical') }}</router-link>
          <div class="language-selector">
            <button 
              @click="toggleLanguageMenu" 
              class="language-button"
              :class="{ active: showLanguageMenu }"
            >
              <span class="current-language-flag" v-html="getCurrentFlag()"></span>
              <span class="language-text">{{ currentLocale.toUpperCase() }}</span>
              <span class="language-arrow" :class="{ rotated: showLanguageMenu }">▼</span>
            </button>
            <div v-if="showLanguageMenu" class="language-menu" @click.stop>
              <button 
                @click="selectLanguage('en')" 
                class="language-option"
                :class="{ active: currentLocale === 'en' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
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
                </span>
                <span class="language-code">EN</span>
                <span class="language-name">English</span>
                <span v-if="currentLocale === 'en'" class="check-icon">✓</span>
              </button>
              <button 
                @click="selectLanguage('pl')" 
                class="language-option"
                :class="{ active: currentLocale === 'pl' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="12" y="0" fill="#FFFFFF"/>
                    <rect width="36" height="12" y="12" fill="#DC143C"/>
                  </svg>
                </span>
                <span class="language-code">PL</span>
                <span class="language-name">Polski</span>
                <span v-if="currentLocale === 'pl'" class="check-icon">✓</span>
              </button>
              <button 
                @click="selectLanguage('sv')" 
                class="language-option"
                :class="{ active: currentLocale === 'sv' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="24" fill="#006AA7"/>
                    <rect width="36" height="6" y="9" fill="#FECC00"/>
                    <rect width="6" height="24" x="9" fill="#FECC00"/>
                  </svg>
                </span>
                <span class="language-code">SV</span>
                <span class="language-name">Svenska</span>
                <span v-if="currentLocale === 'sv'" class="check-icon">✓</span>
              </button>
              <button 
                @click="selectLanguage('de')" 
                class="language-option"
                :class="{ active: currentLocale === 'de' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="8" y="0" fill="#000000"/>
                    <rect width="36" height="8" y="8" fill="#DD0000"/>
                    <rect width="36" height="8" y="16" fill="#FFCE00"/>
                  </svg>
                </span>
                <span class="language-code">DE</span>
                <span class="language-name">Deutsch</span>
                <span v-if="currentLocale === 'de'" class="check-icon">✓</span>
              </button>
              <button 
                @click="selectLanguage('es')" 
                class="language-option"
                :class="{ active: currentLocale === 'es' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="6" y="0" fill="#AA151B"/>
                    <rect width="36" height="12" y="6" fill="#F1BF00"/>
                    <rect width="36" height="6" y="18" fill="#AA151B"/>
                  </svg>
                </span>
                <span class="language-code">ES</span>
                <span class="language-name">Español</span>
                <span v-if="currentLocale === 'es'" class="check-icon">✓</span>
              </button>
              <button 
                @click="selectLanguage('fr')" 
                class="language-option"
                :class="{ active: currentLocale === 'fr' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="12" height="24" x="0" fill="#002654"/>
                    <rect width="12" height="24" x="12" fill="#FFFFFF"/>
                    <rect width="12" height="24" x="24" fill="#ED2939"/>
                  </svg>
                </span>
                <span class="language-code">FR</span>
                <span class="language-name">Français</span>
                <span v-if="currentLocale === 'fr'" class="check-icon">✓</span>
              </button>
              <button 
                @click="selectLanguage('it')" 
                class="language-option"
                :class="{ active: currentLocale === 'it' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="12" height="24" x="0" fill="#009246"/>
                    <rect width="12" height="24" x="12" fill="#FFFFFF"/>
                    <rect width="12" height="24" x="24" fill="#CE2B37"/>
                  </svg>
                </span>
                <span class="language-code">IT</span>
                <span class="language-name">Italiano</span>
                <span v-if="currentLocale === 'it'" class="check-icon">✓</span>
              </button>
              <button 
                @click="selectLanguage('nl')" 
                class="language-option"
                :class="{ active: currentLocale === 'nl' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="8" y="0" fill="#AE1C28"/>
                    <rect width="36" height="8" y="8" fill="#FFFFFF"/>
                    <rect width="36" height="8" y="16" fill="#21468B"/>
                  </svg>
                </span>
                <span class="language-code">NL</span>
                <span class="language-name">Nederlands</span>
                <span v-if="currentLocale === 'nl'" class="check-icon">✓</span>
              </button>
              <button 
                @click="selectLanguage('pt')" 
                class="language-option"
                :class="{ active: currentLocale === 'pt' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="18" height="24" x="0" fill="#006600"/>
                    <rect width="18" height="12" x="18" y="0" fill="#FF0000"/>
                    <rect width="18" height="12" x="18" y="12" fill="#FF0000"/>
                  </svg>
                </span>
                <span class="language-code">PT</span>
                <span class="language-name">Português</span>
                <span v-if="currentLocale === 'pt'" class="check-icon">✓</span>
              </button>
              <button 
                @click="selectLanguage('vi')" 
                class="language-option"
                :class="{ active: currentLocale === 'vi' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="24" fill="#DA020E"/>
                    <polygon points="18,6 20,12 18,10 16,12" fill="#FFFF00"/>
                  </svg>
                </span>
                <span class="language-code">VI</span>
                <span class="language-name">Tiếng Việt</span>
                <span v-if="currentLocale === 'vi'" class="check-icon">✓</span>
              </button>
              <button 
                @click="selectLanguage('tr')" 
                class="language-option"
                :class="{ active: currentLocale === 'tr' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="24" fill="#E30A17"/>
                    <circle cx="18" cy="12" r="6" fill="#FFFFFF"/>
                    <circle cx="18" cy="12" r="4" fill="#E30A17"/>
                  </svg>
                </span>
                <span class="language-code">TR</span>
                <span class="language-name">Türkçe</span>
                <span v-if="currentLocale === 'tr'" class="check-icon">✓</span>
              </button>
              <button 
                @click="selectLanguage('ru')" 
                class="language-option"
                :class="{ active: currentLocale === 'ru' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="8" y="0" fill="#FFFFFF"/>
                    <rect width="36" height="8" y="8" fill="#0039A6"/>
                    <rect width="36" height="8" y="16" fill="#D52B1E"/>
                  </svg>
                </span>
                <span class="language-code">RU</span>
                <span class="language-name">Русский</span>
                <span v-if="currentLocale === 'ru'" class="check-icon">✓</span>
              </button>
              <button 
                @click="selectLanguage('fa')" 
                class="language-option"
                :class="{ active: currentLocale === 'fa' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="8" y="0" fill="#239F40"/>
                    <rect width="36" height="8" y="8" fill="#FFFFFF"/>
                    <rect width="36" height="8" y="16" fill="#DA0000"/>
                  </svg>
                </span>
                <span class="language-code">FA</span>
                <span class="language-name">فارسی</span>
                <span v-if="currentLocale === 'fa'" class="check-icon">✓</span>
              </button>
              <button 
                @click="selectLanguage('th')" 
                class="language-option"
                :class="{ active: currentLocale === 'th' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="6" y="0" fill="#ED1C24"/>
                    <rect width="36" height="12" y="6" fill="#FFFFFF"/>
                    <rect width="36" height="6" y="18" fill="#241D4F"/>
                  </svg>
                </span>
                <span class="language-code">TH</span>
                <span class="language-name">ไทย</span>
                <span v-if="currentLocale === 'th'" class="check-icon">✓</span>
              </button>
              <button 
                @click="selectLanguage('ja')" 
                class="language-option"
                :class="{ active: currentLocale === 'ja' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="24" fill="#FFFFFF"/>
                    <circle cx="18" cy="12" r="7" fill="#BC002D"/>
                  </svg>
                </span>
                <span class="language-code">JA</span>
                <span class="language-name">日本語</span>
                <span v-if="currentLocale === 'ja'" class="check-icon">✓</span>
              </button>
              <button 
                @click="selectLanguage('zh')" 
                class="language-option"
                :class="{ active: currentLocale === 'zh' }"
              >
                <span class="language-flag">
                  <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="24" fill="#DE2910"/>
                    <polygon points="18,4 20,8 24,8 20.5,10.5 22,14.5 18,12 14,14.5 15.5,10.5 12,8 16,8" fill="#FFDE00"/>
                  </svg>
                </span>
                <span class="language-code">ZH</span>
                <span class="language-name">中文</span>
                <span v-if="currentLocale === 'zh'" class="check-icon">✓</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile Menu Overlay -->
    <div 
      v-if="showMobileMenu" 
      class="mobile-menu-overlay"
      @click="closeMobileMenu"
    ></div>
    
    <!-- Mobile Menu -->
    <div class="mobile-menu" :class="{ active: showMobileMenu }">
      <div class="mobile-menu-content">
        <router-link 
          :to="currentLocale === 'en' ? '/' : `/${currentLocale}/`" 
          class="mobile-nav-link"
          @click="closeMobileMenu"
        >
          {{ $t('nav.home') }}
        </router-link>
        <router-link 
          :to="currentLocale === 'en' ? '/calculators/math-calculators' : `/${currentLocale}/calculators/math-calculators`" 
          class="mobile-nav-link"
          @click="closeMobileMenu"
        >
          {{ $t('nav.math') }}
        </router-link>
        <router-link 
          :to="currentLocale === 'en' ? '/calculators/electrical-calculator' : `/${currentLocale}/calculators/electrical-calculator`" 
          class="mobile-nav-link"
          @click="closeMobileMenu"
        >
          {{ $t('nav.electrical') }}
        </router-link>
        
        <div class="mobile-language-section">
          <div class="mobile-language-label">{{ $t('nav.language') || 'Language' }}</div>
          <div class="mobile-language-selector">
            <button 
              @click="selectLanguage('en')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'en' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="24" fill="#B22234"/>
                  <rect width="36" height="1.85" y="2.67" fill="#FFFFFF"/>
                  <rect width="36" height="1.85" y="5.33" fill="#FFFFFF"/>
                  <rect width="36" height="1.85" y="8" fill="#FFFFFF"/>
                  <rect width="36" height="1.85" y="10.67" fill="#FFFFFF"/>
                  <rect width="36" height="1.85" y="13.33" fill="#FFFFFF"/>
                  <rect width="36" height="1.85" y="16" fill="#FFFFFF"/>
                  <rect width="36" height="1.85" y="18.67" fill="#FFFFFF"/>
                  <rect width="14.4" height="10.67" fill="#3C3B6E"/>
                </svg>
              </span>
              <span>English</span>
            </button>
            <button 
              @click="selectLanguage('pl')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'pl' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="12" y="0" fill="#FFFFFF"/>
                  <rect width="36" height="12" y="12" fill="#DC143C"/>
                </svg>
              </span>
              <span>Polski</span>
            </button>
            <button 
              @click="selectLanguage('es')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'es' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="6" y="0" fill="#AA151B"/>
                  <rect width="36" height="12" y="6" fill="#F1BF00"/>
                  <rect width="36" height="6" y="18" fill="#AA151B"/>
                </svg>
              </span>
              <span>Español</span>
            </button>
            <button 
              @click="selectLanguage('sv')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'sv' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="24" fill="#006AA7"/>
                  <rect width="36" height="6" y="9" fill="#FECC00"/>
                  <rect width="6" height="24" x="9" fill="#FECC00"/>
                </svg>
              </span>
              <span>Svenska</span>
            </button>
            <button 
              @click="selectLanguage('de')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'de' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="8" y="0" fill="#000000"/>
                  <rect width="36" height="8" y="8" fill="#DD0000"/>
                  <rect width="36" height="8" y="16" fill="#FFCE00"/>
                </svg>
              </span>
              <span>Deutsch</span>
            </button>
            <button 
              @click="selectLanguage('fr')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'fr' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="12" height="24" x="0" fill="#002654"/>
                  <rect width="12" height="24" x="12" fill="#FFFFFF"/>
                  <rect width="12" height="24" x="24" fill="#ED2939"/>
                </svg>
              </span>
              <span>Français</span>
            </button>
            <button 
              @click="selectLanguage('it')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'it' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="12" height="24" x="0" fill="#009246"/>
                  <rect width="12" height="24" x="12" fill="#FFFFFF"/>
                  <rect width="12" height="24" x="24" fill="#CE2B37"/>
                </svg>
              </span>
              <span>Italiano</span>
            </button>
            <button 
              @click="selectLanguage('nl')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'nl' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="8" y="0" fill="#AE1C28"/>
                  <rect width="36" height="8" y="8" fill="#FFFFFF"/>
                  <rect width="36" height="8" y="16" fill="#21468B"/>
                </svg>
              </span>
              <span>Nederlands</span>
            </button>
            <button 
              @click="selectLanguage('pt')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'pt' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="18" height="24" x="0" fill="#006600"/>
                  <rect width="18" height="12" x="18" y="0" fill="#FF0000"/>
                  <rect width="18" height="12" x="18" y="12" fill="#FF0000"/>
                </svg>
              </span>
              <span>Português</span>
            </button>
            <button 
              @click="selectLanguage('vi')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'vi' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="24" fill="#DA020E"/>
                  <polygon points="18,6 20,12 18,10 16,12" fill="#FFFF00"/>
                </svg>
              </span>
              <span>Tiếng Việt</span>
            </button>
            <button 
              @click="selectLanguage('tr')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'tr' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="24" fill="#E30A17"/>
                  <circle cx="18" cy="12" r="6" fill="#FFFFFF"/>
                  <circle cx="18" cy="12" r="4" fill="#E30A17"/>
                </svg>
              </span>
              <span>Türkçe</span>
            </button>
            <button 
              @click="selectLanguage('ru')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'ru' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="8" y="0" fill="#FFFFFF"/>
                  <rect width="36" height="8" y="8" fill="#0039A6"/>
                  <rect width="36" height="8" y="16" fill="#D52B1E"/>
                </svg>
              </span>
              <span>Русский</span>
            </button>
            <button 
              @click="selectLanguage('fa')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'fa' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="8" y="0" fill="#239F40"/>
                  <rect width="36" height="8" y="8" fill="#FFFFFF"/>
                  <rect width="36" height="8" y="16" fill="#DA0000"/>
                </svg>
              </span>
              <span>فارسی</span>
            </button>
            <button 
              @click="selectLanguage('th')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'th' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="6" y="0" fill="#ED1C24"/>
                  <rect width="36" height="12" y="6" fill="#FFFFFF"/>
                  <rect width="36" height="6" y="18" fill="#241D4F"/>
                </svg>
              </span>
              <span>ไทย</span>
            </button>
            <button 
              @click="selectLanguage('ja')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'ja' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="24" fill="#FFFFFF"/>
                  <circle cx="18" cy="12" r="7" fill="#BC002D"/>
                </svg>
              </span>
              <span>日本語</span>
            </button>
            <button 
              @click="selectLanguage('zh')" 
              class="mobile-language-option"
              :class="{ active: currentLocale === 'zh' }"
            >
              <span class="language-flag">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="24" fill="#DE2910"/>
                  <polygon points="18,4 20,8 24,8 20.5,10.5 22,14.5 18,12 14,14.5 15.5,10.5 12,8 16,8" fill="#FFDE00"/>
                </svg>
              </span>
              <span>中文</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      currentLocale: 'en',
      showLanguageMenu: false,
      showMobileMenu: false
    }
  },
  mounted() {
    // Get locale from current route
    this.updateLocaleFromRoute()
    
    // Watch for route changes
    this.$watch('$route', () => {
      this.updateLocaleFromRoute()
    })
    
    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    updateLocaleFromRoute() {
      const path = this.$route.path
      const pathParts = path.split('/').filter(p => p)
      const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh']
      
      // Extract locale from URL (first part of path)
      // If no locale prefix, it's English (default)
      const localeFromPath = pathParts[0] && supportedLocales.includes(pathParts[0]) ? pathParts[0] : 'en'
      
      this.currentLocale = localeFromPath
      this.$i18n.locale = localeFromPath
      
      // Update HTML lang attribute
      if (typeof document !== 'undefined') {
        document.documentElement.lang = localeFromPath
      }
      
      // Save preference
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('preferred-language', localeFromPath)
      }
    },
    toggleLanguageMenu(event) {
      event.stopPropagation()
      this.showLanguageMenu = !this.showLanguageMenu
    },
    closeLanguageMenu() {
      this.showLanguageMenu = false
    },
    selectLanguage(locale) {
      // Set locale immediately before navigation
      this.currentLocale = locale
      this.$i18n.locale = locale
      document.documentElement.lang = locale
      
      const currentPath = this.$route.path
      const pathParts = currentPath.split('/').filter(p => p)
      const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh']
      
      // Check if current path has a locale prefix
      const hasLocalePrefix = pathParts[0] && supportedLocales.includes(pathParts[0])
      
      // Build new path with locale
      let newPath
      if (hasLocalePrefix) {
        // Replace locale in current path
        if (locale === 'en') {
          // Remove locale prefix for English
          pathParts.shift()
          newPath = pathParts.length > 0 ? '/' + pathParts.join('/') : '/'
        } else {
          pathParts[0] = locale
          newPath = '/' + pathParts.join('/')
        }
      } else {
        // Current path doesn't have locale prefix (it's English)
        if (locale === 'en') {
          // Already English, no change needed
          newPath = currentPath
        } else {
          // Add locale prefix for other languages
          newPath = `/${locale}${currentPath === '/' ? '/' : currentPath}`
        }
      }
      
      // Close menus immediately
      this.showLanguageMenu = false
      this.closeMobileMenu()
      
      // Navigate to new path with locale
      this.$router.push(newPath).catch(() => {
        // Handle navigation errors silently
      })
    },
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu
      // Prevent body scroll when menu is open
      if (this.showMobileMenu) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },
    closeMobileMenu() {
      this.showMobileMenu = false
      document.body.style.overflow = ''
    },
    handleClickOutside(event) {
      const selector = event.target.closest('.language-selector')
      if (!selector && this.showLanguageMenu) {
        this.showLanguageMenu = false
      }
    },
    getCurrentFlag() {
      const flags = {
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
      }
      return flags[this.currentLocale] || flags['en']
    }
  }
}
</script>

<style scoped>
.navbar {
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  font-size: 1.5rem;
  font-weight: 700;
  transition: transform 0.2s ease;
}

.logo:hover {
  transform: translateY(-1px);
}

.logo-icon {
  font-size: 2.25rem;
  filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3));
  transition: transform 0.3s ease;
}

.logo:hover .logo-icon {
  transform: rotate(5deg) scale(1.05);
}

.logo-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.nav-link {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  padding: 0.5rem 0;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--gradient-primary);
  transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

.nav-link:hover {
  color: var(--primary-color);
}

.language-selector {
  position: relative;
}

.language-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  border: 1.5px solid var(--border-color);
  border-radius: 0.75rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
  font-family: inherit;
}

.language-button:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
  background: var(--bg-secondary);
}

.language-button.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.current-language-flag {
  width: 24px;
  height: 18px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.current-language-flag svg {
  width: 100%;
  height: 100%;
  display: block;
}

.language-button:hover .current-language-flag {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.language-text {
  font-weight: 700;
  letter-spacing: 0.5px;
}

.language-arrow {
  font-size: 0.625rem;
  transition: transform 0.2s ease;
  opacity: 0.6;
}

.language-arrow.rotated {
  transform: rotate(180deg);
}

.language-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--bg-primary);
  border: 1.5px solid var(--border-color);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-xl);
  min-width: 200px;
  max-width: 250px;
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1000;
  animation: slideDown 0.2s ease;
  display: flex;
  flex-direction: column;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.language-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1.125rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  text-align: left;
}

.language-option:hover {
  background: var(--bg-secondary);
}

.language-option.active {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  font-weight: 600;
}

.language-flag {
  width: 24px;
  height: 18px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.language-flag svg {
  width: 100%;
  height: 100%;
  display: block;
}

.language-code {
  font-weight: 700;
  font-size: 0.8125rem;
  min-width: 32px;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.language-option.active .language-code {
  color: var(--primary-color);
}

.language-name {
  flex: 1;
}

.check-icon {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1rem;
}

/* Hamburger Menu Button */
.hamburger-button {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 28px;
  height: 22px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
  position: relative;
}

.hamburger-line {
  width: 100%;
  height: 3px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger-button.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(7px, 7px);
}

.hamburger-button.active .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: translateX(-10px);
}

.hamburger-button.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

/* Mobile Menu Overlay */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Mobile Menu */
.mobile-menu {
  position: fixed;
  top: 0;
  right: -100%;
  width: 85%;
  max-width: 320px;
  height: 100vh;
  background: var(--bg-primary);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: right 0.3s ease;
  overflow-y: auto;
}

.mobile-menu.active {
  right: 0;
}

.mobile-menu-content {
  padding: 5rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-link {
  padding: 1rem 1.25rem;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1rem;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  text-decoration: none;
  display: block;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  background: var(--bg-secondary);
  color: var(--primary-color);
}

.mobile-language-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-light);
}

.mobile-language-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mobile-language-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-language-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.125rem;
  border: 1.5px solid var(--border-color);
  border-radius: 0.75rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  text-align: left;
  width: 100%;
}

.mobile-language-option:hover {
  border-color: var(--primary-color);
  background: var(--bg-secondary);
}

.mobile-language-option.active {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  font-weight: 600;
}

.mobile-language-option .language-flag {
  width: 24px;
  height: 18px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.mobile-language-option .language-flag svg {
  width: 100%;
  height: 100%;
  display: block;
}

@media (max-width: 1024px) {
  .hamburger-button {
    display: flex;
  }
  
  .navbar-right {
    display: none;
  }
}

@media (max-width: 640px) {
  .navbar-content {
    padding: 1rem 0;
  }
  
  .logo-text {
    font-size: 1.25rem;
  }
  
  .logo-icon {
    font-size: 1.875rem;
  }
  
  .mobile-menu {
    width: 90%;
    max-width: 300px;
  }
  
  .mobile-menu-content {
    padding: 4rem 1.25rem 2rem;
  }
  
  .mobile-nav-link {
    padding: 0.875rem 1rem;
    font-size: 0.9375rem;
  }
}
</style>

