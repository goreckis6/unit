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
          <div class="title-badge">{{ $t('calculators.antilog.badge') }}</div>
          <h1 class="page-title">{{ $t('calculators.antilog.title') }}</h1>
          <p class="page-description">{{ $t('calculators.antilog.description') }}</p>
        </div>
      </div>

      <div class="calculator-container">
        <div class="calculator-card">
          <!-- Input Section -->
          <div class="input-section">
            <div class="input-card">
              <label class="input-label">{{ $t('calculators.antilog.inputLabel') }}</label>
              <div class="input-wrapper">
                <div class="input-prefix">antilog</div>
                <sub class="base-indicator">{{ base === 'e' ? 'e' : '10' }}</sub>
                <span class="input-prefix-cont">(</span>
                <input
                  v-model.number="inputValue"
                  type="number"
                  class="number-input"
                  :placeholder="$t('calculators.antilog.placeholder')"
                  @input="validateInput"
                  @keyup.enter="calculate"
                  step="any"
                />
                <span class="input-suffix">)</span>
              </div>
              <div class="base-selector">
                <button 
                  @click="base = '10'"
                  class="base-button"
                  :class="{ active: base === '10' }"
                >
                  {{ $t('calculators.antilog.base10') }}
                </button>
                <button 
                  @click="base = 'e'"
                  class="base-button"
                  :class="{ active: base === 'e' }"
                >
                  {{ $t('calculators.antilog.baseE') }}
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button @click="calculate" class="btn btn-primary" :disabled="!canCalculate">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('calculators.antilog.calculate') }}</span>
              </button>
              <button @click="clear" class="btn btn-secondary">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('calculators.antilog.clear') }}</span>
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
            <div v-if="result !== null" class="result-section">
              <div class="result-header">
                <div class="result-badge">
                  <svg class="result-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ $t('calculators.antilog.result') }}
                </div>
              </div>

              <div class="result-display">
                <div class="antilog-result">
                  <div class="result-formula">
                    <span class="formula-text">
                      antilog<sub class="base-sub">{{ base === 'e' ? 'e' : '10' }}</sub>({{ inputValue }})
                    </span>
                    <span class="equals-sign">=</span>
                  </div>
                  <div class="result-value-box">
                    <span class="result-value">{{ formatResult(result) }}</span>
                  </div>
                </div>
                <div v-if="result !== null" class="result-exact">
                  <span class="exact-label">{{ $t('calculators.antilog.approximate') }}:</span>
                  <span class="exact-value">{{ result.toFixed(10) }}</span>
                </div>
              </div>

              <!-- Additional Info -->
              <div v-if="result !== null" class="info-section">
                <div class="info-card">
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.antilog.inputValue') }}:</span>
                    <span class="info-value">{{ inputValue }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.antilog.base') }}:</span>
                    <span class="info-value">{{ base === 'e' ? 'e (≈ 2.71828)' : '10' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.antilog.resultNumber') }}:</span>
                    <span class="info-value">{{ formatResult(result) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.antilog.formula') }}:</span>
                    <span class="info-value">{{ base === 'e' ? `e^${inputValue}` : `10^${inputValue}` }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- SEO Content Section -->
        <div class="seo-content-section">
          <div class="seo-content-card">
            <h2 class="seo-heading">{{ $t('calculators.antilog.seo.content.heading') }}</h2>
            
            <div class="seo-paragraphs">
              <p class="seo-paragraph">
                {{ $t('calculators.antilog.seo.content.paragraph1') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.antilog.seo.content.paragraph2') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.antilog.seo.content.paragraph3') }}
              </p>
              
              <div class="seo-example">
                <h3 class="example-heading">{{ $t('calculators.antilog.seo.content.exampleHeading') }}</h3>
                <p class="example-text">{{ $t('calculators.antilog.seo.content.exampleText') }}</p>
              </div>
              
              <p class="seo-paragraph">
                {{ $t('calculators.antilog.seo.content.paragraph4') }}
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
  name: 'AntilogCalculator',
  components: {
    Navbar
  },
  data() {
    return {
      inputValue: null,
      base: '10',
      result: null,
      error: ''
    }
  },
  computed: {
    canCalculate() {
      return this.inputValue !== null && this.inputValue !== ''
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
      
      document.title = this.$t('calculators.antilog.seo.title')
      
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', this.$t('calculators.antilog.seo.description'))
      
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', this.$t('calculators.antilog.seo.keywords'))
      
      document.documentElement.lang = locale
      
      this.updateOpenGraph()
    },
    updateOpenGraph() {
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      ogTitle.setAttribute('content', this.$t('calculators.antilog.seo.title'))
      if (!document.querySelector('meta[property="og:title"]')) {
        document.head.appendChild(ogTitle)
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      ogDescription.setAttribute('content', this.$t('calculators.antilog.seo.description'))
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
    },
    validateInput() {
      this.error = ''
    },
    calculate() {
      this.error = ''
      
      if (this.inputValue === null || this.inputValue === '') {
        this.error = this.$t('calculators.antilog.error.invalidInput')
        return
      }

      // Calculate antilog
      if (this.base === 'e') {
        // Natural antilog: e^x
        this.result = Math.exp(this.inputValue)
      } else {
        // Common antilog (base 10): 10^x
        this.result = Math.pow(10, this.inputValue)
      }
    },
    clear() {
      this.inputValue = null
      this.result = null
      this.error = ''
    },
    formatResult(value) {
      // Round to 10 decimal places and remove trailing zeros
      return parseFloat(value.toFixed(10)).toString()
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
  max-width: 1100px;
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

.input-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
  border: 2px solid var(--border-light);
  border-radius: 1.5rem;
  padding: 2.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.input-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
}

.input-label {
  display: block;
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.input-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.input-prefix {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.input-prefix-cont {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.base-indicator {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
  vertical-align: sub;
}

.input-suffix {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.number-input {
  width: 100%;
  max-width: 250px;
  padding: 1.5rem 2rem;
  border: 2px solid var(--border-color);
  border-radius: 1rem;
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  transition: all 0.3s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.number-input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  transform: scale(1.02);
}

.number-input::placeholder {
  color: var(--text-tertiary);
  opacity: 0.4;
}

.base-selector {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.base-button {
  padding: 0.875rem 2rem;
  border: 2px solid var(--border-color);
  border-radius: 0.875rem;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.base-button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-2px);
}

.base-button.active {
  background: var(--gradient-primary);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
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

.slide-down-leave-to {
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

.slide-up-leave-to {
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
  font-weight: 800;
  font-size: 1.125rem;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.result-icon {
  width: 24px;
  height: 24px;
}

.result-display {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  border-radius: 1.5rem;
  padding: 3rem;
  margin-bottom: 2rem;
  border: 2px solid var(--border-light);
}

.antilog-result {
  text-align: center;
  margin-bottom: 2rem;
}

.result-formula {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.formula-text {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.base-sub {
  font-size: 1.25rem;
  vertical-align: sub;
}

.equals-sign {
  font-size: 3rem;
  font-weight: 300;
  color: var(--text-secondary);
}

.result-value-box {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.result-value {
  font-size: 4rem;
  font-weight: 900;
  color: var(--primary-color);
  line-height: 1;
}

.result-exact {
  text-align: center;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  margin-top: 1rem;
}

.exact-label {
  font-weight: 600;
  color: var(--text-secondary);
  margin-right: 0.5rem;
}

.exact-value {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.125rem;
}

.info-section {
  margin-top: 2rem;
}

.info-card {
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid var(--border-light);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-light);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 1rem;
}

.info-value {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.125rem;
}

.seo-content-section {
  margin-top: 4rem;
}

.seo-content-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 2rem;
  padding: 3rem;
  box-shadow: var(--shadow-xl);
}

.seo-heading {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.seo-paragraphs {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.seo-paragraph {
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--text-secondary);
}

.seo-example {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  border-left: 4px solid var(--primary-color);
  border-radius: 1rem;
  padding: 2rem;
  margin: 2rem 0;
}

.example-heading {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.example-text {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--text-secondary);
}

/* Tablet Styles */
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

  .seo-content-card {
    padding: 2.5rem;
  }
}

/* Mobile Styles */
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
  
  .calculator-card {
    padding: 2rem 1.5rem;
    border-radius: 1.5rem;
  }
  
  .input-card {
    padding: 2rem 1.5rem;
  }
  
  .input-prefix,
  .input-prefix-cont,
  .input-suffix {
    font-size: 2rem;
  }
  
  .base-indicator {
    font-size: 1.25rem;
  }
  
  .number-input {
    font-size: 1.75rem;
    padding: 1.25rem 1.5rem;
  }
  
  .base-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;
  }
  
  .btn {
    padding: 1rem 2rem;
    font-size: 1rem;
    min-width: 140px;
  }
  
  .result-display {
    padding: 2rem 1.5rem;
  }
  
  .formula-text {
    font-size: 2rem;
  }
  
  .equals-sign {
    font-size: 2.5rem;
  }
  
  .result-value {
    font-size: 3rem;
  }
  
  .info-card {
    padding: 1.5rem;
  }
  
  .seo-content-card {
    padding: 2rem 1.5rem;
    border-radius: 1.5rem;
  }
  
  .seo-heading {
    font-size: 2rem;
  }
  
  .seo-paragraph {
    font-size: 1rem;
  }
  
  .seo-example {
    padding: 1.5rem;
  }
  
  .example-heading {
    font-size: 1.25rem;
  }
  
  .example-text {
    font-size: 1rem;
  }
}

/* Small Mobile Styles */
@media (max-width: 480px) {
  .page-title {
    font-size: 1.875rem;
  }
  
  .input-wrapper {
    flex-wrap: wrap;
  }
  
  .input-prefix,
  .input-prefix-cont,
  .input-suffix {
    font-size: 1.75rem;
  }
  
  .base-indicator {
    font-size: 1rem;
  }
  
  .number-input {
    max-width: 100%;
    font-size: 1.5rem;
  }
  
  .formula-text {
    font-size: 1.75rem;
  }
  
  .result-value {
    font-size: 2.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>




