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
          <div class="title-badge">{{ $t('calculators.energyConsumption.badge') }}</div>
          <h1 class="page-title">{{ $t('calculators.energyConsumption.title') }}</h1>
          <p class="page-description">{{ $t('calculators.energyConsumption.description') }}</p>
        </div>
      </div>

      <div class="calculator-container">
        <div class="calculator-card">
          <!-- Input Section -->
          <div class="input-section">
            <!-- Appliance Selection -->
            <div class="phase-type-row">
              <div class="phase-type-card">
                <label class="input-label">{{ $t('calculators.energyConsumption.applianceLabel') }}</label>
                <select v-model="selectedAppliance" class="phase-select" @change="onApplianceChange">
                  <option value="">{{ $t('calculators.energyConsumption.appliancePlaceholder') }}</option>
                  <option v-for="appliance in appliances" :key="appliance.id" :value="appliance.id">
                    {{ appliance.name }}
                  </option>
                </select>
                <div class="input-hint">
                  {{ $t('calculators.energyConsumption.applianceHint') }}
                </div>
              </div>
            </div>

            <div class="inputs-row">
              <!-- Power Consumption Input -->
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.energyConsumption.powerLabel') }}</label>
                <div class="input-wrapper">
                  <input
                    v-model.number="powerValue"
                    type="number"
                    class="number-input"
                    :placeholder="$t('calculators.energyConsumption.powerPlaceholder')"
                    @input="validateInput"
                    @keyup.enter="calculate"
                    step="any"
                    min="0"
                  />
                  <div class="input-suffix">W</div>
                </div>
              </div>

              <!-- Hours per Day Input -->
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.energyConsumption.hoursLabel') }}</label>
                <div class="input-wrapper">
                  <input
                    v-model.number="hoursValue"
                    type="number"
                    class="number-input"
                    :placeholder="$t('calculators.energyConsumption.hoursPlaceholder')"
                    @input="validateInput"
                    @keyup.enter="calculate"
                    step="any"
                    min="0"
                    max="24"
                  />
                  <div class="input-suffix">{{ $t('calculators.energyConsumption.hoursUnit') }}</div>
                </div>
                <div class="input-hint">
                  {{ $t('calculators.energyConsumption.hoursHint') }}
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
            <div v-if="results !== null" class="result-section">
              <div class="result-header">
                <div class="result-badge">
                  <svg class="result-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ $t('calculators.energyConsumption.results') }}
                </div>
              </div>

              <div class="results-grid">
                <!-- Daily Consumption -->
                <div class="result-card">
                  <div class="result-card-label">{{ $t('calculators.energyConsumption.consumptionPerDay') }}</div>
                  <div class="result-card-value">
                    <span class="result-amount">{{ formatResult(results.daily) }}</span>
                    <span class="result-unit">kWh</span>
                  </div>
                </div>

                <!-- Monthly Consumption -->
                <div class="result-card">
                  <div class="result-card-label">{{ $t('calculators.energyConsumption.consumptionPerMonth') }}</div>
                  <div class="result-card-value">
                    <span class="result-amount">{{ formatResult(results.monthly) }}</span>
                    <span class="result-unit">kWh</span>
                  </div>
                </div>

                <!-- Yearly Consumption -->
                <div class="result-card">
                  <div class="result-card-label">{{ $t('calculators.energyConsumption.consumptionPerYear') }}</div>
                  <div class="result-card-value">
                    <span class="result-amount">{{ formatResult(results.yearly) }}</span>
                    <span class="result-unit">kWh</span>
                  </div>
                </div>
              </div>

              <!-- Additional Info -->
              <div v-if="results !== null" class="info-section">
                <div class="info-card">
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.energyConsumption.powerValue') }}:</span>
                    <span class="info-value">{{ powerValue }} W</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.energyConsumption.hoursValue') }}:</span>
                    <span class="info-value">{{ hoursValue }} {{ $t('calculators.energyConsumption.hoursUnit') }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.energyConsumption.formula') }}:</span>
                    <span class="info-value">({{ powerValue }} W ÷ 1000) × {{ hoursValue }} h = {{ formatResult(results.daily) }} kWh/day</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- SEO Content Section -->
        <div class="seo-content-section">
          <div class="seo-content-card">
            <h2 class="seo-heading">{{ $t('calculators.energyConsumption.seo.content.heading') }}</h2>
            
            <div class="seo-paragraphs">
              <p class="seo-paragraph">
                {{ $t('calculators.energyConsumption.seo.content.paragraph1') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.energyConsumption.seo.content.paragraph2') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.energyConsumption.seo.content.paragraph3') }}
              </p>
              
              <div class="seo-example">
                <h3 class="example-heading">{{ $t('calculators.energyConsumption.seo.content.exampleHeading') }}</h3>
                <p class="example-text">{{ $t('calculators.energyConsumption.seo.content.exampleText') }}</p>
              </div>
              
              <p class="seo-paragraph">
                {{ $t('calculators.energyConsumption.seo.content.paragraph4') }}
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
import { supportedLocales, getLocalePath } from '../../router/index.js'

