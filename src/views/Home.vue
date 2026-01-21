<template>
  <div class="home">
    <Navbar />
    
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">{{ $t('home.title') }}</h1>
          <p class="hero-subtitle">{{ $t('home.subtitle') }}</p>
          <p class="hero-description">{{ $t('home.description') }}</p>
        </div>
      </div>
    </section>

    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">{{ $t('home.categories.title') }}</h2>
        <p class="section-subtitle">{{ $t('home.categories.subtitle') }}</p>
        <div class="categories-grid">
          <router-link 
            :to="$i18n.locale === 'en' ? '/calculators/math-calculators' : `/${$i18n.locale}/calculators/math-calculators`" 
            class="category-card"
          >
            <div class="category-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="category-name">{{ $t('calculators.mathCalculators.title') }}</h3>
            <p class="category-description">
              {{ $t('calculators.mathCalculators.description') }}
            </p>
            <span class="category-link">{{ $t('home.viewAll') || 'View All' }}</span>
          </router-link>
          
          <router-link 
            :to="$i18n.locale === 'en' ? '/calculators/electrical-calculator' : `/${$i18n.locale}/calculators/electrical-calculator`" 
            class="category-card"
          >
            <div class="category-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="category-name">{{ $t('calculators.electrical.title') }}</h3>
            <p class="category-description">
              {{ $t('calculators.electrical.description') }}
            </p>
            <span class="category-link">{{ $t('home.viewAll') || 'View All' }}</span>
          </router-link>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="container">
        <h2 class="section-title">{{ $t('home.features.title') }}</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ $t('home.features.fast.title') }}</h3>
            <p class="feature-description">{{ $t('home.features.fast.description') }}</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ $t('home.features.free.title') }}</h3>
            <p class="feature-description">{{ $t('home.features.free.description') }}</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ $t('home.features.easy.title') }}</h3>
            <p class="feature-description">{{ $t('home.features.easy.description') }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue'
import { updateHreflangTags, updateCanonicalTag } from '../utils/seo.js'
import { supportedLocales } from '../router/index.js'

export default {
  name: 'Home',
  components: {
    Navbar
  },
  mounted() {
    this.updateLocale()
    this.updateMetaTags()
    this.updateSEO()
  },
  watch: {
    '$route'(to, from) {
      // Update locale when route changes
      if (to.meta && to.meta.locale) {
        this.updateLocale()
      }
      this.updateSEO()
    },
    '$i18n.locale'() {
      // Force update when locale changes
      this.updateMetaTags()
      this.updateSEO()
      this.$forceUpdate()
    }
  },
  methods: {
    updateLocale() {
      const locale = this.$route.meta?.locale || this.$i18n.locale || 'en'
      if (this.$i18n.locale !== locale) {
        this.$i18n.locale = locale
      }
      document.documentElement.lang = locale
      // Force re-render to ensure translations update
      this.$nextTick(() => {
        this.$forceUpdate()
      })
    },
    updateMetaTags() {
      const locale = this.$i18n.locale
      
      // Update title
      document.title = this.$t('home.seo.title')
      
      // Update description
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', this.$t('home.seo.description'))
      
      // Update keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', this.$t('home.seo.keywords'))
      
      document.documentElement.lang = locale
      
      this.updateOpenGraph()
    },
    updateOpenGraph() {
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      ogTitle.setAttribute('content', this.$t('home.seo.title'))
      if (!document.querySelector('meta[property="og:title"]')) {
        document.head.appendChild(ogTitle)
      }

      const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      ogDescription.setAttribute('content', this.$t('home.seo.description'))
      if (!document.querySelector('meta[property="og:description"]')) {
        document.head.appendChild(ogDescription)
      }

      const baseUrl = window.location.origin
      const ogUrl = document.querySelector('meta[property="og:url"]') || document.createElement('meta')
      ogUrl.setAttribute('property', 'og:url')
      const currentPath = this.$route.path
      ogUrl.setAttribute('content', baseUrl + currentPath)
      if (!document.querySelector('meta[property="og:url"]')) {
        document.head.appendChild(ogUrl)
      }
    },
    updateSEO() {
      // Update meta tags first
      this.updateMetaTags()
      
      // Update hreflang tags for all language versions
      updateHreflangTags(this.$route.path, supportedLocales)
      
      // Update canonical tag
      updateCanonicalTag(this.$route.path)
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.hero {
  background: var(--gradient-hero);
  color: white;
  padding: 6rem 0 5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 1.25rem;
  line-height: 1.1;
  letter-spacing: -1.5px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  opacity: 0.95;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.hero-description {
  font-size: 1.25rem;
  opacity: 0.92;
  line-height: 1.8;
  max-width: 700px;
  margin: 0 auto;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.categories-section,
.features-section {
  padding: 5rem 0;
}

.section-title {
  font-size: 3rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 3.5rem;
  color: var(--text-primary);
  letter-spacing: -1px;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: var(--gradient-primary);
  border-radius: 2px;
}

.section-subtitle {
  text-align: center;
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2.5rem;
  margin-top: 3rem;
}

.category-card {
  background: var(--bg-primary);
  border: 2px solid var(--border-light);
  border-radius: 1.5rem;
  padding: 3rem;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
}

.category-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.category-card:hover::after {
  opacity: 1;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: var(--gradient-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.category-card:hover::before {
  transform: scaleX(1);
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.2), 0 0 0 1px rgba(99, 102, 241, 0.1);
  border-color: var(--primary-color);
  background: linear-gradient(135deg, var(--bg-primary) 0%, rgba(99, 102, 241, 0.08) 100%);
}

.category-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-radius: 1.5rem;
  border: 2px solid rgba(99, 102, 241, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.category-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-primary);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 1.5rem;
}

.category-icon svg {
  width: 48px;
  height: 48px;
  color: var(--primary-color);
  position: relative;
  z-index: 1;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 8px rgba(99, 102, 241, 0.3));
}

.category-card:hover .category-icon {
  transform: scale(1.05);
  border-color: var(--primary-color);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

.category-card:hover .category-icon::before {
  opacity: 0.1;
}

.category-card:hover .category-icon svg {
  color: var(--primary-color);
  filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.5));
}

.category-name {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1rem;
  line-height: 1.2;
  background: linear-gradient(135deg, var(--text-primary) 0%, rgba(99, 102, 241, 0.9) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.category-card:hover .category-name {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.category-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 400px;
}

.category-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.125rem;
  transition: all 0.3s ease;
  padding: 0.75rem 1.5rem;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 0.75rem;
  border: 2px solid transparent;
}

.category-link::after {
  content: '→';
  transition: transform 0.3s ease;
}

.category-card:hover .category-link {
  color: white;
  background: var(--gradient-primary);
  border-color: transparent;
}

.category-card:hover .category-link::after {
  transform: translateX(4px);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--bg-primary);
  border: 2px solid var(--border-light);
  border-radius: 1.5rem;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
  border-radius: 4px 4px 0 0;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.15);
  border-color: var(--primary-color);
  background: linear-gradient(135deg, var(--bg-primary) 0%, rgba(99, 102, 241, 0.03) 100%);
}

.feature-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-radius: 1rem;
  border: 2px solid rgba(99, 102, 241, 0.2);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.feature-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-primary);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 1rem;
}

.feature-icon svg {
  width: 32px;
  height: 32px;
  color: var(--primary-color);
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 6px rgba(99, 102, 241, 0.3));
}

