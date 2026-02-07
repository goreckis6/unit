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
          <div class="title-badge">{{ $t('calculators.randomNumbers.badge') }}</div>
          <h1 class="page-title">{{ $t('calculators.randomNumbers.title') }}</h1>
          <p class="page-description">{{ $t('calculators.randomNumbers.description') }}</p>
        </div>
      </div>

      <div class="calculator-container">
        <div class="calculator-card">
          <!-- Input Section -->
          <div class="input-section">
            <div class="input-grid">
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.randomNumbers.minValue') }}</label>
                <div class="input-wrapper">
                  <input
                    v-model.number="minValue"
                    type="number"
                    class="number-input"
                    :placeholder="$t('calculators.randomNumbers.placeholderMin')"
                    @input="validateInput"
                    @keyup.enter="generate"
                    step="any"
                  />
                </div>
              </div>
              
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.randomNumbers.maxValue') }}</label>
                <div class="input-wrapper">
                  <input
                    v-model.number="maxValue"
                    type="number"
                    class="number-input"
                    :placeholder="$t('calculators.randomNumbers.placeholderMax')"
                    @input="validateInput"
                    @keyup.enter="generate"
                    step="any"
                  />
                </div>
              </div>
              
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.randomNumbers.quantity') }}</label>
                <div class="input-wrapper">
                  <input
                    v-model.number="quantity"
                    type="number"
                    class="number-input"
                    :placeholder="$t('calculators.randomNumbers.placeholderQuantity')"
                    @input="validateInput"
                    @keyup.enter="generate"
                    min="1"
                    max="1000"
                  />
                </div>
              </div>
            </div>

            <div class="options-section">
              <div class="option-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="allowDuplicates"
                    class="checkbox-input"
                  />
                  <span>{{ $t('calculators.randomNumbers.allowDuplicates') }}</span>
                </label>
              </div>
              
              <div class="option-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="useDecimals"
                    class="checkbox-input"
                  />
                  <span>{{ $t('calculators.randomNumbers.useDecimals') }}</span>
                </label>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button @click="generate" class="btn btn-primary" :disabled="!canGenerate">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('calculators.randomNumbers.generate') }}</span>
              </button>
              <button @click="clear" class="btn btn-secondary">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('calculators.randomNumbers.clear') }}</span>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <transition name="slide-down">
            <div v-if="error" class="error-message">
              <svg class="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>{{ error }}</span>
            </div>
          </transition>

          <!-- Result Section -->
          <transition name="slide-up">
            <div v-if="results.length > 0" class="result-section">
              <div class="result-header">
                <div class="result-badge">
                  <svg class="result-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ $t('calculators.randomNumbers.result') }} ({{ results.length }})
                </div>
              </div>

              <div class="result-display">
                <div class="numbers-grid">
                  <div
                    v-for="(number, index) in results"
                    :key="index"
                    class="number-badge"
                  >
                    {{ formatNumber(number) }}
                  </div>
                </div>
                
                <div class="result-actions">
                  <button @click="copyToClipboard" class="btn-copy">
                    <svg class="btn-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5.00005C7.01165 5.00005 6.49359 5.00005 6.09202 5.21799C5.71569 5.40973 5.40973 5.71569 5.21799 6.09202C5 6.49359 5 7.01165 5 8.00005V16C5 16.9884 5 17.5065 5.21799 17.908C5.40973 18.2843 5.71569 18.5903 6.09202 18.782C6.49359 19 7.01165 19 8 19H16C16.9884 19 17.5065 19 17.908 18.782C18.2843 18.5903 18.5903 18.2843 18.782 17.908C19 17.5065 19 16.9884 19 16V8.00005C19 7.01165 19 6.49359 18.782 6.09202C18.5903 5.71569 18.2843 5.40973 17.908 5.21799C17.5065 5.00005 16.9884 5.00005 16 5.00005H8Z" stroke="currentColor" stroke-width="2"/>
                      <path d="M8 5.00005C8 3.89549 8.89543 3 10 3H14C15.1046 3 16 3.89549 16 5.00005" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    {{ $t('calculators.randomNumbers.copy') }}
                  </button>
                  <button @click="generate" class="btn-regenerate">
                    <svg class="btn-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4V10H7M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M20.49 9C19.9833 6.04833 18.6834 3.27841 16.7351 1.02011C14.7869 -1.23819 12.276 -2.93811 9.5 -3.82011C6.72402 -4.70211 3.78744 -4.73634 0.999999 -3.91811M3.51 15C4.01675 17.9517 5.31658 20.7216 7.26488 22.9799C9.21318 25.2382 11.724 26.9381 14.5 27.8201C17.276 28.7021 20.2126 28.7363 23 27.9181" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {{ $t('calculators.randomNumbers.regenerate') }}
                  </button>
                </div>
              </div>

              <!-- Statistics -->
              <div v-if="results.length > 1" class="statistics-section">
                <div class="statistics-grid">
                  <div class="stat-item">
                    <span class="stat-label">{{ $t('calculators.randomNumbers.statMin') }}</span>
                    <span class="stat-value">{{ formatNumber(stats.min) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">{{ $t('calculators.randomNumbers.statMax') }}</span>
                    <span class="stat-value">{{ formatNumber(stats.max) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">{{ $t('calculators.randomNumbers.statAverage') }}</span>
                    <span class="stat-value">{{ formatNumber(stats.average) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">{{ $t('calculators.randomNumbers.statSum') }}</span>
                    <span class="stat-value">{{ formatNumber(stats.sum) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- SEO Content Section -->
        <div class="seo-content-section">
          <div class="seo-content-card">
            <h2 class="seo-heading">{{ $t('calculators.randomNumbers.seo.content.heading') }}</h2>
            
            <div class="seo-paragraphs">
              <p class="seo-paragraph">
                {{ $t('calculators.randomNumbers.seo.content.paragraph1') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.randomNumbers.seo.content.paragraph2') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.randomNumbers.seo.content.paragraph3') }}
              </p>
              
              <div class="seo-example">
                <h3 class="example-heading">{{ $t('calculators.randomNumbers.seo.content.exampleHeading') }}</h3>
                <p class="example-text">{{ $t('calculators.randomNumbers.seo.content.exampleText') }}</p>
              </div>
              
              <p class="seo-paragraph">
                {{ $t('calculators.randomNumbers.seo.content.paragraph4') }}
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
  name: 'RandomNumbersGenerator',
  components: {
    Navbar
  },
  data() {
    return {
      minValue: 1,
      maxValue: 100,
      quantity: 1,
      allowDuplicates: true,
      useDecimals: false,
      results: [],
      error: ''
    }
  },
  computed: {
    canGenerate() {
      return this.minValue !== null && !isNaN(this.minValue) &&
             this.maxValue !== null && !isNaN(this.maxValue) &&
             this.quantity > 0 && this.quantity <= 1000 &&
             this.maxValue > this.minValue
    },
    stats() {
      if (this.results.length === 0) {
        return { min: 0, max: 0, average: 0, sum: 0 }
      }
      const numbers = this.results
      return {
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        average: numbers.reduce((a, b) => a + b, 0) / numbers.length,
        sum: numbers.reduce((a, b) => a + b, 0)
      }
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
      const currentPath = this.$route.path
      
      document.title = this.$t('calculators.randomNumbers.seo.title')
      
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', this.$t('calculators.randomNumbers.seo.description'))
      
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', this.$t('calculators.randomNumbers.seo.keywords'))
      
      document.documentElement.lang = locale
      
      // Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      ogTitle.setAttribute('content', this.$t('calculators.randomNumbers.seo.title'))
      if (!document.querySelector('meta[property="og:title"]')) {
        document.head.appendChild(ogTitle)
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      ogDescription.setAttribute('content', this.$t('calculators.randomNumbers.seo.description'))
      if (!document.querySelector('meta[property="og:description"]')) {
        document.head.appendChild(ogDescription)
      }

      const baseUrl = window.location.origin
      const ogUrl = document.querySelector('meta[property="og:url"]') || document.createElement('meta')
      ogUrl.setAttribute('property', 'og:url')
      ogUrl.setAttribute('content', baseUrl + currentPath)
      if (!document.querySelector('meta[property="og:url"]')) {
        document.head.appendChild(ogUrl)
      }
      
      updateHreflangTags(currentPath, supportedLocales)
      updateCanonicalTag(currentPath)
    },
    updateSEO() {
      this.updateMetaTags()
    },
    validateInput() {
      this.error = ''
      
      if (this.minValue === null || isNaN(this.minValue)) {
        return false
      }
      
      if (this.maxValue === null || isNaN(this.maxValue)) {
        return false
      }
      
      if (this.maxValue <= this.minValue) {
        this.error = this.$t('calculators.randomNumbers.error.maxLessThanMin')
        return false
      }
      
      if (this.quantity < 1 || this.quantity > 1000) {
        this.error = this.$t('calculators.randomNumbers.error.invalidQuantity')
        return false
      }
      
      if (!this.allowDuplicates && this.quantity > (this.maxValue - this.minValue + 1)) {
        if (!this.useDecimals) {
          const range = Math.floor(this.maxValue) - Math.floor(this.minValue) + 1
          if (this.quantity > range) {
            this.error = this.$t('calculators.randomNumbers.error.notEnoughNumbers')
            return false
          }
        }
      }
      
      return true
    },
    generate() {
      if (!this.validateInput()) {
        if (!this.error) {
          this.error = this.$t('calculators.randomNumbers.error.invalidInput')
        }
        return
      }

      const min = Number(this.minValue)
      const max = Number(this.maxValue)
      const qty = Number(this.quantity)
      
      if (isNaN(min) || isNaN(max) || isNaN(qty)) {
        this.error = this.$t('calculators.randomNumbers.error.invalidInput')
        this.results = []
        return
      }

      if (max <= min) {
        this.error = this.$t('calculators.randomNumbers.error.maxLessThanMin')
        this.results = []
        return
      }

      const generated = []
      const used = new Set()

      for (let i = 0; i < qty; i++) {
        let random
        
        if (this.useDecimals) {
          random = Math.random() * (max - min) + min
          random = parseFloat(random.toFixed(6))
        } else {
          const minInt = Math.ceil(min)
          const maxInt = Math.floor(max)
          
          if (!this.allowDuplicates && (maxInt - minInt + 1) < qty) {
            this.error = this.$t('calculators.randomNumbers.error.notEnoughNumbers')
            this.results = []
            return
          }
          
          do {
            random = Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt
          } while (!this.allowDuplicates && used.has(random) && used.size < (maxInt - minInt + 1))
          
          used.add(random)
        }
        
        generated.push(random)
      }
      
      this.results = generated
      this.error = ''
    },
    formatNumber(num) {
      if (this.useDecimals) {
        return parseFloat(num.toFixed(6)).toString()
      }
      return Math.floor(num).toString()
    },
    copyToClipboard() {
      const text = this.results.map(n => this.formatNumber(n)).join(', ')
      navigator.clipboard.writeText(text).then(() => {
        // Could show a toast notification here
      }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea')
        textarea.value = text
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      })
    },
    clear() {
      this.minValue = 1
      this.maxValue = 100
      this.quantity = 1
      this.allowDuplicates = true
      this.useDecimals = false
      this.results = []
      this.error = ''
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

.calculator-container {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 4rem;
}

.calculator-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 2rem;
  padding: 3rem;
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(10px);
}

.input-section {
  margin-bottom: 2rem;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.input-card {
  flex: 1;
}

.input-label {
  display: block;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
}

.input-wrapper {
  position: relative;
}

.number-input {
  width: 100%;
  padding: 1.25rem 1.5rem;
  border: 2px solid var(--border-color);
  border-radius: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.number-input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.options-section {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.option-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--primary-color);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.125rem 2.5rem;
  border-radius: 0.875rem;
  font-size: 1.0625rem;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  font-family: inherit;
  min-width: 160px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 22px;
  height: 22px;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.5);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: var(--error-color);
  padding: 1.5rem;
  border-radius: 1rem;
  font-weight: 600;
  margin-bottom: 2rem;
  border: 2px solid rgba(239, 68, 68, 0.2);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

.error-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.result-section {
  margin-top: 3rem;
  padding-top: 3rem;
  border-top: 2px solid var(--border-light);
}

.result-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 2rem;
  background: var(--gradient-primary);
  color: white;
  border-radius: 2rem;
  font-size: 1.125rem;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.result-icon {
  width: 24px;
  height: 24px;
}

.result-display {
  margin-bottom: 3rem;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%);
  border-radius: 1.5rem;
  border: 2px solid rgba(99, 102, 241, 0.15);
}

.numbers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
}

.number-badge {
  padding: 1rem;
  background: var(--bg-primary);
  border: 2px solid var(--primary-color);
  border-radius: 0.75rem;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
  font-family: 'Courier New', monospace;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
  transition: all 0.2s ease;
}

.number-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.result-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-copy,
.btn-regenerate {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
}

.btn-copy:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-2px);
}

.btn-regenerate:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-2px);
}

.btn-icon-small {
  width: 18px;
  height: 18px;
}

.statistics-section {
  margin-top: 2rem;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  border: 1px solid var(--border-light);
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  font-family: 'Courier New', monospace;
}

/* SEO Content Section */
.seo-content-section {
  margin-top: 4rem;
  max-width: 900px;
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
  margin: 2rem 0;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%);
  border-radius: 1rem;
  border-left: 4px solid var(--primary-color);
}

.example-heading {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  letter-spacing: -0.3px;
}

.example-text {
  font-size: 1.0625rem;
  line-height: 1.8;
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

  .calculator-card {
    padding: 2.5rem 2rem;
  }
}

@media (max-width: 768px) {
  .calculator-header {
    padding: 2rem 0 1.5rem;
  }
  
  .page-title {
    font-size: 2.25rem;
  }
  
  .page-description {
    font-size: 1.0625rem;
  }
  
  .calculator-card {
    padding: 2rem 1.5rem;
  }
  
  .input-grid {
    grid-template-columns: 1fr;
  }

  .numbers-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }

  .statistics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .calculator-header {
    padding: 1.5rem 0 1.25rem;
  }
  
  .page-title {
    font-size: 1.875rem;
  }
  
  .page-description {
    font-size: 1rem;
  }
  
  .calculator-card {
    padding: 1.5rem 1rem;
  }
}
</style>
