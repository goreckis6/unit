<template>
  <div class="calculator-page">
    <Navbar />
    
    <div class="page-background">
      <div class="bg-gradient"></div>
    </div>

    <div class="container">
      <div class="calculator-header">
        <router-link :to="$i18n.locale === 'en' ? '/calculators/math-calculators' : `/${$i18n.locale}/calculators/math-calculators`" class="back-button">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ $t('common.back') }}</span>
        </router-link>
        <div class="header-content">
          <div class="title-badge">{{ $t('calculators.exponentialGrowth.badge') }}</div>
          <h1 class="page-title">{{ $t('calculators.exponentialGrowth.title') }}</h1>
          <p class="page-description">{{ $t('calculators.exponentialGrowth.description') }}</p>
        </div>
      </div>

      <div class="calculator-container">
        <div class="calculator-card">
          <!-- Input Section -->
          <div class="input-section">
            <div class="inputs-grid">
              <!-- Initial Value -->
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.exponentialGrowth.initialValue') }}</label>
                <input
                  v-model.number="initialValue"
                  type="number"
                  class="number-input"
                  :placeholder="$t('calculators.exponentialGrowth.enterInitialValue')"
                  @keyup.enter="calculate"
                  step="any"
                />
              </div>

              <!-- Growth Rate -->
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.exponentialGrowth.growthRate') }}</label>
                <div class="input-with-unit">
                  <input
                    v-model.number="growthRate"
                    type="number"
                    class="number-input"
                    :placeholder="$t('calculators.exponentialGrowth.enterGrowthRate')"
                    @keyup.enter="calculate"
                    step="any"
                  />
                  <span class="unit-display">%</span>
                </div>
              </div>

              <!-- Time Period -->
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.exponentialGrowth.timePeriod') }}</label>
                <input
                  v-model.number="timePeriod"
                  type="number"
                  class="number-input"
                  :placeholder="$t('calculators.exponentialGrowth.enterTimePeriod')"
                  @keyup.enter="calculate"
                  step="any"
                />
              </div>
            </div>

            <!-- Error Message -->
            <transition name="fade">
              <div v-if="error" class="error-message">
                <svg class="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ error }}</span>
              </div>
            </transition>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button @click="calculate" class="btn btn-primary" :disabled="!canCalculate">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('common.calculate') }}</span>
              </button>
              <button @click="clear" class="btn btn-secondary">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('common.clear') }}</span>
              </button>
            </div>
          </div>

          <!-- Result Section -->
          <transition name="slide-up">
            <div v-if="result !== null && !error" class="result-section">
              <div class="result-header">
                <div class="result-badge">
                  <svg class="result-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ $t('calculators.exponentialGrowth.result') }}
                </div>
              </div>

              <div class="result-display">
                <div class="result-item">
                  <span class="result-label">{{ $t('calculators.exponentialGrowth.finalValue') }}</span>
                  <div class="result-value-box">
                    <span class="result-value">{{ formatResult(result) }}</span>
                  </div>
                </div>
                
                <!-- Formula Display -->
                <div class="formula-display">
                  <div class="formula-text">
                    <span class="formula-label">{{ $t('calculators.exponentialGrowth.formula') }}:</span>
                    <span class="formula-expression">A = P(1 + r/100)^t</span>
                  </div>
                  <div class="formula-calculation">
                    <span>A = {{ formatNumber(initialValue) }}(1 + {{ formatNumber(growthRate) }}/100)^{{ formatNumber(timePeriod) }}</span>
                    <span>= {{ formatResult(result) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- SEO Content Section -->
        <div class="seo-content-section">
          <div class="seo-content-card">
            <h2 class="seo-heading">{{ $t('calculators.exponentialGrowth.seo.content.heading') }}</h2>
            
            <div class="seo-paragraphs">
              <p class="seo-paragraph">
                {{ $t('calculators.exponentialGrowth.seo.content.paragraph1') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.exponentialGrowth.seo.content.paragraph2') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.exponentialGrowth.seo.content.paragraph3') }}
              </p>
              
              <div class="seo-example">
                <h3 class="example-heading">{{ $t('calculators.exponentialGrowth.seo.content.exampleHeading') }}</h3>
                <p class="example-text">{{ $t('calculators.exponentialGrowth.seo.content.exampleText') }}</p>
              </div>
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
  name: 'ExponentialGrowthCalculator',
  components: {
    Navbar
  },
  data() {
    return {
      initialValue: null,
      growthRate: null,
      timePeriod: null,
      result: null,
      error: null
    }
  },
  computed: {
    canCalculate() {
      return this.initialValue !== null && this.initialValue !== '' &&
             this.growthRate !== null && this.growthRate !== '' &&
             this.timePeriod !== null && this.timePeriod !== ''
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
    calculate() {
      this.error = null
      this.result = null
      
      if (!this.canCalculate) {
        return
      }
      
      const P = parseFloat(this.initialValue)
      const r = parseFloat(this.growthRate)
      const t = parseFloat(this.timePeriod)
      
      // Check for invalid input
      if (isNaN(P) || isNaN(r) || isNaN(t)) {
        this.error = this.$t('calculators.exponentialGrowth.error.invalidInput')
        return
      }
      
      // Check for negative initial value
      if (P < 0) {
        this.error = this.$t('calculators.exponentialGrowth.error.negativeInitial')
        return
      }
      
      // Check for negative time period
      if (t < 0) {
        this.error = this.$t('calculators.exponentialGrowth.error.negativeTime')
        return
      }
      
      try {
        // Calculate A = P(1 + r/100)^t
        const rateDecimal = r / 100
        const calculated = P * Math.pow(1 + rateDecimal, t)
        
        // Check for invalid result (Infinity or NaN)
        if (!isFinite(calculated)) {
          this.error = this.$t('calculators.exponentialGrowth.error.invalidResult')
          return
        }
        
        this.result = calculated
      } catch (e) {
        this.error = this.$t('calculators.exponentialGrowth.error.calculationError')
      }
    },
    clear() {
      this.initialValue = null
      this.growthRate = null
      this.timePeriod = null
      this.result = null
      this.error = null
    },
    formatNumber(value) {
      if (value === null || value === undefined || value === '') return '0'
      const num = parseFloat(value) || 0
      if (Math.abs(num) >= 1000) {
        return num.toLocaleString('en-US', { maximumFractionDigits: 10 })
      }
      return num.toString()
    },
    formatResult(value) {
      if (value === null || value === undefined) return '0'
      if (!isFinite(value)) return '∞'
      if (Math.abs(value) >= 1000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) {
        return value.toExponential(6)
      }
      if (Math.abs(value) >= 1000) {
        return value.toLocaleString('en-US', { maximumFractionDigits: 10 })
      }
      return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
    },
    updateMetaTags() {
      const locale = this.$i18n.locale
      
      document.title = this.$t('calculators.exponentialGrowth.seo.title')
      
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', this.$t('calculators.exponentialGrowth.seo.description'))
      
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', this.$t('calculators.exponentialGrowth.seo.keywords'))
      
      document.documentElement.lang = locale
      
      this.updateOpenGraph()
    },
    updateOpenGraph() {
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      ogTitle.setAttribute('content', this.$t('calculators.exponentialGrowth.seo.title'))
      if (!document.querySelector('meta[property="og:title"]')) {
        document.head.appendChild(ogTitle)
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      ogDescription.setAttribute('content', this.$t('calculators.exponentialGrowth.seo.description'))
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
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
  text-decoration: none;
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

.unit-display {
  padding: 0.875rem 1.25rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-left: none;
  border-radius: 0 0.875rem 0.875rem 0;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1rem;
  min-width: 50px;
  text-align: center;
  flex-shrink: 0;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.875rem;
  color: #ef4444;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  justify-content: center;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
  font-size: 1.125rem;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.result-icon {
  width: 24px;
  height: 24px;
}

.result-display {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%);
  border-radius: 1.5rem;
  border: 2px solid rgba(99, 102, 241, 0.15);
}

.result-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.result-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.result-value-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.result-value {
  font-size: 3rem;
  font-weight: 900;
  color: var(--primary-color);
  letter-spacing: -1px;
  line-height: 1.2;
}

.formula-display {
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: 1rem;
  border: 2px solid rgba(99, 102, 241, 0.1);
}

.formula-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.formula-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.formula-expression {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
}

.formula-calculation {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 1rem;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

.seo-content-section {
  margin-top: 4rem;
  max-width: 1100px;
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

  .seo-content-card {
    padding: 2.5rem;
  }
}

@media (max-width: 768px) {
  .calculator-header {
    padding: 1.5rem 0 1rem;
  }

  .title-badge {
    font-size: 0.75rem;
    padding: 0.4rem 1rem;
  }

  .page-title {
    font-size: 2rem;
    letter-spacing: -1px;
  }

  .page-description {
    font-size: 1rem;
  }

  .calculator-card {
    padding: 1.5rem 1rem;
    border-radius: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  .result-value {
    font-size: 2.25rem;
  }

  .formula-expression {
    font-size: 1rem;
  }

  .seo-content-section {
    margin-top: 3rem;
  }

  .seo-content-card {
    padding: 2rem 1.5rem;
    border-radius: 1.5rem;
  }

  .seo-heading {
    font-size: 1.75rem;
  }

  .seo-paragraph {
    font-size: 1rem;
    text-align: left;
  }

  .example-heading {
    font-size: 1.25rem;
  }

  .example-text {
    font-size: 0.9375rem;
  }
}

@media (max-width: 480px) {
  .calculator-card {
    padding: 1.25rem 0.875rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .result-value {
    font-size: 2rem;
  }

  .seo-content-card {
    padding: 1.5rem 1rem;
  }

  .seo-heading {
    font-size: 1.5rem;
  }
}
</style>