.feature-card:hover .feature-icon {
  transform: scale(1.05);
  border-color: var(--primary-color);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.25);
}

.feature-card:hover .feature-icon::before {
  opacity: 0.1;
}

.feature-card:hover .feature-icon svg {
  filter: drop-shadow(0 3px 10px rgba(99, 102, 241, 0.4));
}

.feature-title {
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
  position: relative;
  z-index: 1;
  letter-spacing: -0.3px;
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.7;
  position: relative;
  z-index: 1;
  font-size: 0.9375rem;
}

.footer {
  background: var(--bg-primary);
  border-top: 1px solid var(--border-light);
  padding: 3rem 0;
  margin-top: auto;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

@media (max-width: 768px) {
  .hero {
    padding: 4rem 0 3.5rem;
  }
  
  .hero-title {
    font-size: 2.75rem;
    letter-spacing: -1px;
  }
  
  .hero-subtitle {
    font-size: 1.375rem;
  }
  
  .hero-description {
    font-size: 1.0625rem;
  }
  
  .section-title {
    font-size: 2.25rem;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .category-card {
    padding: 2.5rem;
  }
  
  .category-icon {
    width: 70px;
    height: 70px;
  }
  
  .category-icon svg {
    width: 42px;
    height: 42px;
  }
  
  .feature-icon {
    width: 56px;
    height: 56px;
  }
  
  .feature-icon svg {
    width: 28px;
    height: 28px;
  }
  
  .category-name {
    font-size: 1.75rem;
  }
  
  .category-description {
    font-size: 1rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .categories-section,
  .features-section {
    padding: 3.5rem 0;
  }
  
  .category-card {
    padding: 2rem;
  }
  
  .category-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 1.25rem;
  }
  
  .category-icon svg {
    width: 36px;
    height: 36px;
  }
  
  .feature-icon {
    width: 52px;
    height: 52px;
  }
  
  .feature-icon svg {
    width: 26px;
    height: 26px;
  }
  
  .feature-card {
    padding: 2.5rem 1.5rem;
  }
  
  .category-name {
    font-size: 1.5rem;
  }
  
  .category-description {
    font-size: 0.9375rem;
  }
  
  .category-link {
    font-size: 1rem;
    padding: 0.625rem 1.25rem;
  }
}
</style>

