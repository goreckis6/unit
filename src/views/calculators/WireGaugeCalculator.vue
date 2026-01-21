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
          <div class="title-badge">{{ $t('calculators.wireGauge.badge') }}</div>
          <h1 class="page-title">{{ $t('calculators.wireGauge.title') }}</h1>
          <p class="page-description">{{ $t('calculators.wireGauge.description') }}</p>
        </div>
      </div>

      <div class="calculator-container">
        <div class="calculator-card">
          <!-- Input Section -->
          <div class="input-section">
            <div class="inputs-grid">
              <!-- Current (I) -->
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.wireGauge.currentLabel') }}</label>
                <div class="input-with-unit">
                  <input
                    v-model.number="currentValue"
                    type="number"
                    class="number-input"
                    :placeholder="$t('calculators.wireGauge.currentPlaceholder')"
                    @input="validateInput"
                    @keyup.enter="calculate"
                    step="any"
                  />
                  <select v-model="currentUnit" class="unit-select">
                    <option value="A">A (ampere)</option>
                    <option value="mA">mA (milliampere)</option>
                    <option value="kA">kA (kiloampere)</option>
                  </select>
                </div>
              </div>

              <!-- Length -->
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.wireGauge.lengthLabel') }}</label>
                <div class="input-with-unit">
                  <input
                    v-model.number="lengthValue"
                    type="number"
                    class="number-input"
                    :placeholder="$t('calculators.wireGauge.lengthPlaceholder')"
                    @input="validateInput"
                    @keyup.enter="calculate"
                    step="any"
                  />
                  <select v-model="lengthUnit" class="unit-select">
                    <option value="m">m (meter)</option>
                    <option value="ft">ft (foot)</option>
                    <option value="km">km (kilometer)</option>
                    <option value="mi">mi (mile)</option>
                  </select>
                </div>
              </div>

              <!-- Voltage Drop -->
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.wireGauge.voltageDropLabel') }}</label>
                <div class="input-with-unit">
                  <input
                    v-model.number="voltageDropValue"
                    type="number"
                    class="number-input"
                    :placeholder="$t('calculators.wireGauge.voltageDropPlaceholder')"
                    @input="validateInput"
                    @keyup.enter="calculate"
                    step="any"
                  />
                  <select v-model="voltageDropUnit" class="unit-select">
                    <option value="V">V (volt)</option>
                    <option value="mV">mV (millivolt)</option>
                    <option value="kV">kV (kilovolt)</option>
                  </select>
                </div>
              </div>

              <!-- Circuit Type -->
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.wireGauge.circuitTypeLabel') }}</label>
                <select v-model="circuitType" class="unit-select" style="width: 100%;">
                  <option value="dc">{{ $t('calculators.wireGauge.circuitType.dc') }}</option>
                  <option value="acSingle">{{ $t('calculators.wireGauge.circuitType.acSingle') }}</option>
                  <option value="acThree">{{ $t('calculators.wireGauge.circuitType.acThree') }}</option>
                </select>
                <div class="input-hint">
                  {{ $t('calculators.wireGauge.circuitTypeHint') }}
                </div>
              </div>

              <!-- Wire Material -->
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.wireGauge.materialLabel') }}</label>
                <select v-model="wireMaterial" class="unit-select" style="width: 100%;">
                  <option value="copper">{{ $t('calculators.wireGauge.material.copper') }}</option>
                  <option value="aluminum">{{ $t('calculators.wireGauge.material.aluminum') }}</option>
                </select>
                <div class="input-hint">
                  {{ $t('calculators.wireGauge.materialHint') }}
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
            <div v-if="result !== null" class="result-section">
              <div class="result-header">
                <div class="result-badge">
                  <svg class="result-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ $t('calculators.wireGauge.result') }}
                </div>
              </div>

              <div class="result-display">
                <div class="result-item">
                  <span class="result-label">{{ $t('calculators.wireGauge.wireGaugeValue') }}</span>
                  <div class="result-value-box">
                    <span class="result-value">{{ result.awg }}</span>
                    <span class="result-unit">AWG</span>
                  </div>
                </div>
                <div class="result-item">
                  <span class="result-label">{{ $t('calculators.wireGauge.crossSectionValue') }}</span>
                  <div class="result-value-box">
                    <span class="result-value">{{ formatResult(result.crossSection) }}</span>
                    <span class="result-unit">mm²</span>
                  </div>
                </div>
                <div class="result-item">
                  <span class="result-label">{{ $t('calculators.wireGauge.resistanceValue') }}</span>
                  <div class="result-value-box">
                    <span class="result-value">{{ formatResult(result.resistance) }}</span>
                    <span class="result-unit">Ω</span>
                  </div>
                </div>
                <div class="result-item">
                  <span class="result-label">{{ $t('calculators.wireGauge.voltageDropValue') }}</span>
                  <div class="result-value-box">
                    <span class="result-value">{{ formatResult(voltageDropValue) }}</span>
                    <span class="result-unit">{{ voltageDropUnit }}</span>
                  </div>
                </div>
              </div>

              <!-- Additional Info -->
              <div v-if="result !== null" class="info-section">
                <div class="info-card">
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.wireGauge.currentValue') }}:</span>
                    <span class="info-value">{{ formatResult(currentValue) }} {{ currentUnit }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.wireGauge.lengthValue') }}:</span>
                    <span class="info-value">{{ formatResult(lengthValue) }} {{ lengthUnit }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.wireGauge.circuitTypeValue') }}:</span>
                    <span class="info-value">{{ $t(`calculators.wireGauge.circuitType.${circuitType}`) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.wireGauge.materialValue') }}:</span>
                    <span class="info-value">{{ $t(`calculators.wireGauge.material.${wireMaterial}`) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.wireGauge.formula') }}:</span>
                    <span class="info-value">{{ result.formula }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- SEO Content Section -->
        <div class="seo-content-section">
          <div class="seo-content-card">
            <h2>{{ $t('calculators.wireGauge.seo.content.heading') }}</h2>
            <p>{{ $t('calculators.wireGauge.seo.content.paragraph1') }}</p>
            <p>{{ $t('calculators.wireGauge.seo.content.paragraph2') }}</p>
            <p>{{ $t('calculators.wireGauge.seo.content.paragraph3') }}</p>
            <p>{{ $t('calculators.wireGauge.seo.content.paragraph4') }}</p>
            <h3>{{ $t('calculators.wireGauge.seo.content.exampleHeading') }}</h3>
            <p>{{ $t('calculators.wireGauge.seo.content.exampleText') }}</p>
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
  name: 'WireGaugeCalculator',
  components: {
    Navbar,
    Footer
  },
  data() {
    return {
      currentValue: null,
      currentUnit: 'A',
      lengthValue: null,
      lengthUnit: 'm',
      voltageDropValue: null,
      voltageDropUnit: 'V',
      circuitType: 'dc',
      wireMaterial: 'copper',
      result: null,
      error: ''
    }
  },
  computed: {
    canCalculate() {
      const isFilledAndNumeric = (val) => {
        if (val === null || val === undefined || val === '' || (typeof val === 'string' && val.trim() === '')) {
          return false
        }
        const num = Number(val)
        return !isNaN(num) && isFinite(num) && num > 0
      }
      
      return isFilledAndNumeric(this.currentValue) &&
             isFilledAndNumeric(this.lengthValue) &&
             isFilledAndNumeric(this.voltageDropValue)
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
    updateMetaTags() {
      const locale = this.$i18n.locale
      
      document.title = this.$t('calculators.wireGauge.seo.title')
      
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', this.$t('calculators.wireGauge.seo.description'))
      
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', this.$t('calculators.wireGauge.seo.keywords'))
      
      document.documentElement.lang = locale
      
      this.updateOpenGraph()
    },
    updateOpenGraph() {
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      ogTitle.setAttribute('content', this.$t('calculators.wireGauge.seo.title'))
      if (!document.querySelector('meta[property="og:title"]')) {
        document.head.appendChild(ogTitle)
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      ogDescription.setAttribute('content', this.$t('calculators.wireGauge.seo.description'))
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
    },
    validateInput() {
      this.error = ''
    },
    convertToBase(value, unit, type) {
      const multipliers = {
        current: { 'A': 1, 'mA': 0.001, 'kA': 1000 },
        length: { 'm': 1, 'ft': 0.3048, 'km': 1000, 'mi': 1609.34 },
        voltage: { 'V': 1, 'mV': 0.001, 'kV': 1000 }
      }
      return value * (multipliers[type]?.[unit] || 1)
    },
    // AWG to cross-section area (mm²) mapping
    getAWGCrossSection(awg) {
      const awgTable = {
        0: 53.5, 1: 42.4, 2: 33.6, 3: 26.7, 4: 21.2, 5: 16.8, 6: 13.3, 7: 10.5,
        8: 8.37, 9: 6.63, 10: 5.26, 11: 4.17, 12: 3.31, 13: 2.62, 14: 2.08, 15: 1.65,
        16: 1.31, 17: 1.04, 18: 0.823, 19: 0.653, 20: 0.518, 21: 0.411, 22: 0.326,
        23: 0.258, 24: 0.205, 25: 0.162, 26: 0.129, 27: 0.102, 28: 0.0810, 29: 0.0642, 30: 0.0509
      }
      return awgTable[awg] || null
    },
    // Find AWG from cross-section area (mm²)
    findAWGFromArea(area) {
      const awgTable = {
        0: 53.5, 1: 42.4, 2: 33.6, 3: 26.7, 4: 21.2, 5: 16.8, 6: 13.3, 7: 10.5,
        8: 8.37, 9: 6.63, 10: 5.26, 11: 4.17, 12: 3.31, 13: 2.62, 14: 2.08, 15: 1.65,
        16: 1.31, 17: 1.04, 18: 0.823, 19: 0.653, 20: 0.518, 21: 0.411, 22: 0.326,
        23: 0.258, 24: 0.205, 25: 0.162, 26: 0.129, 27: 0.102, 28: 0.0810, 29: 0.0642, 30: 0.0509
      }
      
      // Find the smallest AWG that has cross-section >= required area
      for (let awg = 0; awg <= 30; awg++) {
        if (awgTable[awg] >= area) {
          return awg
        }
      }
      
      // If area is larger than AWG 0, return 0
      return 0
    },
    calculate() {
      this.error = ''
      this.result = null
      
      if (!this.canCalculate) {
        this.error = this.$t('calculators.wireGauge.error.invalidInput')
        return
      }

      // Convert all values to base units
      const current = this.convertToBase(this.currentValue, this.currentUnit, 'current') // A
      const length = this.convertToBase(this.lengthValue, this.lengthUnit, 'length') // m
      const voltageDrop = this.convertToBase(this.voltageDropValue, this.voltageDropUnit, 'voltage') // V

      // Resistivity (Ω·m)
      const resistivity = this.wireMaterial === 'copper' ? 1.68e-8 : 2.65e-8 // Ω·m
      const resistivityMM2 = this.wireMaterial === 'copper' ? 0.0172 : 0.0282 // Ω·mm²/m

      // Calculate effective current based on circuit type
      let effectiveCurrent = current
      if (this.circuitType === 'acThree') {
        effectiveCurrent = current * Math.sqrt(3)
      }

      // Calculate required resistance: R = V_drop / I_effective
      const requiredResistance = voltageDrop / effectiveCurrent

      // Calculate required cross-section area: A = ρ × L / R
      // Using resistivity in Ω·mm²/m
      const requiredArea = (resistivityMM2 * length * 1000) / requiredResistance // mm²

      // Find appropriate AWG
      const awg = this.findAWGFromArea(requiredArea)
      const actualArea = this.getAWGCrossSection(awg)

      // Calculate actual resistance with selected wire
      const actualResistance = (resistivityMM2 * length * 1000) / actualArea

      // Build formula string
      let formula = ''
      if (this.circuitType === 'dc') {
        formula = `R = V_drop / I = ${this.formatResult(voltageDrop)} V / ${this.formatResult(current)} A = ${this.formatResult(requiredResistance)} Ω`
      } else if (this.circuitType === 'acSingle') {
        formula = `R = V_drop / I = ${this.formatResult(voltageDrop)} V / ${this.formatResult(current)} A = ${this.formatResult(requiredResistance)} Ω`
      } else {
        formula = `R = V_drop / (I × √3) = ${this.formatResult(voltageDrop)} V / (${this.formatResult(current)} A × 1.732) = ${this.formatResult(requiredResistance)} Ω`
      }
      formula += `; A = ρ × L / R = ${resistivityMM2} × ${this.formatResult(length)} m / ${this.formatResult(requiredResistance)} Ω = ${this.formatResult(requiredArea)} mm²`

      this.result = {
        awg: awg,
        crossSection: actualArea,
        resistance: actualResistance,
        formula: formula
      }
    },
    formatResult(value) {
      if (value === null || isNaN(value)) return ''
      if (value < 0.001) {
        return value.toExponential(3)
      }
      return value.toLocaleString(this.$i18n.locale, { maximumFractionDigits: 4 })
    },
    clear() {
      this.currentValue = null
      this.lengthValue = null
      this.voltageDropValue = null
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

.input-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  line-height: 1.4;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.75rem;
  color: #dc2626;
  margin-top: 1.5rem;
  font-size: 0.9375rem;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
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

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.seo-content-section {
  margin-top: 3rem;
}

.seo-content-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.seo-content-card h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  line-height: 1.3;
}

.seo-content-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 2rem;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.seo-content-card p {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
}

@media (max-width: 768px) {
  .seo-content-card {
    padding: 1.5rem;
  }

  .seo-content-card h2 {
    font-size: 1.5rem;
  }

  .seo-content-card h3 {
    font-size: 1.25rem;
  }

  .seo-content-card p {
    font-size: 1rem;
  }
}
</style>

