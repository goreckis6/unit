<template>
  <div class="calculator-page">
    <Navbar />
    
    <div class="page-background">
      <div class="bg-gradient"></div>
    </div>

    <div class="container">
      <div class="calculator-header">
        <router-link :to="$i18n.locale === 'en' ? '/' : `/${$i18n.locale}/`" class="back-button">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ $t('common.back') }}</span>
        </router-link>
        <div class="header-content">
          <div class="title-badge">{{ $t('calculators.mathCalculators.badge') }}</div>
          <h1 class="page-title">{{ $t('calculators.mathCalculators.title') }}</h1>
          <p class="page-description">{{ $t('calculators.mathCalculators.description') }}</p>
        </div>
      </div>

      <div class="calculators-container">
        <!-- Search Bar -->
        <div class="search-section">
          <div class="search-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input 
              type="text" 
              v-model="searchQuery" 
              :placeholder="$t('calculators.mathCalculators.searchPlaceholder')"
              class="search-input"
            />
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''" 
              class="clear-search"
              aria-label="Clear search"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div v-if="searchQuery" class="search-results-count">
            {{ filteredCalculators.length }} {{ $t('calculators.mathCalculators.resultsFound') }}
          </div>
        </div>

        <!-- Calculators List -->
        <div class="calculators-list">
          <router-link 
            v-for="calc in filteredCalculators"
            :key="calc.id"
            :to="calc.path" 
            class="calculator-list-item"
          >
            <div class="calculator-content">
              <h3 class="calculator-name">{{ calc.title }}</h3>
              <p class="calculator-description">{{ calc.description }}</p>
            </div>
            <div class="calculator-arrow">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </router-link>

          <div v-if="filteredCalculators.length === 0" class="no-results">
            <svg class="no-results-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p class="no-results-text">{{ $t('calculators.mathCalculators.noResults') }}</p>
            <p class="no-results-hint">{{ $t('calculators.mathCalculators.tryDifferentSearch') }}</p>
          </div>
        </div>

        <!-- SEO Content Section -->
        <div class="seo-content-section">
          <div class="seo-content-card">
            <h2 class="seo-heading">{{ $t('calculators.mathCalculators.seo.content.heading') }}</h2>
            
            <div class="seo-paragraphs">
              <p class="seo-paragraph">
                {{ $t('calculators.mathCalculators.seo.content.paragraph1') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.mathCalculators.seo.content.paragraph2') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.mathCalculators.seo.content.paragraph3') }}
              </p>
              
              <div class="seo-example">
                <h3 class="example-heading">{{ $t('calculators.mathCalculators.seo.content.exampleHeading') }}</h3>
                <p class="example-text">{{ $t('calculators.mathCalculators.seo.content.exampleText') }}</p>
              </div>
              
              <p class="seo-paragraph">
                {{ $t('calculators.mathCalculators.seo.content.paragraph4') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../../components/Navbar.vue'
import { updateHreflangTags, updateCanonicalTag } from '../../utils/seo.js'
import { supportedLocales } from '../../router/index.js'

export default {
  name: 'MathCalculators',
  components: {
    Navbar
  },
  data() {
    return {
      searchQuery: '',
      calculators: [
        { id: 'addition', titleKey: 'calculators.addition.title', descKey: 'calculators.addition.description', pathKey: 'addition-calculator' },
        { id: 'subtraction', titleKey: 'calculators.subtraction.title', descKey: 'calculators.subtraction.description', pathKey: 'subtraction-calculator' },
        { id: 'multiplication', titleKey: 'calculators.multiplication.title', descKey: 'calculators.multiplication.description', pathKey: 'multiplication-calculator' },
        { id: 'division', titleKey: 'calculators.division.title', descKey: 'calculators.division.description', pathKey: 'division-calculator' },
        { id: 'square', titleKey: 'calculators.square.title', descKey: 'calculators.square.description', pathKey: 'square-calculator' },
        { id: 'cube', titleKey: 'calculators.cube.title', descKey: 'calculators.cube.description', pathKey: 'cube-calculator' },
        { id: 'factorial', titleKey: 'calculators.factorial.title', descKey: 'calculators.factorial.description', pathKey: 'factorial-calculator' },
        { id: 'percentage', titleKey: 'calculators.percentage.title', descKey: 'calculators.percentage.description', pathKey: 'percentage-calculator' },
        { id: 'percentage-change', titleKey: 'calculators.percentageChange.title', descKey: 'calculators.percentageChange.description', pathKey: 'percentage-change-calculator' },
        { id: 'average', titleKey: 'calculators.average.title', descKey: 'calculators.average.description', pathKey: 'average-calculator' },
        { id: 'dividing-fractions', titleKey: 'calculators.dividingFractions.title', descKey: 'calculators.dividingFractions.description', pathKey: 'dividing-fractions' },
        { id: 'simplifying-fractions', titleKey: 'calculators.simplifyingFractions.title', descKey: 'calculators.simplifyingFractions.description', pathKey: 'simplifying-fractions' },
        { id: 'subtracting-fractions', titleKey: 'calculators.subtractingFractions.title', descKey: 'calculators.subtractingFractions.description', pathKey: 'subtracting-fractions' },
        { id: 'multiplying-fractions', titleKey: 'calculators.multiplyingFractions.title', descKey: 'calculators.multiplyingFractions.description', pathKey: 'multiplying-fractions' },
        { id: 'adding-fractions', titleKey: 'calculators.addingFractions.title', descKey: 'calculators.addingFractions.description', pathKey: 'adding-fractions-calculator' },
        { id: 'square-root', titleKey: 'calculators.squareRoot.title', descKey: 'calculators.squareRoot.description', pathKey: 'square-root-calculator' },
        { id: 'cosine', titleKey: 'calculators.cosine.title', descKey: 'calculators.cosine.description', pathKey: 'cosine-calculator' },
        { id: 'sin', titleKey: 'calculators.sin.title', descKey: 'calculators.sin.description', pathKey: 'sin-calculator' },
        { id: 'tan', titleKey: 'calculators.tan.title', descKey: 'calculators.tan.description', pathKey: 'tan-calculator' },
        { id: 'roots', titleKey: 'calculators.roots.title', descKey: 'calculators.roots.description', pathKey: 'roots-calculator' },
        { id: 'polynomial-remainder', titleKey: 'calculators.polynomialRemainder.title', descKey: 'calculators.polynomialRemainder.description', pathKey: 'polynomial-remainder-calculator' },
        { id: 'remainder', titleKey: 'calculators.remainder.title', descKey: 'calculators.remainder.description', pathKey: 'remainder-calculator' },
        { id: 'ratio', titleKey: 'calculators.ratio.title', descKey: 'calculators.ratio.description', pathKey: 'ratio-calculator' },
        { id: 'random-numbers', titleKey: 'calculators.randomNumbers.title', descKey: 'calculators.randomNumbers.description', pathKey: 'random-numbers-generator' },
        { id: 'quadratic-equation', titleKey: 'calculators.quadraticEquation.title', descKey: 'calculators.quadraticEquation.description', pathKey: 'quadratic-equation-calculator' },
        { id: 'pythagorean-theorem', titleKey: 'calculators.pythagoreanTheorem.title', descKey: 'calculators.pythagoreanTheorem.description', pathKey: 'pythagorean-theorem-calculator' },
        { id: 'percentage-increase', titleKey: 'calculators.percentageIncrease.title', descKey: 'calculators.percentageIncrease.description', pathKey: 'percentage-increase-calculator' },
        { id: 'percent-error', titleKey: 'calculators.percentError.title', descKey: 'calculators.percentError.description', pathKey: 'percent-error-calculator' },
        { id: 'natural-logarithm', titleKey: 'calculators.naturalLogarithm.title', descKey: 'calculators.naturalLogarithm.description', pathKey: 'natural-logarithm-calculator' },
        { id: 'log', titleKey: 'calculators.log.title', descKey: 'calculators.log.description', pathKey: 'log-calculator' },
        { id: 'exponent', titleKey: 'calculators.exponent.title', descKey: 'calculators.exponent.description', pathKey: 'exponent-calculator' },
        { id: 'exponential-growth', titleKey: 'calculators.exponentialGrowth.title', descKey: 'calculators.exponentialGrowth.description', pathKey: 'exponential-growth-calculator' },
        { id: 'addition', titleKey: 'calculators.addition.title', descKey: 'calculators.addition.description', pathKey: 'addition-calculator' },
        { id: 'lcm', titleKey: 'calculators.lcm.title', descKey: 'calculators.lcm.description', pathKey: 'lcm-calculator' },
        { id: 'gcf', titleKey: 'calculators.gcf.title', descKey: 'calculators.gcf.description', pathKey: 'gcf-calculator' },
        { id: 'kinetic-energy', titleKey: 'calculators.kineticEnergy.title', descKey: 'calculators.kineticEnergy.description', pathKey: 'kinetic-energy-calculator' },
        { id: 'long-multiplication', titleKey: 'calculators.longMultiplication.title', descKey: 'calculators.longMultiplication.description', pathKey: 'long-multiplication-calculator' },
        { id: 'convolution', titleKey: 'calculators.convolution.title', descKey: 'calculators.convolution.description', pathKey: 'convolution-calculator' },
        { id: 'arctan', titleKey: 'calculators.arctan.title', descKey: 'calculators.arctan.description', pathKey: 'arctan-calculator' },
        { id: 'arcsin', titleKey: 'calculators.arcsin.title', descKey: 'calculators.arcsin.description', pathKey: 'arcsin-calculator' },
        { id: 'arccos', titleKey: 'calculators.arccos.title', descKey: 'calculators.arccos.description', pathKey: 'arccos-calculator' },
        { id: 'antilog', titleKey: 'calculators.antilog.title', descKey: 'calculators.antilog.description', pathKey: 'anti-log-calculator' }
      ]
    }
  },
  computed: {
    filteredCalculators() {
      if (!this.searchQuery.trim()) {
        return this.calculators.map(calc => ({
          id: calc.id,
          title: this.$t(calc.titleKey),
          description: this.$t(calc.descKey),
          path: this.$i18n.locale === 'en' 
            ? `/calculators/${calc.pathKey}` 
            : `/${this.$i18n.locale}/calculators/${calc.pathKey}`
        }))
      }
      
      const query = this.searchQuery.toLowerCase().trim()
      return this.calculators
        .filter(calc => {
          const title = this.$t(calc.titleKey).toLowerCase()
          const description = this.$t(calc.descKey).toLowerCase()
          return title.includes(query) || description.includes(query)
        })
        .map(calc => ({
          id: calc.id,
          title: this.$t(calc.titleKey),
          description: this.$t(calc.descKey),
          path: this.$i18n.locale === 'en' 
            ? `/calculators/${calc.pathKey}` 
            : `/${this.$i18n.locale}/calculators/${calc.pathKey}`
        }))
    }
  },
  mounted() {
    this.updateMetaTags()
    this.updateSEO()
  },
  watch: {
    '$i18n.locale'() {
      this.updateMetaTags()
      this.updateSEO()
    },
    '$route'() {
      this.updateMetaTags()
      this.updateSEO()
    }
  },
  methods: {
    updateMetaTags() {
      const locale = this.$i18n.locale
      
      document.title = this.$t('calculators.mathCalculators.seo.title')
      
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', this.$t('calculators.mathCalculators.seo.description'))
      
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', this.$t('calculators.mathCalculators.seo.keywords'))
      
      document.documentElement.lang = locale
      
      this.updateOpenGraph()
    },
    updateOpenGraph() {
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      ogTitle.setAttribute('content', this.$t('calculators.mathCalculators.seo.title'))
      if (!document.querySelector('meta[property="og:title"]')) {
        document.head.appendChild(ogTitle)
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      ogDescription.setAttribute('content', this.$t('calculators.mathCalculators.seo.description'))
      if (!document.querySelector('meta[property="og:description"]')) {
        document.head.appendChild(ogDescription)
      }

      const baseUrl = window.location.origin
      const ogUrl = document.querySelector('meta[property="og:url"]') || document.createElement('meta')
      ogUrl.setAttribute('property', 'og:url')
      ogUrl.setAttribute('content', baseUrl + this.$route.path)
      if (!document.querySelector('meta[property="og:url"]')) {
        document.head.appendChild(ogUrl)
      }
    },
    updateSEO() {
      updateHreflangTags(this.$route.path, supportedLocales)
      updateCanonicalTag(this.$route.path)
    }
  }
}
</script>

<style scoped>
.calculator-page {
  min-height: 100vh;
  position: relative;
  background: var(--bg-secondary);
}

.page-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-gradient {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%);
  animation: gradientShift 20s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(5%, 5%) rotate(180deg); }
}

.container {
  position: relative;
  z-index: 1;
}

.calculator-header {
  text-align: center;
  padding: 3rem 0 2rem;
  position: relative;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.back-button:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
  transform: translateX(-4px);
  box-shadow: var(--shadow-md);
}

.back-icon {
  width: 20px;
  height: 20px;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.title-badge {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  background: var(--gradient-primary);
  color: white;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.page-title {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1.25rem;
  color: var(--text-primary);
  letter-spacing: -2px;
  line-height: 1.1;
}

.page-description {
  font-size: 1.25rem;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto;
}

.calculators-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 4rem;
}

/* Search Section */
.search-section {
  margin-bottom: 2.5rem;
}

.search-wrapper {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3.5rem;
  font-size: 1rem;
  background: var(--bg-primary);
  border: 2px solid var(--border-light);
  border-radius: 1rem;
  color: var(--text-primary);
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.clear-search {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  z-index: 1;
}

.clear-search:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.clear-search svg {
  width: 18px;
  height: 18px;
}

.search-results-count {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Calculators List */
.calculators-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 4rem;
}

.calculator-list-item {
  position: relative;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 1rem;
  padding: 1.5rem;
  padding-left: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.calculator-list-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 0 4px 4px 0;
  transition: width 0.3s ease;
}

.calculator-list-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
  background: linear-gradient(90deg, var(--bg-primary) 0%, rgba(99, 102, 241, 0.05) 100%);
}

.calculator-list-item:hover::before {
  width: 6px;
  background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
}

.calculator-content {
  flex: 1;
  min-width: 0;
}

.calculator-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.3;
  background: linear-gradient(135deg, var(--text-primary) 0%, rgba(99, 102, 241, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
}

.calculator-list-item:hover .calculator-name {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.calculator-description {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.calculator-list-item:hover .calculator-description {
  color: var(--text-primary);
}

.calculator-arrow {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: rgba(99, 102, 241, 0.08);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.calculator-list-item:hover .calculator-arrow {
  color: white;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.calculator-arrow svg {
  width: 20px;
  height: 20px;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.no-results-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  color: var(--text-secondary);
  opacity: 0.5;
}

.no-results-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.no-results-hint {
  font-size: 1rem;
  color: var(--text-secondary);
}

.seo-content-section {
  margin-top: 4rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.seo-content-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 2rem;
  padding: 3.5rem;
  box-shadow: var(--shadow-xl);
}

.seo-heading {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 2rem;
  letter-spacing: -1px;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.seo-paragraphs {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.seo-paragraph {
  font-size: 1.125rem;
  line-height: 1.9;
  color: var(--text-secondary);
  text-align: justify;
}

.seo-example {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin: 1rem 0;
  border-left: 4px solid var(--primary-color);
}

.example-heading {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.example-text {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 1024px) {
  .calculator-header {
    padding: 2rem 0 1.5rem;
  }

  .page-title {
    font-size: 2.75rem;
  }

  .search-wrapper {
    max-width: 100%;
  }
  
  .calculator-list-item {
    padding: 1.25rem;
    padding-left: 1.75rem;
    gap: 1.25rem;
  }
  
  .calculator-list-item::before {
    width: 3px;
  }
  
  .calculator-list-item:hover::before {
    width: 5px;
  }
  
  .calculator-name {
    font-size: 1.125rem;
  }
  
  .calculator-description {
    font-size: 0.875rem;
  }
  
  .calculator-arrow {
    width: 36px;
    height: 36px;
  }

  .seo-content-card {
    padding: 2.5rem;
  }
}

@media (max-width: 768px) {
  .calculator-header {
    padding: 2rem 0 1.5rem;
  }
  
  .title-badge {
    font-size: 0.75rem;
    padding: 0.4rem 1rem;
  }
  
  .page-title {
    font-size: 2.25rem;
  }
  
  .page-description {
    font-size: 1.0625rem;
  }
  
  .calculator-list-item {
    padding: 1rem;
    padding-left: 1.5rem;
    gap: 1rem;
  }
  
  .calculator-list-item::before {
    width: 3px;
  }
  
  .calculator-list-item:hover::before {
    width: 4px;
  }
  
  .calculator-content {
    flex: 1;
    min-width: 0;
  }
  
  .calculator-name {
    font-size: 1rem;
  }
  
  .calculator-description {
    font-size: 0.8125rem;
    -webkit-line-clamp: 2;
  }
  
  .calculator-arrow {
    width: 32px;
    height: 32px;
  }
  
  .calculator-arrow svg {
    width: 18px;
    height: 18px;
  }
  
  .seo-content-section {
    margin-top: 3rem;
  }
  
  .seo-content-card {
    padding: 2rem 1.5rem;
    border-radius: 1.5rem;
  }
  
  .seo-heading {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }
  
  .seo-paragraph {
    font-size: 1.0625rem;
    text-align: left;
  }
}

@media (max-width: 480px) {
  .calculator-list-item {
    padding: 0.875rem;
    padding-left: 1.25rem;
    gap: 0.875rem;
  }
  
  .calculator-list-item::before {
    width: 3px;
  }
  
  .calculator-list-item:hover::before {
    width: 4px;
  }
  
  .calculator-name {
    font-size: 0.9375rem;
    margin-bottom: 0.375rem;
  }
  
  .calculator-description {
    font-size: 0.75rem;
  }
  
  .calculator-arrow {
    width: 28px;
    height: 28px;
  }
  
  .calculator-arrow svg {
    width: 16px;
    height: 16px;
  }
  
  .search-input {
    padding: 0.875rem 0.875rem 0.875rem 3rem;
    font-size: 0.9375rem;
  }
  
  .search-icon {
    width: 18px;
    height: 18px;
    left: 1rem;
  }
  
  .page-title {
    font-size: 1.875rem;
  }
  
  .seo-content-card {
    padding: 1.5rem 1rem;
  }
  
  .seo-heading {
    font-size: 1.75rem;
  }
  
  .seo-paragraph {
    font-size: 1rem;
  }
}
</style>
