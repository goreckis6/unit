<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- Brand Section -->
        <div class="footer-brand">
          <router-link :to="`/${currentLocale}/`" class="footer-logo">
            <span class="logo-icon">🔢</span>
            <span class="logo-text">{{ $t('home.title') }}</span>
          </router-link>
          <p class="footer-tagline">{{ $t('footer.tagline') }}</p>
        </div>

        <!-- Links Section -->
        <div class="footer-links">
          <div class="footer-column">
            <h3 class="footer-heading">{{ $t('footer.calculators') }}</h3>
            <ul class="footer-list">
              <li>
                <router-link :to="currentLocale === 'en' ? '/calculators/math-calculators' : `/${currentLocale}/calculators/math-calculators`" class="footer-link">
                  {{ $t('calculators.mathCalculators.title') }}
                </router-link>
              </li>
              <li>
                <router-link :to="currentLocale === 'en' ? '/calculators/electrical-calculator' : `/${currentLocale}/calculators/electrical-calculator`" class="footer-link">
                  {{ $t('calculators.electrical.title') }}
                </router-link>
              </li>
            </ul>
          </div>

          <div class="footer-column">
            <h3 class="footer-heading">{{ $t('footer.resources') }}</h3>
            <ul class="footer-list">
              <li>
                <router-link :to="`/${currentLocale}/`" class="footer-link">
                  {{ $t('nav.home') }}
                </router-link>
              </li>
              <li>
                <a href="#" class="footer-link">{{ $t('footer.about') }}</a>
              </li>
              <li>
                <a href="#" class="footer-link">{{ $t('footer.contact') }}</a>
              </li>
              <li>
                <a href="#" class="footer-link">{{ $t('footer.privacy') }}</a>
              </li>
              <li>
                <a href="#" class="footer-link">{{ $t('footer.terms') }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <p class="footer-copyright">
          &copy; {{ currentYear }} {{ $t('footer.copyright') }}
        </p>
        <div class="footer-social">
          <!-- Social links can be added here if needed -->
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {
      currentLocale: 'en',
      currentYear: new Date().getFullYear()
    }
  },
  mounted() {
    this.updateLocaleFromRoute()
    
    this.$watch('$route', () => {
      this.updateLocaleFromRoute()
    })
  },
  methods: {
    updateLocaleFromRoute() {
      const path = this.$route.path
      const pathParts = path.split('/').filter(p => p)
      const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh']
      
      const localeFromPath = pathParts[0] && supportedLocales.includes(pathParts[0]) ? pathParts[0] : 'en'
      
      this.currentLocale = localeFromPath
    }
  }
}
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, var(--text-primary) 0%, #1a1a2e 100%);
  color: rgba(255, 255, 255, 0.9);
  padding: 4rem 0 2rem;
  margin-top: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  margin-bottom: 3rem;
}

.footer-brand {
  max-width: 300px;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  text-decoration: none;
  margin-bottom: 1rem;
  transition: opacity 0.3s ease;
}

.footer-logo:hover {
  opacity: 0.8;
}

.logo-icon {
  font-size: 2rem;
}

.logo-text {
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-tagline {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
}

.footer-column {
  display: flex;
  flex-direction: column;
}

.footer-heading {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.25rem;
  letter-spacing: 0.5px;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: all 0.3s ease;
  display: inline-block;
}

.footer-link:hover {
  color: white;
  transform: translateX(4px);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-copyright {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin: 0;
}

.footer-social {
  display: flex;
  gap: 1rem;
}

@media (max-width: 968px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .footer-links {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

@media (max-width: 640px) {
  .footer {
    padding: 3rem 0 1.5rem;
  }

  .container {
    padding: 0 1.5rem;
  }

  .footer-content {
    gap: 2rem;
  }

  .footer-links {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
