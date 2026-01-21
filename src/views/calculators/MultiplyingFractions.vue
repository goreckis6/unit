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
          <div class="title-badge">{{ $t('calculators.multiplyingFractions.badge') }}</div>
          <h1 class="page-title">{{ $t('calculators.multiplyingFractions.title') }}</h1>
          <p class="page-description">{{ $t('calculators.multiplyingFractions.description') }}</p>
        </div>
      </div>

      <div class="calculator-container">
        <div class="calculator-card">
          <!-- Input Section -->
          <div class="input-section">
            <div class="fractions-row">
              <!-- First Fraction -->
              <div class="fraction-card">
                <div class="fraction-card-header">
                  <div class="fraction-number-badge">1</div>
                  <label class="fraction-label">{{ $t('calculators.multiplyingFractions.firstFraction') }}</label>
                </div>
                <div class="fraction-display">
                  <input
                    v-model.number="fraction1.numerator"
                    type="number"
                    class="fraction-input numerator-input"
                    :placeholder="$t('common.numerator')"
                    @input="validateInput"
                    @keyup.enter="calculate"
                  />
                  <div class="fraction-line">
                    <div class="line"></div>
                  </div>
                  <input
                    v-model.number="fraction1.denominator"
                    type="number"
                    class="fraction-input denominator-input"
                    :placeholder="$t('common.denominator')"
                    @input="validateInput"
                    @keyup.enter="calculate"
                  />
                </div>
                <div class="fraction-preview" v-if="fraction1.numerator !== null && fraction1.denominator !== null">
                  <span class="preview-text">{{ fraction1.numerator }} / {{ fraction1.denominator }}</span>
                </div>
              </div>

              <!-- Multiply Operator -->
              <div class="operator-card">
                <div class="operator-symbol">×</div>
              </div>

              <!-- Second Fraction -->
              <div class="fraction-card">
                <div class="fraction-card-header">
                  <div class="fraction-number-badge">2</div>
                  <label class="fraction-label">{{ $t('calculators.multiplyingFractions.secondFraction') }}</label>
                </div>
                <div class="fraction-display">
                  <input
                    v-model.number="fraction2.numerator"
                    type="number"
                    class="fraction-input numerator-input"
                    :placeholder="$t('common.numerator')"
                    @input="validateInput"
                    @keyup.enter="calculate"
                  />
                  <div class="fraction-line">
                    <div class="line"></div>
                  </div>
                  <input
                    v-model.number="fraction2.denominator"
                    type="number"
                    class="fraction-input denominator-input"
                    :placeholder="$t('common.denominator')"
                    @input="validateInput"
                    @keyup.enter="calculate"
                  />
                </div>
                <div class="fraction-preview" v-if="fraction2.numerator !== null && fraction2.denominator !== null">
                  <span class="preview-text">{{ fraction2.numerator }} / {{ fraction2.denominator }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button @click="calculate" class="btn btn-primary" :disabled="!canCalculate">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('common.calculate') }}</span>
              </button>
              <button @click="clearInputs" class="btn btn-secondary">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('common.clear') }}</span>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <transition name="slide-down">
            <div v-if="errorMessage" class="error-message">
              <svg class="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
          </transition>

          <!-- Result Section -->
          <transition name="slide-up">
            <div v-if="showResult" class="result-section">
              <div class="result-header">
                <div class="result-badge">
                  <svg class="result-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ $t('common.result') }}
                </div>
              </div>

              <div class="result-display">
                <!-- Simplified Result -->
                <div class="result-fraction-large">
                  <div class="result-numerator-box">
                    <span class="result-numerator">{{ result.simplified.numerator }}</span>
                  </div>
                  <div class="result-divider-box">
                    <div class="result-divider"></div>
                  </div>
                  <div class="result-denominator-box">
                    <span class="result-denominator">{{ result.simplified.denominator }}</span>
                  </div>
                </div>

                <!-- Decimal Result -->
                <div class="result-decimal-box">
                  <span class="decimal-label">{{ $t('common.decimal') }}:</span>
                  <span class="decimal-value">{{ result.decimal }}</span>
                </div>
              </div>

              <!-- Steps Section -->
              <div class="steps-section">
                <h3 class="steps-title">{{ $t('common.stepByStep') }}</h3>
                
                <div class="step-item">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h4 class="step-title">{{ $t('calculators.multiplyingFractions.step1Title') }}</h4>
                    <div class="step-formula">
                      {{ fraction1.numerator }}/{{ fraction1.denominator }} × {{ fraction2.numerator }}/{{ fraction2.denominator }}
                    </div>
                  </div>
                </div>

                <div class="step-item">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h4 class="step-title">{{ $t('calculators.multiplyingFractions.step2Title') }}</h4>
                    <div class="step-formula">
                      {{ $t('common.numerator') }}: {{ fraction1.numerator }} × {{ fraction2.numerator }} = {{ result.original.numerator }}
                    </div>
                    <div class="step-formula">
                      {{ $t('common.denominator') }}: {{ fraction1.denominator }} × {{ fraction2.denominator }} = {{ result.original.denominator }}
                    </div>
                  </div>
                </div>

                <div class="step-item">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h4 class="step-title">{{ $t('calculators.multiplyingFractions.step3Title') }}</h4>
                    <div class="step-formula">
                      {{ result.original.numerator }}/{{ result.original.denominator }} = {{ result.simplified.numerator }}/{{ result.simplified.denominator }}
                    </div>
                    <div class="step-explanation" v-if="result.gcd > 1">
                      {{ $t('calculators.multiplyingFractions.gcdExplanation') }}: {{ result.gcd }}
                    </div>
                    <div class="step-explanation" v-else>
                      {{ $t('calculators.multiplyingFractions.alreadySimplified') }}
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
            <h2 class="seo-heading">{{ $t('calculators.multiplyingFractions.seo.content.heading') }}</h2>
            
            <div class="seo-paragraphs">
              <p class="seo-paragraph">
                {{ $t('calculators.multiplyingFractions.seo.content.paragraph1') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.multiplyingFractions.seo.content.paragraph2') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.multiplyingFractions.seo.content.paragraph3') }}
              </p>
              
              <div class="seo-example">
                <h3 class="example-heading">{{ $t('calculators.multiplyingFractions.seo.content.exampleHeading') }}</h3>
                <p class="example-text">{{ $t('calculators.multiplyingFractions.seo.content.exampleText') }}</p>
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
  name: 'MultiplyingFractions',
  components: {
    Navbar
  },
  data() {
    return {
      fraction1: {
        numerator: null,
        denominator: null
      },
      fraction2: {
        numerator: null,
        denominator: null
      },
      result: {
        original: { numerator: 0, denominator: 1 },
        simplified: { numerator: 0, denominator: 1 },
        decimal: 0,
        gcd: 1
      },
      showResult: false,
      errorMessage: ''
    }
  },
  computed: {
    canCalculate() {
      return this.fraction1.numerator !== null &&
             this.fraction1.denominator !== null &&
             this.fraction2.numerator !== null &&
             this.fraction2.denominator !== null &&
             this.fraction1.denominator !== 0 &&
             this.fraction2.denominator !== 0
    }
  },
  mounted() {
    this.updateMetaTags()
    this.updateSEO()
  },
  watch: {
    '$route'() {
      this.updateMetaTags()
      this.updateSEO()
    },
    '$i18n.locale'() {
      this.updateMetaTags()
      this.updateSEO()
    }
  },
  methods: {
    updateMetaTags() {
      const locale = this.$i18n.locale
      
      document.title = this.$t('calculators.multiplyingFractions.seo.title')
      
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', this.$t('calculators.multiplyingFractions.seo.description'))
      
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', this.$t('calculators.multiplyingFractions.seo.keywords'))
      
      document.documentElement.lang = locale
    },
    updateSEO() {
      const currentPath = this.$route.path
      updateHreflangTags(currentPath, supportedLocales)
      updateCanonicalTag(currentPath)
    },
    validateInput() {
      this.errorMessage = ''
    },
    gcd(a, b) {
      a = Math.abs(a)
      b = Math.abs(b)
      while (b !== 0) {
        const temp = b
        b = a % b
        a = temp
      }
      return a
    },
    simplifyFraction(numerator, denominator) {
      const divisor = this.gcd(numerator, denominator)
      return {
        numerator: numerator / divisor,
        denominator: denominator / divisor,
        gcd: divisor
      }
    },
    validate() {
      if (
        this.fraction1.numerator === null ||
        this.fraction1.numerator === '' ||
        this.fraction1.denominator === null ||
        this.fraction1.denominator === '' ||
        this.fraction2.numerator === null ||
        this.fraction2.numerator === '' ||
        this.fraction2.denominator === null ||
        this.fraction2.denominator === ''
      ) {
        this.errorMessage = this.$t('calculators.multiplyingFractions.error.emptyFields')
        return false
      }

      if (this.fraction1.denominator === 0 || this.fraction2.denominator === 0) {
        this.errorMessage = this.$t('calculators.multiplyingFractions.error.zeroDenominator')
        return false
      }

      if (
        !Number.isInteger(this.fraction1.numerator) ||
        !Number.isInteger(this.fraction1.denominator) ||
        !Number.isInteger(this.fraction2.numerator) ||
        !Number.isInteger(this.fraction2.denominator)
      ) {
        this.errorMessage = this.$t('calculators.multiplyingFractions.error.integersOnly')
        return false
      }

      return true
    },
    calculate() {
      if (!this.validate()) {
        this.showResult = false
        return
      }

      // Multiply numerators and denominators
      const resultNumerator = this.fraction1.numerator * this.fraction2.numerator
      const resultDenominator = this.fraction1.denominator * this.fraction2.denominator

      // Store original result
      this.result.original = {
        numerator: resultNumerator,
        denominator: resultDenominator
      }

      // Simplify the result
      const simplified = this.simplifyFraction(resultNumerator, resultDenominator)
      this.result.simplified = {
        numerator: simplified.numerator,
        denominator: simplified.denominator
      }
      this.result.gcd = simplified.gcd

      // Calculate decimal
      this.result.decimal = (resultNumerator / resultDenominator).toFixed(6)

      this.showResult = true
      this.errorMessage = ''
    },
    clearInputs() {
      this.fraction1 = { numerator: null, denominator: null }
      this.fraction2 = { numerator: null, denominator: null }
      this.showResult = false
      this.errorMessage = ''
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

/* Input Section */
.input-section {
  margin-bottom: 2rem;
}

.fractions-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.fraction-card {
  flex: 1;
  min-width: 280px;
  max-width: 350px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
  border: 2px solid var(--border-light);
  border-radius: 1.5rem;
  padding: 2rem;
  transition: all 0.3s ease;
}

.fraction-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
  transform: translateY(-4px);
}

.fraction-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.fraction-number-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.fraction-label {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.125rem;
  letter-spacing: -0.3px;
}

.fraction-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.fraction-input {
  width: 100%;
  max-width: 180px;
  padding: 1.25rem;
  border: 2px solid var(--border-color);
  border-radius: 0.875rem;
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  transition: all 0.3s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.fraction-input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  transform: scale(1.02);
}

.fraction-input::placeholder {
  color: var(--text-tertiary);
  opacity: 0.4;
}

.fraction-line {
  width: 100%;
  max-width: 180px;
  height: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--text-primary), transparent);
  border-radius: 2px;
}

