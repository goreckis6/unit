<template>
  <div class="calculator-page">
    <Navbar />
    
    <div class="page-background">
      <div class="bg-gradient"></div>
    </div>

    <div class="container">
      <div class="calculator-header">
        <router-link :to="getLocalePath(currentLocale, '/')" class="back-button">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ $t('common.back') }}</span>
        </router-link>
        <div class="header-content">
          <div class="title-badge">{{ $t('calculators.wattsVoltsAmpsOhms.badge') }}</div>
          <h1 class="page-title">{{ $t('calculators.wattsVoltsAmpsOhms.title') }}</h1>
          <p class="page-description">{{ $t('calculators.wattsVoltsAmpsOhms.description') }}</p>
        </div>
      </div>

      <div class="calculator-container">
        <div class="calculator-card">
          <!-- Input Section -->
          <div class="input-section">
            <div class="inputs-grid">
              <!-- Resistance Input -->
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.wattsVoltsAmpsOhms.resistanceLabel') }}</label>
                <div class="input-with-unit">
                  <input
                    v-model.number="resistanceValue"
                    type="number"
                    class="number-input"
                    :placeholder="$t('calculators.wattsVoltsAmpsOhms.resistancePlaceholder')"
                    @input="validateInput"
                    @keyup.enter="calculate"
                    step="any"
                    min="0"
                  />
                  <select v-model="resistanceUnit" class="unit-select">
                    <option value="Ω">Ω (ohm)</option>
                    <option value="mΩ">mΩ (milliohm)</option>
                    <option value="μΩ">μΩ (microohm)</option>
                    <option value="kΩ">kΩ (kilohm)</option>
                    <option value="MΩ">MΩ (megohm)</option>
                  </select>
                </div>
              </div>

              <!-- Current Input -->
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.wattsVoltsAmpsOhms.currentLabel') }}</label>
                <div class="input-with-unit">
                  <input
                    v-model.number="currentValue"
                    type="number"
                    class="number-input"
                    :placeholder="$t('calculators.wattsVoltsAmpsOhms.currentPlaceholder')"
                    @input="validateInput"
                    @keyup.enter="calculate"
                    step="any"
                    min="0"
                  />
                  <select v-model="currentUnit" class="unit-select">
                    <option value="A">A (ampere)</option>
                    <option value="mA">mA (milliampere)</option>
                    <option value="μA">μA (microampere)</option>
                    <option value="kA">kA (kiloampere)</option>
                  </select>
                </div>
              </div>

              <!-- Voltage Input -->
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.wattsVoltsAmpsOhms.voltageLabel') }}</label>
                <div class="input-with-unit">
                  <input
                    v-model.number="voltageValue"
                    type="number"
                    class="number-input"
                    :placeholder="$t('calculators.wattsVoltsAmpsOhms.voltagePlaceholder')"
                    @input="validateInput"
                    @keyup.enter="calculate"
                    step="any"
                    min="0"
                  />
                  <select v-model="voltageUnit" class="unit-select">
                    <option value="V">V (volt)</option>
                    <option value="mV">mV (millivolt)</option>
                    <option value="μV">μV (microvolt)</option>
                    <option value="kV">kV (kilovolt)</option>
                  </select>
                </div>
              </div>

              <!-- Power Input -->
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.wattsVoltsAmpsOhms.powerLabel') }}</label>
                <div class="input-with-unit">
                  <input
                    v-model.number="powerValue"
                    type="number"
                    class="number-input"
                    :placeholder="$t('calculators.wattsVoltsAmpsOhms.powerPlaceholder')"
                    @input="validateInput"
                    @keyup.enter="calculate"
                    step="any"
                    min="0"
                  />
                  <select v-model="powerUnit" class="unit-select">
                    <option value="W">W (watt)</option>
                    <option value="mW">mW (milliwatt)</option>
                    <option value="μW">μW (microwatt)</option>
                    <option value="kW">kW (kilowatt)</option>
                    <option value="MW">MW (megawatt)</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="input-hint-section">
              <p class="input-hint">{{ $t('calculators.wattsVoltsAmpsOhms.hint') }}</p>
            </div>

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
                  {{ $t('calculators.wattsVoltsAmpsOhms.result') }}
                </div>
              </div>

              <div class="result-display">
                <div v-for="(result, index) in results" :key="index" class="result-item" :class="{ 'calculated': result.calculated }">
                  <div class="result-label">
                    {{ result.label }}
                    <span v-if="result.calculated" class="calculated-badge">{{ $t('calculators.wattsVoltsAmpsOhms.calculated') }}</span>
                  </div>
                  <div class="result-value-box">
                    <span class="result-value">{{ formatResult(result.value) }}</span>
                    <span class="result-unit">{{ result.unit }}</span>
                  </div>
                </div>
              </div>

              <!-- Additional Info -->
              <div v-if="results.length > 0" class="info-section">
                <div class="info-card">
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.wattsVoltsAmpsOhms.formula') }}:</span>
                    <span class="info-value">{{ formulaUsed }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- SEO Content Section -->
        <div class="seo-content-section">
          <div class="seo-content-card">
            <h2 class="seo-heading">{{ $t('calculators.wattsVoltsAmpsOhms.seo.content.heading') }}</h2>
            
            <div class="seo-paragraphs">
              <p class="seo-paragraph">
                {{ $t('calculators.wattsVoltsAmpsOhms.seo.content.paragraph1') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.wattsVoltsAmpsOhms.seo.content.paragraph2') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.wattsVoltsAmpsOhms.seo.content.paragraph3') }}
              </p>
              
              <div class="seo-example">
                <h3 class="example-heading">{{ $t('calculators.wattsVoltsAmpsOhms.seo.content.exampleHeading') }}</h3>
                <p class="example-text">{{ $t('calculators.wattsVoltsAmpsOhms.seo.content.exampleText') }}</p>
              </div>
              
              <p class="seo-paragraph">
                {{ $t('calculators.wattsVoltsAmpsOhms.seo.content.paragraph4') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
import Navbar from '../../components/Navbar.vue'
import Footer from '../../components/Footer.vue'
import { updateHreflangTags, updateCanonicalTag } from '../../utils/seo.js'
import { supportedLocales, getLocalePath } from '../../router/index.js'

export default {
  name: 'WattsVoltsAmpsOhmsCalculator',
  components: {
    Navbar,
    Footer
  },
  data() {
    return {
      resistanceValue: null,
      resistanceUnit: 'Ω',
      currentValue: null,
      currentUnit: 'A',
      voltageValue: null,
      voltageUnit: 'V',
      powerValue: null,
      powerUnit: 'W',
      results: [],
      formulaUsed: '',
      error: ''
    }
  },
  computed: {
    canCalculate() {
      const values = [
        this.isFilledAndNumeric(this.resistanceValue),
        this.isFilledAndNumeric(this.currentValue),
        this.isFilledAndNumeric(this.voltageValue),
        this.isFilledAndNumeric(this.powerValue)
      ]
      const filledCount = values.filter(v => v === true).length
      return filledCount === 2
    },
    currentLocale() {
      return this.$i18n.locale;
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
    getLocalePath(locale, path) {
      return getLocalePath(locale, path);
    },
    isFilledAndNumeric(value) {
      if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
        return false
      }
      return typeof value === 'number' && !isNaN(value) && isFinite(value) && value > 0
    },
    validateInput() {
      this.error = ''
    },
    convertToBase(value, unit, type) {
      const multipliers = {
        resistance: { 'Ω': 1, 'mΩ': 0.001, 'μΩ': 0.000001, 'kΩ': 1000, 'MΩ': 1000000 },
        current: { 'A': 1, 'mA': 0.001, 'μA': 0.000001, 'kA': 1000 },
        voltage: { 'V': 1, 'mV': 0.001, 'μV': 0.000001, 'kV': 1000 },
        power: { 'W': 1, 'mW': 0.001, 'μW': 0.000001, 'kW': 1000, 'MW': 1000000 }
      }
      return value * (multipliers[type]?.[unit] || 1)
    },
    convertFromBase(value, unit, type) {
      const divisors = {
        resistance: { 'Ω': 1, 'mΩ': 0.001, 'μΩ': 0.000001, 'kΩ': 1000, 'MΩ': 1000000 },
        current: { 'A': 1, 'mA': 0.001, 'μA': 0.000001, 'kA': 1000 },
        voltage: { 'V': 1, 'mV': 0.001, 'μV': 0.000001, 'kV': 1000 },
        power: { 'W': 1, 'mW': 0.001, 'μW': 0.000001, 'kW': 1000, 'MW': 1000000 }
      }
      return value / (divisors[type]?.[unit] || 1)
    },
    calculate() {
      this.error = ''
      this.results = []
      this.formulaUsed = ''

      // Convert all values to base units
      const r = this.isFilledAndNumeric(this.resistanceValue)
        ? this.convertToBase(this.resistanceValue, this.resistanceUnit, 'resistance') : null
      const i = this.isFilledAndNumeric(this.currentValue)
        ? this.convertToBase(this.currentValue, this.currentUnit, 'current') : null
      const v = this.isFilledAndNumeric(this.voltageValue)
        ? this.convertToBase(this.voltageValue, this.voltageUnit, 'voltage') : null
      const p = this.isFilledAndNumeric(this.powerValue)
        ? this.convertToBase(this.powerValue, this.powerUnit, 'power') : null

      const filled = [
        { name: 'resistance', value: r },
        { name: 'current', value: i },
        { name: 'voltage', value: v },
        { name: 'power', value: p }
      ].filter(item => item.value !== null)

      if (filled.length !== 2) {
        this.error = this.$t('calculators.wattsVoltsAmpsOhms.error.needTwoValues')
        return
      }

      // Check for invalid values (division by zero)
      if (filled.some(item => item.value === 0 && (item.name === 'resistance' || item.name === 'current'))) {
        this.error = this.$t('calculators.wattsVoltsAmpsOhms.error.invalidValues')
        return
      }

      let calculatedR = r
      let calculatedI = i
      let calculatedV = v
      let calculatedP = p

      const filledNames = filled.map(item => item.name)

      // Calculate missing values
      if (!filledNames.includes('resistance')) {
        // Calculate R
        if (filledNames.includes('voltage') && filledNames.includes('current')) {
          calculatedR = calculatedV / calculatedI
          this.formulaUsed += `R = V / I = ${this.formatResult(calculatedV)} V / ${this.formatResult(calculatedI)} A = ${this.formatResult(calculatedR)} Ω; `
        } else if (filledNames.includes('power') && filledNames.includes('current')) {
          calculatedR = calculatedP / (calculatedI * calculatedI)
          this.formulaUsed += `R = P / I² = ${this.formatResult(calculatedP)} W / (${this.formatResult(calculatedI)} A)² = ${this.formatResult(calculatedR)} Ω; `
        } else if (filledNames.includes('voltage') && filledNames.includes('power')) {
          calculatedR = (calculatedV * calculatedV) / calculatedP
          this.formulaUsed += `R = V² / P = (${this.formatResult(calculatedV)} V)² / ${this.formatResult(calculatedP)} W = ${this.formatResult(calculatedR)} Ω; `
        }
      }

      if (!filledNames.includes('current')) {
        // Calculate I
        if (filledNames.includes('voltage') && filledNames.includes('resistance')) {
          calculatedI = calculatedV / calculatedR
          this.formulaUsed += `I = V / R = ${this.formatResult(calculatedV)} V / ${this.formatResult(calculatedR)} Ω = ${this.formatResult(calculatedI)} A; `
        } else if (filledNames.includes('power') && filledNames.includes('voltage')) {
          calculatedI = calculatedP / calculatedV
          this.formulaUsed += `I = P / V = ${this.formatResult(calculatedP)} W / ${this.formatResult(calculatedV)} V = ${this.formatResult(calculatedI)} A; `
        } else if (filledNames.includes('power') && filledNames.includes('resistance')) {
          calculatedI = Math.sqrt(calculatedP / calculatedR)
          this.formulaUsed += `I = √(P / R) = √(${this.formatResult(calculatedP)} W / ${this.formatResult(calculatedR)} Ω) = ${this.formatResult(calculatedI)} A; `
        }
      }

      if (!filledNames.includes('voltage')) {
        // Calculate V
        if (filledNames.includes('current') && filledNames.includes('resistance')) {
          calculatedV = calculatedI * calculatedR
          this.formulaUsed += `V = I × R = ${this.formatResult(calculatedI)} A × ${this.formatResult(calculatedR)} Ω = ${this.formatResult(calculatedV)} V; `
        } else if (filledNames.includes('power') && filledNames.includes('current')) {
          calculatedV = calculatedP / calculatedI
          this.formulaUsed += `V = P / I = ${this.formatResult(calculatedP)} W / ${this.formatResult(calculatedI)} A = ${this.formatResult(calculatedV)} V; `
        } else if (filledNames.includes('power') && filledNames.includes('resistance')) {
          calculatedV = Math.sqrt(calculatedP * calculatedR)
          this.formulaUsed += `V = √(P × R) = √(${this.formatResult(calculatedP)} W × ${this.formatResult(calculatedR)} Ω) = ${this.formatResult(calculatedV)} V; `
        }
      }

      if (!filledNames.includes('power')) {
        // Calculate P
        if (filledNames.includes('voltage') && filledNames.includes('current')) {
          calculatedP = calculatedV * calculatedI
          this.formulaUsed += `P = V × I = ${this.formatResult(calculatedV)} V × ${this.formatResult(calculatedI)} A = ${this.formatResult(calculatedP)} W; `
        } else if (filledNames.includes('current') && filledNames.includes('resistance')) {
          calculatedP = calculatedI * calculatedI * calculatedR
          this.formulaUsed += `P = I² × R = (${this.formatResult(calculatedI)} A)² × ${this.formatResult(calculatedR)} Ω = ${this.formatResult(calculatedP)} W; `
        } else if (filledNames.includes('voltage') && filledNames.includes('resistance')) {
          calculatedP = (calculatedV * calculatedV) / calculatedR
          this.formulaUsed += `P = V² / R = (${this.formatResult(calculatedV)} V)² / ${this.formatResult(calculatedR)} Ω = ${this.formatResult(calculatedP)} W; `
        }
      }

      // Convert back to user's selected units
      const resultR = this.convertFromBase(calculatedR, this.resistanceUnit, 'resistance')
      const resultI = this.convertFromBase(calculatedI, this.currentUnit, 'current')
      const resultV = this.convertFromBase(calculatedV, this.voltageUnit, 'voltage')
      const resultP = this.convertFromBase(calculatedP, this.powerUnit, 'power')

      this.results = [
        {
          label: this.$t('calculators.wattsVoltsAmpsOhms.resistanceLabel'),
          value: resultR,
          unit: this.resistanceUnit,
          calculated: !filledNames.includes('resistance')
        },
        {
          label: this.$t('calculators.wattsVoltsAmpsOhms.currentLabel'),
          value: resultI,
          unit: this.currentUnit,
          calculated: !filledNames.includes('current')
        },
        {
          label: this.$t('calculators.wattsVoltsAmpsOhms.voltageLabel'),
          value: resultV,
          unit: this.voltageUnit,
          calculated: !filledNames.includes('voltage')
        },
        {
          label: this.$t('calculators.wattsVoltsAmpsOhms.powerLabel'),
          value: resultP,
          unit: this.powerUnit,
          calculated: !filledNames.includes('power')
        }
      ]

      if (this.formulaUsed) {
        this.formulaUsed = this.formulaUsed.trim().slice(0, -1) // Remove last semicolon
      }
    },
    clear() {
      this.resistanceValue = null
      this.currentValue = null
      this.voltageValue = null
      this.powerValue = null
      this.results = []
      this.formulaUsed = ''
      this.error = ''
    },
    formatResult(value) {
      if (value === null || isNaN(value)) {
        return ''
      }
      return value.toLocaleString(this.$i18n.locale, { maximumFractionDigits: 4 })
    },
    updateMetaTags() {
      const locale = this.$i18n.locale
      
      document.title = this.$t('calculators.wattsVoltsAmpsOhms.seo.title')
      
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', this.$t('calculators.wattsVoltsAmpsOhms.seo.description'))
      
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', this.$t('calculators.wattsVoltsAmpsOhms.seo.keywords'))
      
      document.documentElement.lang = locale
      
      this.updateOpenGraph()
    },
    updateOpenGraph() {
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      ogTitle.setAttribute('content', this.$t('calculators.wattsVoltsAmpsOhms.seo.title'))
      if (!document.querySelector('meta[property="og:title"]')) {
        document.head.appendChild(ogTitle)
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      ogDescription.setAttribute('content', this.$t('calculators.wattsVoltsAmpsOhms.seo.description'))
      if (!document.querySelector('meta[property="og:description"]')) {
        document.head.appendChild(ogDescription)
      }

      const baseUrl = window.location.origin
      const ogUrl = document.querySelector('meta[property="og:url"]') || document.createElement('meta')
      ogUrl.setAttribute('property', 'og:url')
      ogUrl.setAttribute('content', baseUrl + this.getLocalePath(this.$i18n.locale, this.$route.path))
      if (!document.querySelector('meta[property="og:url"]')) {
        document.head.appendChild(ogUrl)
      }
    },
    updateSEO() {
      updateHreflangTags(this.getLocalePath(this.$i18n.locale, this.$route.path), supportedLocales)
      updateCanonicalTag(this.getLocalePath(this.$i18n.locale, this.$route.path))
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

.input-hint-section {
  margin: 1.5rem 0;
  text-align: center;
}

.input-hint {
  font-size: 0.9375rem;
  color: var(--text-tertiary);
  font-style: italic;
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
  font-size: 1.125rem;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.result-icon {
  width: 24px;
  height: 24px;
}

.result-item {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  border: 2px solid var(--border-light);
  transition: all 0.3s ease;
}

.result-item.calculated {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%);
}

.result-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calculated-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--gradient-primary);
  color: white;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-value-box {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.result-value {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--primary-color);
  line-height: 1;
}

.result-unit {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.info-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid var(--border-light);
}

.info-card {
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.6;
}

.seo-content-section {
  margin-top: 4rem;
}

.seo-content-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 2rem;
  padding: 3rem;
  box-shadow: var(--shadow-lg);
}

.seo-heading {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 2rem;
  line-height: 1.2;
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
  background: var(--bg-secondary);
  border-left: 4px solid var(--primary-color);
  padding: 1.5rem 2rem;
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}

.example-heading {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.example-text {
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

@media (max-width: 1024px) {
  .page-title {
    font-size: 2.75rem;
  }

  .page-description {
    font-size: 1.125rem;
  }

  .calculator-card {
    padding: 2rem;
  }

  .result-value {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.25rem;
  }

  .calculator-card {
    padding: 1.5rem;
  }

  .result-value {
    font-size: 1.75rem;
  }

  .seo-content-card {
    padding: 2rem;
  }

  .seo-heading {
    font-size: 2rem;
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