export default {
  name: 'EnergyConsumptionCalculator',
  components: {
    Navbar
  },
  data() {
    return {
      selectedAppliance: '',
      powerValue: null,
      hoursValue: null,
      results: null,
      error: '',
      appliances: [
        { id: 'refrigerator', name: 'Refrigerator', power: 200 },
        { id: 'air_conditioner', name: 'Air Conditioner', power: 2000 },
        { id: 'washing_machine', name: 'Washing Machine', power: 800 },
        { id: 'dishwasher', name: 'Dishwasher', power: 1800 },
        { id: 'microwave', name: 'Microwave', power: 1000 },
        { id: 'tv', name: 'TV', power: 150 },
        { id: 'computer', name: 'Computer', power: 150 },
        { id: 'led_bulb', name: 'LED Light Bulb', power: 10 },
        { id: 'incandescent_bulb', name: 'Incandescent Bulb', power: 60 },
        { id: 'electric_heater', name: 'Electric Heater', power: 1500 },
        { id: 'water_heater', name: 'Water Heater', power: 4000 },
        { id: 'dryer', name: 'Clothes Dryer', power: 3000 }
      ]
    }
  },
  computed: {
    canCalculate() {
      return this.powerValue !== null && 
             this.powerValue !== '' && 
             !isNaN(this.powerValue) &&
             this.powerValue > 0 &&
             this.hoursValue !== null &&
             this.hoursValue !== '' &&
             !isNaN(this.hoursValue) &&
             this.hoursValue > 0 &&
             this.hoursValue <= 24
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
      
      document.title = this.$t('calculators.energyConsumption.seo.title')
      
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', this.$t('calculators.energyConsumption.seo.description'))
      
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', this.$t('calculators.energyConsumption.seo.keywords'))
      
      document.documentElement.lang = locale
      
      this.updateOpenGraph()
    },
    updateOpenGraph() {
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      ogTitle.setAttribute('content', this.$t('calculators.energyConsumption.seo.title'))
      if (!document.querySelector('meta[property="og:title"]')) {
        document.head.appendChild(ogTitle)
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      ogDescription.setAttribute('content', this.$t('calculators.energyConsumption.seo.description'))
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
    onApplianceChange() {
      if (this.selectedAppliance) {
        const appliance = this.appliances.find(a => a.id === this.selectedAppliance)
        if (appliance) {
          this.powerValue = appliance.power
        }
      }
      this.error = ''
      this.results = null
    },
    calculate() {
      this.error = ''
      
      if (this.powerValue === null || this.powerValue === '' || isNaN(this.powerValue) || this.powerValue <= 0) {
        this.error = this.$t('calculators.energyConsumption.error.invalidPower')
        return
      }

      if (this.hoursValue === null || this.hoursValue === '' || isNaN(this.hoursValue) || this.hoursValue <= 0 || this.hoursValue > 24) {
        this.error = this.$t('calculators.energyConsumption.error.invalidHours')
        return
      }

      // Calculate kWh per day
      const kWhPerDay = (this.powerValue / 1000) * this.hoursValue
      
      // Calculate consumption for different periods
      const monthlyConsumption = kWhPerDay * 30.44 // Average days per month
      const yearlyConsumption = kWhPerDay * 365.25 // Account for leap years

      this.results = {
        daily: kWhPerDay,
        monthly: monthlyConsumption,
        yearly: yearlyConsumption
      }
    },
    formatResult(value) {
      return parseFloat(value.toFixed(4)).toString()
    },
    clear() {
      this.selectedAppliance = ''
      this.powerValue = null
      this.hoursValue = null
      this.results = null
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

.inputs-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  justify-content: center;
}

.input-card {
  flex: 1;
  min-width: 280px;
  max-width: 400px;
}

.input-label {
  display: block;
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.125rem;
  margin-bottom: 1rem;
  letter-spacing: -0.3px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.number-input {
  width: 100%;
  padding: 1.25rem;
  padding-right: 4rem;
  border: 2px solid var(--border-color);
  border-radius: 0.875rem;
  font-size: 1.5rem;
  font-weight: 700;
  transition: all 0.3s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.number-input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.number-input::placeholder {
  color: var(--text-tertiary);
  opacity: 0.4;
}

.input-suffix {
  position: absolute;
  right: 1.25rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-secondary);
  pointer-events: none;
}

.input-hint {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-tertiary);
  font-style: italic;
}

.phase-type-row {
  display: flex;
  justify-content: center;
  margin-bottom: 2.5rem;
}

.phase-type-card {
  max-width: 400px;
  width: 100%;
}

.phase-select {
  width: 100%;
  padding: 1.25rem;
  border: 2px solid var(--border-color);
  border-radius: 0.875rem;
  font-size: 1.125rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2363636f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.25rem center;
  background-size: 20px;
  padding-right: 3.5rem;
}

.phase-select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.phase-select:hover {
  border-color: var(--primary-color);
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
  font-size: 1.125rem;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.result-icon {
  width: 24px;
  height: 24px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.result-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%);
  border: 2px solid rgba(99, 102, 241, 0.15);
  border-radius: 1.5rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.result-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
  border-color: var(--primary-color);
}

.result-card-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-card-value {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.result-amount {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--primary-color);
  line-height: 1;
}

.result-unit {
  font-size: 1.25rem;
  font-weight: 600;
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
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

  .inputs-row {
    flex-direction: column;
    align-items: stretch;
  }

  .input-card {
    max-width: 100%;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }

  .result-amount {
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

  .result-amount {
    font-size: 1.75rem;
  }

  .info-card {
    grid-template-columns: 1fr;
  }

  .seo-content-card {
    padding: 2rem;
  }

  .seo-heading {
    font-size: 2rem;
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
}
</style>
