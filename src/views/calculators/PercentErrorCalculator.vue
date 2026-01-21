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
          <div class="title-badge">{{ $t('calculators.percentError.badge') }}</div>
          <h1 class="page-title">{{ $t('calculators.percentError.title') }}</h1>
          <p class="page-description">{{ $t('calculators.percentError.description') }}</p>
        </div>
      </div>

      <div class="calculator-container">
        <div class="calculator-card">
          <!-- Input Section -->
          <div class="input-section">
            <div class="formula-display">
              <div class="formula-box">
                <span class="formula-label">{{ $t('calculators.percentError.formula') }}:</span>
                <span class="formula-text">% Error = |Experimental - Theoretical| / |Theoretical| × 100</span>
              </div>
            </div>

            <div class="inputs-grid">
              <div class="input-group">
                <label class="input-label">
                  {{ $t('calculators.percentError.experimentalValue') }}
                </label>
                <div class="input-wrapper">
                  <input
                    v-model.number="experimentalValue"
                    type="number"
                    class="number-input"
                    :placeholder="$t('calculators.percentError.placeholderExperimental')"
                    @input="validateInput"
                    @keyup.enter="calculate"
                    step="any"
                  />
                </div>
              </div>

              <div class="input-group">
                <label class="input-label">
                  {{ $t('calculators.percentError.theoreticalValue') }}
                </label>
                <div class="input-wrapper">
                  <input
                    v-model.number="theoreticalValue"
                    type="number"
                    class="number-input"
                    :placeholder="$t('calculators.percentError.placeholderTheoretical')"
                    @input="validateInput"
                    @keyup.enter="calculate"
                    step="any"
                  />
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button @click="calculate" class="btn btn-primary" :disabled="!canCalculate">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('calculators.percentError.calculate') }}</span>
              </button>
              <button @click="clear" class="btn btn-secondary">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('calculators.percentError.clear') }}</span>
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
            <div v-if="result" class="result-section">
              <div class="result-header">
                <div class="result-badge">
                  <svg class="result-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ $t('calculators.percentError.result') }}
                </div>
              </div>

              <div class="result-display">
                <!-- Main Result -->
                <div class="main-result">
                  <div class="result-value">
                    {{ formatPercentage(result.percentError) }}
                  </div>
                  <div class="result-label">
                    {{ $t('calculators.percentError.percentError') }}
                  </div>
                </div>

                <!-- Calculation Steps -->
                <div class="calculation-steps">
                  <div class="step-box">
                    <div class="step-title">{{ $t('calculators.percentError.calculation') }}</div>
                    <div class="step-content">
                      <div class="formula-calculation">
                        {{ result.formula }}
                      </div>
                    </div>
                  </div>

                  <div class="step-box">
                    <div class="step-title">{{ $t('calculators.percentError.stepByStep') }}</div>
                    <div class="step-content">
                      <div class="steps-list">
                        <div class="step-item">
                          <span class="step-number">1.</span>
                          <span class="step-text">{{ result.step1 }}</span>
                        </div>
                        <div class="step-item">
                          <span class="step-number">2.</span>
                          <span class="step-text">{{ result.step2 }}</span>
                        </div>
                        <div class="step-item">
                          <span class="step-number">3.</span>
                          <span class="step-text">{{ result.step3 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="step-box">
                    <div class="step-title">{{ $t('calculators.percentError.interpretation') }}</div>
                    <div class="step-content">
                      <p class="interpretation-text">{{ result.interpretation }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- SEO Content Section -->
        <div class="seo-content-section">
          <div class="seo-content-card">
            <h2 class="seo-heading">{{ $t('calculators.percentError.seo.content.heading') }}</h2>
            
            <div class="seo-paragraphs">
              <p class="seo-paragraph">
                {{ $t('calculators.percentError.seo.content.paragraph1') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.percentError.seo.content.paragraph2') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.percentError.seo.content.paragraph3') }}
              </p>
              
              <div class="seo-example">
                <h3 class="example-heading">{{ $t('calculators.percentError.seo.content.exampleHeading') }}</h3>
                <p class="example-text">{{ $t('calculators.percentError.seo.content.exampleText') }}</p>
              </div>
              
              <p class="seo-paragraph">
                {{ $t('calculators.percentError.seo.content.paragraph4') }}
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
  name: 'PercentErrorCalculator',
  components: {
    Navbar
  },
  data() {
    return {
      experimentalValue: null,
      theoreticalValue: null,
      result: null,
      error: ''
    }
  },
  computed: {
    canCalculate() {
      return this.experimentalValue !== null && 
             this.theoreticalValue !== null && 
             !isNaN(this.experimentalValue) && 
             !isNaN(this.theoreticalValue) &&
             this.theoreticalValue !== 0
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
      
      document.title = this.$t('calculators.percentError.seo.title')
      
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', this.$t('calculators.percentError.seo.description'))
      
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', this.$t('calculators.percentError.seo.keywords'))
      
      document.documentElement.lang = locale
      
      // Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      ogTitle.setAttribute('content', this.$t('calculators.percentError.seo.title'))
      if (!document.querySelector('meta[property="og:title"]')) {
        document.head.appendChild(ogTitle)
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      ogDescription.setAttribute('content', this.$t('calculators.percentError.seo.description'))
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
    formatNumber(num) {
      if (Number.isInteger(num)) {
        return num.toString()
      }
      return num.toFixed(4).replace(/\.?0+$/, '')
    },
    formatPercentage(num) {
      return `${num.toFixed(2)}%`
    },
    validateInput() {
      this.error = ''
      
      if (this.theoreticalValue !== null && this.theoreticalValue === 0) {
        this.error = this.$t('calculators.percentError.error.zeroTheoretical')
        this.result = null
        return false
      }
      
      return true
    },
    calculate() {
      this.error = ''
      
      const experimental = Number(this.experimentalValue)
      const theoretical = Number(this.theoreticalValue)
      
      if (isNaN(experimental) || isNaN(theoretical)) {
        this.error = this.$t('calculators.percentError.error.invalidInput')
        this.result = null
        return
      }
      
      if (theoretical === 0) {
        this.error = this.$t('calculators.percentError.error.zeroTheoretical')
        this.result = null
        return
      }
      
      const difference = Math.abs(experimental - theoretical)
      const percentError = (difference / Math.abs(theoretical)) * 100
      
      const formula = `% Error = |${this.formatNumber(experimental)} - ${this.formatNumber(theoretical)}| / |${this.formatNumber(theoretical)}| × 100`
      const step1 = this.$t('calculators.percentError.step1Text', { 
        experimental: this.formatNumber(experimental), 
        theoretical: this.formatNumber(theoretical),
        difference: this.formatNumber(difference)
      })
      const step2 = this.$t('calculators.percentError.step2Text', {
        difference: this.formatNumber(difference),
        theoretical: this.formatNumber(Math.abs(theoretical)),
        ratio: this.formatNumber(difference / Math.abs(theoretical))
      })
      const step3 = this.$t('calculators.percentError.step3Text', {
        ratio: this.formatNumber(difference / Math.abs(theoretical)),
        percentError: this.formatPercentage(percentError)
      })
      
      let interpretation = ''
      if (percentError < 5) {
        interpretation = this.$t('calculators.percentError.interpretationExcellent')
      } else if (percentError < 10) {
        interpretation = this.$t('calculators.percentError.interpretationGood')
      } else if (percentError < 20) {
        interpretation = this.$t('calculators.percentError.interpretationAcceptable')
      } else {
        interpretation = this.$t('calculators.percentError.interpretationPoor')
      }
      
      this.result = {
        percentError,
        formula,
        step1,
        step2,
        step3,
        interpretation
      }
    },
    clear() {
      this.experimentalValue = null
      this.theoreticalValue = null
      this.result = null
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

.formula-display {
  text-align: center;
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%);
  border-radius: 1rem;
  border: 2px solid rgba(99, 102, 241, 0.15);
}

.formula-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.formula-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.formula-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color);
  font-family: 'Courier New', monospace;
}

.inputs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-label {
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
  padding: 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%);
  border-radius: 1.5rem;
  border: 2px solid rgba(99, 102, 241, 0.15);
}

.main-result {
  text-align: center;
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: var(--bg-primary);
  border-radius: 1rem;
}

.result-value {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-family: 'Courier New', monospace;
}

.result-label {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.calculation-steps {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-box {
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: 1rem;
  border-left: 4px solid var(--primary-color);
}

.step-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.step-content {
  color: var(--text-secondary);
}

.formula-calculation {
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.step-number {
  font-weight: 700;
  color: var(--primary-color);
  font-size: 1.125rem;
  min-width: 24px;
}

.step-text {
  flex: 1;
  line-height: 1.6;
}

.interpretation-text {
  line-height: 1.6;
  margin: 0;
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

  .seo-content-card {
    padding: 2.5rem;
  }
}

@media (max-width: 768px) {
  .calculator-header {
    padding: 1.5rem 0 1rem;
  }

  .page-title {
    font-size: 2rem;
    letter-spacing: -1px;
  }

  .page-description {
    font-size: 1rem;
  }

  .title-badge {
    font-size: 0.75rem;
    padding: 0.4rem 1rem;
    margin-bottom: 1rem;
  }
  
  .calculator-card {
    padding: 1.5rem 1rem;
    border-radius: 1.5rem;
  }

  .formula-display {
    padding: 1.5rem 1rem;
    margin-bottom: 1.5rem;
  }

  .formula-text {
    font-size: 0.875rem;
  }
  
  .inputs-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .input-label {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .number-input {
    padding: 1rem 1.25rem;
    font-size: 1.125rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
  
  .btn {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  .result-section {
    margin-top: 2rem;
    padding-top: 2rem;
  }

  .result-badge {
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
  }

  .result-display {
    padding: 1.5rem 1rem;
  }

  .main-result {
    padding: 1.5rem 1rem;
    margin-bottom: 1.5rem;
  }

  .result-value {
    font-size: 2.5rem;
  }

  .result-label {
    font-size: 1.125rem;
  }

  .step-box {
    padding: 1.25rem 1rem;
  }

  .step-title {
    font-size: 1rem;
  }

  .formula-calculation {
    font-size: 0.875rem;
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
  }

  .example-heading {
    font-size: 1.25rem;
  }

  .example-text {
    font-size: 0.9375rem;
  }
}

@media (max-width: 480px) {
  .calculator-header {
    padding: 1rem 0 0.75rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .page-description {
    font-size: 0.9375rem;
  }

  .calculator-card {
    padding: 1.25rem 0.875rem;
  }

  .formula-display {
    padding: 1.25rem 0.875rem;
  }

  .formula-text {
    font-size: 0.8125rem;
  }

  .number-input {
    padding: 0.875rem 1rem;
    font-size: 1rem;
  }

  .btn {
    padding: 0.875rem 1.5rem;
    font-size: 0.9375rem;
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