.fraction-preview {
  text-align: center;
  padding: 0.75rem;
  background: rgba(99, 102, 241, 0.08);
  border-radius: 0.75rem;
  margin-top: 0.5rem;
}

.preview-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color);
}

.operator-card {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.operator-symbol {
  font-size: 3.5rem;
  font-weight: 300;
  color: white;
  line-height: 1;
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

/* Error Message */
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

/* Result Section */
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
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%);
  border-radius: 1.5rem;
  border: 2px solid rgba(99, 102, 241, 0.15);
}

.result-fraction-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.result-numerator-box,
.result-denominator-box {
  padding: 1rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-numerator,
.result-denominator {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--primary-color);
  letter-spacing: -2px;
  line-height: 1;
}

.result-divider-box {
  width: 220px;
  height: 5px;
  display: flex;
  align-items: center;
}

.result-divider {
  width: 100%;
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 3px;
}

.result-decimal-box {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 1rem;
  font-size: 2rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.decimal-label {
  color: var(--text-secondary);
}

.decimal-value {
  color: var(--primary-color);
  font-weight: 700;
}

/* Steps Section */
.steps-section {
  background: var(--bg-secondary);
  border-radius: 1.5rem;
  padding: 2.5rem;
  border: 2px solid var(--border-light);
}

.steps-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.step-item {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid var(--border-light);
}

.step-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.step-number {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  color: white;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: 900;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.step-formula {
  background: var(--bg-primary);
  padding: 1.25rem;
  border-radius: 0.875rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
  border: 2px solid var(--border-light);
  margin-bottom: 0.75rem;
}

.step-formula:last-child {
  margin-bottom: 0;
}

.step-explanation {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(99, 102, 241, 0.08);
  border-radius: 0.75rem;
  font-size: 1rem;
  color: var(--text-secondary);
  border-left: 4px solid var(--primary-color);
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

  .fractions-row {
    flex-direction: column;
    gap: 1.5rem;
  }

  .fraction-card {
    min-width: 100%;
    max-width: 100%;
    padding: 1.5rem;
  }

  .operator-card {
    width: 60px;
    height: 60px;
    align-self: center;
  }

  .operator-symbol {
    font-size: 2.5rem;
  }

  .fraction-input {
    max-width: 160px;
    font-size: 1.75rem;
    padding: 1rem;
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

  .result-numerator,
  .result-denominator {
    font-size: 2.5rem;
  }

  .result-divider-box {
    width: 180px;
  }

  .result-decimal-box {
    font-size: 1.75rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .steps-section {
    padding: 1.5rem 1rem;
  }

  .step-item {
    flex-direction: column;
    gap: 1rem;
  }

  .step-number {
    align-self: flex-start;
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

/* Small Mobile Styles */
@media (max-width: 480px) {
  .calculator-card {
    padding: 1.25rem 0.875rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .fraction-card {
    padding: 1.25rem;
  }

  .fraction-input {
    max-width: 140px;
    font-size: 1.5rem;
  }

  .operator-card {
    width: 50px;
    height: 50px;
  }

  .operator-symbol {
    font-size: 2rem;
  }

  .result-numerator,
  .result-denominator {
    font-size: 2rem;
  }

  .result-divider-box {
    width: 150px;
  }

  .result-decimal-box {
    font-size: 1.5rem;
  }

  .seo-content-card {
    padding: 1.5rem 1rem;
  }

  .seo-heading {
    font-size: 1.5rem;
  }
}
</style>
