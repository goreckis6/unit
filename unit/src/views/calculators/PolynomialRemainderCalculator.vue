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
          <div class="title-badge">{{ $t('calculators.polynomialRemainder.badge') }}</div>
          <h1 class="page-title">{{ $t('calculators.polynomialRemainder.title') }}</h1>
          <p class="page-description">{{ $t('calculators.polynomialRemainder.description') }}</p>
        </div>
      </div>

      <div class="calculator-container">
        <div class="calculator-card">
          <!-- Input Section -->
          <div class="input-section">
            <!-- Dividend Polynomial -->
            <div class="polynomial-input-card">
              <div class="polynomial-header">
                <div class="polynomial-badge">1</div>
                <label class="polynomial-label">{{ $t('calculators.polynomialRemainder.dividend') }}</label>
              </div>
              <div class="polynomial-inputs">
                <div class="coefficient-group" v-for="(coef, index) in dividend" :key="index">
                  <input
                    v-model.number="dividend[index]"
                    type="number"
                    class="coefficient-input"
                    :placeholder="index === dividend.length - 1 ? 'a₀' : `a${dividend.length - 1 - index}`"
                    step="any"
                  />
                  <span class="variable-part">
                    x<sup>{{ dividend.length - 1 - index }}</sup>
                  </span>
                </div>
              </div>
              <button @click="addDividendTerm" class="add-term-btn">+ {{ $t('calculators.polynomialRemainder.addTerm') }}</button>
              <button @click="removeDividendTerm" class="remove-term-btn" v-if="dividend.length > 1">- {{ $t('calculators.polynomialRemainder.removeTerm') }}</button>
            </div>

            <!-- Divisor Polynomial -->
            <div class="polynomial-input-card">
              <div class="polynomial-header">
                <div class="polynomial-badge">2</div>
                <label class="polynomial-label">{{ $t('calculators.polynomialRemainder.divisor') }}</label>
              </div>
              <div class="polynomial-inputs">
                <div class="coefficient-group" v-for="(coef, index) in divisor" :key="index">
                  <input
                    v-model.number="divisor[index]"
                    type="number"
                    class="coefficient-input"
                    :placeholder="index === divisor.length - 1 ? 'b₀' : `b${divisor.length - 1 - index}`"
                    step="any"
                  />
                  <span class="variable-part">
                    x<sup>{{ divisor.length - 1 - index }}</sup>
                  </span>
                </div>
              </div>
              <button @click="addDivisorTerm" class="add-term-btn">+ {{ $t('calculators.polynomialRemainder.addTerm') }}</button>
              <button @click="removeDivisorTerm" class="remove-term-btn" v-if="divisor.length > 1">- {{ $t('calculators.polynomialRemainder.removeTerm') }}</button>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button @click="calculate" class="btn btn-primary" :disabled="!canCalculate">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('calculators.polynomialRemainder.calculate') }}</span>
              </button>
              <button @click="clear" class="btn btn-secondary">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('calculators.polynomialRemainder.clear') }}</span>
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
            <div v-if="result !== null && result.length > 0" class="result-section">
              <div class="result-header">
                <div class="result-badge">
                  <svg class="result-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ $t('calculators.polynomialRemainder.result') }}
                </div>
              </div>

              <div class="result-display">
                <div class="polynomial-result">
                  <div class="result-formula">
                    <span class="formula-label">{{ $t('calculators.polynomialRemainder.remainder') }}:</span>
                    <div class="polynomial-expression">
                      <span v-for="(coef, index) in result" :key="index" class="term">
                        <template v-if="coef !== 0">
                          <span v-if="index > 0 && coef > 0" class="operator">+</span>
                          <span v-if="coef < 0" class="operator">-</span>
                          <span class="coefficient">{{ Math.abs(coef) === 1 && result.length - 1 - index > 0 ? '' : Math.abs(coef) }}</span>
                          <span v-if="result.length - 1 - index > 0" class="variable">x</span>
                          <sup v-if="result.length - 1 - index > 1" class="exponent">{{ result.length - 1 - index }}</sup>
                        </template>
                      </span>
                      <span v-if="result.every(c => c === 0)" class="zero-result">0</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Additional Info -->
              <div v-if="result !== null && result.length > 0" class="info-section">
                <div class="info-card">
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.polynomialRemainder.dividend') }}:</span>
                    <span class="info-value">{{ formatPolynomial(dividend) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.polynomialRemainder.divisor') }}:</span>
                    <span class="info-value">{{ formatPolynomial(divisor) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.polynomialRemainder.remainder') }}:</span>
                    <span class="info-value">{{ formatPolynomial(result) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- SEO Content Section -->
        <div class="seo-content-section">
          <div class="seo-content-card">
            <h2 class="seo-heading">{{ $t('calculators.polynomialRemainder.seo.content.heading') }}</h2>
            
            <div class="seo-paragraphs">
              <p class="seo-paragraph">
                {{ $t('calculators.polynomialRemainder.seo.content.paragraph1') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.polynomialRemainder.seo.content.paragraph2') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.polynomialRemainder.seo.content.paragraph3') }}
              </p>
              
              <div class="seo-example">
                <h3 class="example-heading">{{ $t('calculators.polynomialRemainder.seo.content.exampleHeading') }}</h3>
                <p class="example-text">{{ $t('calculators.polynomialRemainder.seo.content.exampleText') }}</p>
              </div>
              
              <p class="seo-paragraph">
                {{ $t('calculators.polynomialRemainder.seo.content.paragraph4') }}
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
  name: 'PolynomialRemainderCalculator',
  components: {
    Navbar
  },
  data() {
    return {
      dividend: [0, 0, 0],
      divisor: [0, 0],
      result: null,
      error: ''
    }
  },
  computed: {
    canCalculate() {
      const hasDividend = this.dividend.some(c => c !== null && c !== '')
      const hasDivisor = this.divisor.some(c => c !== null && c !== '')
      const divisorNotZero = this.divisor[0] !== 0 || (this.divisor.length > 1 && this.divisor[1] !== 0)
      return hasDividend && hasDivisor && divisorNotZero
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
      
      document.title = this.$t('calculators.polynomialRemainder.seo.title')
      
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', this.$t('calculators.polynomialRemainder.seo.description'))
      
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', this.$t('calculators.polynomialRemainder.seo.keywords'))
      
      document.documentElement.lang = locale
      
      // Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      ogTitle.setAttribute('content', this.$t('calculators.polynomialRemainder.seo.title'))
      if (!document.querySelector('meta[property="og:title"]')) {
        document.head.appendChild(ogTitle)
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      ogDescription.setAttribute('content', this.$t('calculators.polynomialRemainder.seo.description'))
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
    addDividendTerm() {
      this.dividend.push(0)
    },
    removeDividendTerm() {
      if (this.dividend.length > 1) {
        this.dividend.pop()
      }
    },
    addDivisorTerm() {
      this.divisor.push(0)
    },
    removeDivisorTerm() {
      if (this.divisor.length > 1) {
        this.divisor.pop()
      }
    },
    validateInput() {
      this.error = ''
      // Check if divisor is not all zeros
      if (this.divisor.every(c => c === 0 || c === null || c === '')) {
        this.error = this.$t('calculators.polynomialRemainder.error.zeroDivisor')
        return false
      }
      return true
    },
    calculate() {
      this.error = ''
      
      if (!this.validateInput()) {
        return
      }

      // Convert to arrays of numbers, handling null/empty values
      const dividend = this.dividend.map(c => c === null || c === '' ? 0 : Number(c))
      const divisor = this.divisor.map(c => c === null || c === '' ? 0 : Number(c))

      // Remove leading zeros
      while (dividend.length > 1 && dividend[0] === 0) dividend.shift()
      while (divisor.length > 1 && divisor[0] === 0) divisor.shift()

      // Check if divisor is zero
      if (divisor.every(c => c === 0)) {
        this.error = this.$t('calculators.polynomialRemainder.error.zeroDivisor')
        return
      }

      try {
        this.result = this.polynomialRemainder(dividend, divisor)
      } catch (e) {
        this.error = this.$t('calculators.polynomialRemainder.error.calculationError')
      }
    },
    polynomialRemainder(dividend, divisor) {
      // Polynomial long division
      const remainder = [...dividend]
      
      while (remainder.length >= divisor.length && !this.isZeroPolynomial(remainder)) {
        const leadingCoeff = remainder[0] / divisor[0]
        const degree = remainder.length - divisor.length
        
        for (let i = 0; i < divisor.length; i++) {
          if (remainder[i] !== undefined) {
            remainder[i] -= leadingCoeff * divisor[i]
          }
        }
        
        // Remove leading zeros
        while (remainder.length > 0 && Math.abs(remainder[0]) < 1e-10) {
          remainder.shift()
        }
      }
      
      // Round small values to zero
      for (let i = 0; i < remainder.length; i++) {
        if (Math.abs(remainder[i]) < 1e-10) {
          remainder[i] = 0
        }
      }
      
      return remainder.length === 0 ? [0] : remainder
    },
    isZeroPolynomial(poly) {
      return poly.every(c => Math.abs(c) < 1e-10)
    },
    formatPolynomial(coefficients) {
      const terms = []
      for (let i = 0; i < coefficients.length; i++) {
        const coef = coefficients[i] === null || coefficients[i] === '' ? 0 : Number(coefficients[i])
        const power = coefficients.length - 1 - i
        
        if (coef !== 0 || (terms.length === 0 && i === coefficients.length - 1)) {
          let term = ''
          if (i > 0) {
            term += coef > 0 ? ' + ' : ' - '
          } else if (coef < 0) {
            term += '-'
          }
          
          const absCoef = Math.abs(coef)
          if (absCoef !== 1 || power === 0) {
            term += absCoef
          }
          
          if (power > 0) {
            term += 'x'
            if (power > 1) {
              term += '^' + power
            }
          }
          
          terms.push(term)
        }
      }
      
      const result = terms.join('')
      return result || '0'
    },
    clear() {
      this.dividend = [0, 0, 0]
      this.divisor = [0, 0]
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

.polynomial-input-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
  border: 2px solid var(--border-light);
  border-radius: 1.5rem;
  padding: 2.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.polynomial-input-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
}

.polynomial-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.polynomial-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: var(--gradient-primary);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1rem;
}

.polynomial-label {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.125rem;
}

.polynomial-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.coefficient-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.coefficient-input {
  width: 80px;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.coefficient-input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.variable-part {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.variable-part sup {
  font-size: 0.75rem;
  vertical-align: super;
}

.add-term-btn,
.remove-term-btn {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 0.5rem;
  margin-top: 0.5rem;
}

.add-term-btn:hover {
  border-color: var(--success-color);
  color: var(--success-color);
}

.remove-term-btn:hover {
  border-color: var(--error-color);
  color: var(--error-color);
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
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%);
  border-radius: 1.5rem;
  border: 2px solid rgba(99, 102, 241, 0.15);
}

.polynomial-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.result-formula {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.formula-label {
  font-weight: 700;
  color: var(--text-secondary);
  font-size: 1.125rem;
}

.polynomial-expression {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem;
}

.term {
  display: inline-flex;
  align-items: baseline;
}

.operator {
  margin: 0 0.25rem;
}

.coefficient {
  font-weight: 700;
}

.variable {
  margin-left: 0.125rem;
  font-weight: 700;
}

.exponent {
  font-size: 0.875em;
  vertical-align: super;
  font-weight: 600;
}

.zero-result {
  color: var(--text-secondary);
}

.info-section {
  margin-top: 2rem;
}

.info-card {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid var(--border-light);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-light);
  gap: 1rem;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.info-value {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1rem;
  text-align: right;
  font-family: 'Courier New', monospace;
}

/* SEO Content Section */
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

  .polynomial-input-card {
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
  
  .polynomial-input-card {
    padding: 1.5rem 1rem;
    border-radius: 1.25rem;
  }

  .polynomial-label {
    font-size: 1rem;
  }
  
  .polynomial-expression {
    font-size: 1.125rem;
  }

  .coefficient-input {
    width: 60px;
    font-size: 0.875rem;
    padding: 0.5rem;
  }

  .input-label {
    font-size: 1rem;
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

  .result-label {
    font-size: 1rem;
  }

  .result-value {
    font-size: 1.25rem;
  }

  .step-box {
    padding: 1.25rem 1rem;
  }

  .step-title {
    font-size: 1rem;
  }

  .step-formula {
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

  .polynomial-input-card {
    padding: 1.25rem 0.875rem;
  }

  .polynomial-expression {
    font-size: 1rem;
    flex-wrap: wrap;
  }

  .coefficient-input {
    width: 50px;
    font-size: 0.8125rem;
    padding: 0.4rem;
  }

  .btn {
    padding: 0.875rem 1.5rem;
    font-size: 0.9375rem;
  }

  .result-value {
    font-size: 1.125rem;
  }

  .seo-content-card {
    padding: 1.5rem 1rem;
  }

  .seo-heading {
    font-size: 1.5rem;
  }
}
</style>
