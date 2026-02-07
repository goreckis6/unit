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
          <div class="title-badge">{{ $t('calculators.naturalLogarithm.badge') }}</div>
          <h1 class="page-title">{{ $t('calculators.naturalLogarithm.title') }}</h1>
          <p class="page-description">{{ $t('calculators.naturalLogarithm.description') }}</p>
        </div>
      </div>

      <div class="calculator-container">
        <div class="calculator-card">
          <!-- Input Section -->
          <div class="input-section">
            <div class="input-card">
              <label class="input-label">{{ $t('calculators.naturalLogarithm.inputLabel') }}</label>
              <div class="input-wrapper">
                <div class="input-prefix">ln(</div>
                <input
                  v-model.number="inputValue"
                  type="number"
                  class="number-input"
                  :placeholder="$t('calculators.naturalLogarithm.placeholder')"
                  @input="validateInput"
                  @keyup.enter="calculate"
                  step="any"
                  min="0.0001"
                />
                <div class="input-suffix">)</div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button @click="calculate" class="btn btn-primary" :disabled="!canCalculate">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('calculators.naturalLogarithm.calculate') }}</span>
              </button>
              <button @click="clear" class="btn btn-secondary">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('calculators.naturalLogarithm.clear') }}</span>
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
                  {{ $t('calculators.naturalLogarithm.result') }}
                </div>
              </div>

              <div class="result-display">
                <div class="logarithm-result">
                  <div class="result-formula">
                    <span class="formula-text">ln({{ inputValue }})</span>
                    <span class="equals-sign">=</span>
                  </div>
                  <div class="result-value-box">
                    <span class="result-value">{{ formatResult(result) }}</span>
                  </div>
                </div>
                <div v-if="result !== null" class="result-exact">
                  <span class="exact-label">{{ $t('calculators.naturalLogarithm.approximate') }}:</span>
                  <span class="exact-value">{{ result.toFixed(10) }}</span>
                </div>
              </div>

              <!-- Additional Info -->
              <div v-if="result !== null" class="info-section">
                <div class="info-card">
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.naturalLogarithm.inputNumber') }}:</span>
                    <span class="info-value">{{ inputValue }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.naturalLogarithm.resultNumber') }}:</span>
                    <span class="info-value">{{ formatResult(result) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('calculators.naturalLogarithm.eRaisedTo') }}:</span>
                    <span class="info-value">e^{{ formatResult(result) }} ≈ {{ Math.exp(result).toFixed(10) }}</span>
                  </div>
                </div>
              </div>

              <!-- Graph Section -->
              <div v-if="result !== null" class="graph-section">
                <h3 class="graph-title">{{ $t('calculators.naturalLogarithm.graphTitle') }}</h3>
                <div class="graph-container">
                  <svg :width="graphWidth" :height="graphHeight" class="graph-svg" ref="graphSvg">
                    <!-- Grid lines -->
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border-light)" stroke-width="1" opacity="0.3"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)"/>
                    
                    <!-- Axes -->
                    <line :x1="padding" :y1="graphHeight - padding" :x2="graphWidth - padding" :y2="graphHeight - padding" 
                          stroke="var(--text-primary)" stroke-width="2"/>
                    <line :x1="padding" :y1="padding" :x2="padding" :y2="graphHeight - padding" 
                          stroke="var(--text-primary)" stroke-width="2"/>
                    
                    <!-- Axis labels -->
                    <text :x="graphWidth / 2" :y="graphHeight - 10" text-anchor="middle" 
                          fill="var(--text-secondary)" font-size="14" font-weight="600">x</text>
                    <text :x="15" :y="graphHeight / 2" text-anchor="middle" 
                          fill="var(--text-secondary)" font-size="14" font-weight="600">ln(x)</text>
                    
                    <!-- Linear function y = x for comparison (dashed line) -->
                    <path :d="linearPath" fill="none" stroke="var(--text-tertiary)" stroke-width="2" 
                          stroke-dasharray="5,5" opacity="0.5" stroke-linecap="round"/>
                    
                    <!-- Function curve ln(x) -->
                    <path :d="graphPath" fill="none" stroke="var(--accent-primary)" stroke-width="3" 
                          stroke-linecap="round" stroke-linejoin="round"/>
                    
                    <!-- Legend -->
                    <g :transform="`translate(${graphWidth - padding - 180}, ${padding + 25})`">
                      <!-- ln(x) legend -->
                      <rect x="0" y="-8" width="30" height="16" fill="var(--accent-primary)" opacity="0.2" rx="2"/>
                      <line x1="5" y1="0" x2="25" y2="0" stroke="var(--accent-primary)" stroke-width="3"/>
                      <text x="32" y="4" fill="var(--text-primary)" font-size="13" font-weight="600">ln(x)</text>
                      
                      <!-- Calculated point legend -->
                      <circle cx="5" cy="20" r="5" fill="var(--accent-primary)" stroke="white" stroke-width="2"/>
                      <text x="32" y="24" fill="var(--text-primary)" font-size="13" font-weight="600">
                        ln({{ inputValue }})
                      </text>
                    </g>
                    
                    <!-- Current point marker -->
                    <circle :cx="currentPointX" :cy="currentPointY" r="6" fill="var(--accent-primary)" 
                            stroke="white" stroke-width="2"/>
                    <text :x="currentPointX" :y="currentPointY - 15" text-anchor="middle" 
                          fill="var(--accent-primary)" font-size="12" font-weight="700">
                      ({{ inputValue }}, {{ formatResult(result) }})
                    </text>
                    
                    <!-- Special points (only show if visible) -->
                    <g v-if="ePointX > 0 && ePointY > 0">
                      <circle :cx="ePointX" :cy="ePointY" r="4" fill="var(--success-text)" opacity="0.7"/>
                      <text :x="ePointX" :y="ePointY - 15" text-anchor="middle" 
                            fill="var(--text-secondary)" font-size="11">e</text>
                    </g>
                    
                    <!-- Point (1,0) - only show if visible and not same as input -->
                    <g v-if="onePointX > 0 && onePointY > 0 && inputValue !== 1">
                      <circle :cx="onePointX" :cy="onePointY" r="4" fill="var(--text-secondary)" opacity="0.7"/>
                      <text :x="onePointX" :y="onePointY - 15" text-anchor="middle" 
                            fill="var(--text-secondary)" font-size="11">(1,0)</text>
                    </g>
                    
                    <!-- Axis ticks and labels -->
                    <g v-for="tick in xTicks" :key="'x-' + tick.value">
                      <line :x1="getXTickX(tick.value)" :y1="graphHeight - padding" 
                            :x2="getXTickX(tick.value)" :y2="graphHeight - padding + 5" 
                            stroke="var(--text-primary)" stroke-width="1"/>
                      <text :x="getXTickX(tick.value)" :y="graphHeight - padding + 18" 
                            text-anchor="middle" fill="var(--text-secondary)" font-size="11">{{ tick.label }}</text>
                    </g>
                    <g v-for="tick in yTicks" :key="'y-' + tick.value">
                      <line :x1="padding" :y1="getYTickY(tick.value)" 
                            :x2="padding - 5" :y2="getYTickY(tick.value)" 
                            stroke="var(--text-primary)" stroke-width="1"/>
                      <text :x="padding - 10" :y="getYTickY(tick.value) + 4" 
                            text-anchor="end" fill="var(--text-secondary)" font-size="11">{{ tick.label }}</text>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- SEO Content Section -->
        <div class="seo-content-section">
          <div class="seo-content-card">
            <h2 class="seo-heading">{{ $t('calculators.naturalLogarithm.seo.content.heading') }}</h2>
            
            <div class="seo-paragraphs">
              <p class="seo-paragraph">
                {{ $t('calculators.naturalLogarithm.seo.content.paragraph1') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.naturalLogarithm.seo.content.paragraph2') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.naturalLogarithm.seo.content.paragraph3') }}
              </p>
              
              <div class="seo-example">
                <h3 class="example-heading">{{ $t('calculators.naturalLogarithm.seo.content.exampleHeading') }}</h3>
                <p class="example-text">{{ $t('calculators.naturalLogarithm.seo.content.exampleText') }}</p>
              </div>
              
              <p class="seo-paragraph">
                {{ $t('calculators.naturalLogarithm.seo.content.paragraph4') }}
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
  name: 'NaturalLogarithmCalculator',
  components: {
    Navbar
  },
  data() {
    return {
      inputValue: null,
      result: null,
      error: '',
      graphWidth: 600,
      graphHeight: 400,
      padding: 50
    }
  },
  computed: {
    canCalculate() {
      return this.inputValue != null && this.inputValue > 0
    },
    graphPath() {
      return this.getGraphPath()
    },
    linearPath() {
      return this.getLinearPath()
    },
    currentPointX() {
      return this.getCurrentPointX()
    },
    currentPointY() {
      return this.getCurrentPointY()
    },
    ePointX() {
      return this.getEPointX()
    },
    ePointY() {
      return this.getEPointY()
    },
    onePointX() {
      return this.getOnePointX()
    },
    onePointY() {
      return this.getOnePointY()
    },
    xTicks() {
      return this.getXTicks()
    },
    yTicks() {
      return this.getYTicks()
    },
    graphXMin() {
      return this.result !== null && this.inputValue > 0 ? 0.1 : 0.1
    },
    graphXMax() {
      if (this.result !== null && this.inputValue > 0) {
        // Scale x-axis to show at least up to input value, with some padding
        return Math.max(10, Math.ceil(this.inputValue * 1.2))
      }
      return 10
    },
    graphYMin() {
      return -0.5
    },
    graphYMax() {
      if (this.result !== null && this.inputValue > 0) {
        // Scale y-axis to show at least up to result, with some padding
        return Math.max(3.5, Math.ceil(this.result * 1.3))
      }
      return 3.5
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
    },
    inputValue(newVal) {
      // Debug: log when inputValue changes
      const canCalc = newVal != null && newVal > 0
      console.log('inputValue changed:', newVal, 'Type:', typeof newVal, 'canCalculate:', canCalc)
    }
  },
  methods: {
    updateMetaTags() {
      const locale = this.$i18n.locale
      
      document.title = this.$t('calculators.naturalLogarithm.seo.title')
      
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', this.$t('calculators.naturalLogarithm.seo.description'))
      
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', this.$t('calculators.naturalLogarithm.seo.keywords'))
      
      document.documentElement.lang = locale
      
      this.updateOpenGraph()
    },
    updateOpenGraph() {
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      ogTitle.setAttribute('content', this.$t('calculators.naturalLogarithm.seo.title'))
      if (!document.querySelector('meta[property="og:title"]')) {
        document.head.appendChild(ogTitle)
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      ogDescription.setAttribute('content', this.$t('calculators.naturalLogarithm.seo.description'))
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
      // Update hreflang tags for all language versions
      const currentPath = this.$route.path
      updateHreflangTags(currentPath, supportedLocales)
      updateCanonicalTag(currentPath)
    },
    validateInput() {
      this.error = ''
      if (this.inputValue !== null && this.inputValue <= 0) {
        this.error = this.$t('calculators.naturalLogarithm.error.positiveOnly')
        this.result = null
      }
    },
    calculate() {
      this.error = ''
      
      if (this.inputValue == null) {
        this.error = this.$t('calculators.naturalLogarithm.error.positiveOnly')
        this.result = null
        return
      }

      if (this.inputValue <= 0 || isNaN(this.inputValue)) {
        this.error = this.$t('calculators.naturalLogarithm.error.positiveOnly')
        this.result = null
        return
      }

      this.result = Math.log(this.inputValue)
    },
    clear() {
      this.inputValue = null
      this.result = null
      this.error = ''
    },
    formatResult(value) {
      if (value === null || isNaN(value)) return ''
      
      // If the value is very close to an integer, display as integer
      if (Math.abs(value - Math.round(value)) < 0.000001) {
        return Math.round(value).toString()
      }
      
      // Otherwise, format with up to 6 decimal places, removing trailing zeros
      return value.toFixed(10).replace(/\.?0+$/, '')
    },
    // Graph calculations
    getGraphPath() {
      const width = this.graphWidth - 2 * this.padding
      const height = this.graphHeight - 2 * this.padding
      const xMin = 0.1
      const xMax = 10
      const yMin = -2.5
      const yMax = 2.5
      
      const points = []
      const steps = 200
      
      for (let i = 0; i <= steps; i++) {
        const x = xMin + (xMax - xMin) * (i / steps)
        const y = Math.log(x)
        
        if (y >= yMin && y <= yMax) {
          const xCoord = this.padding + ((x - xMin) / (xMax - xMin)) * width
          const yCoord = this.graphHeight - this.padding - ((y - yMin) / (yMax - yMin)) * height
          points.push(`${i === 0 ? 'M' : 'L'} ${xCoord} ${yCoord}`)
        }
      }
      
      return points.join(' ')
    },
    getCurrentPointX() {
      if (this.inputValue === null || this.result === null) return 0
      const width = this.graphWidth - 2 * this.padding
      const xMin = this.graphXMin
      const xMax = this.graphXMax
      const x = Math.min(Math.max(this.inputValue, xMin), xMax)
      return this.padding + ((x - xMin) / (xMax - xMin)) * width
    },
    getCurrentPointY() {
      if (this.inputValue === null || this.result === null) return 0
      const height = this.graphHeight - 2 * this.padding
      const yMin = this.graphYMin
      const yMax = this.graphYMax
      const y = Math.min(Math.max(this.result, yMin), yMax)
      return this.graphHeight - this.padding - ((y - yMin) / (yMax - yMin)) * height
    },
    getEPointX() {
      const width = this.graphWidth - 2 * this.padding
      const xMin = this.graphXMin
      const xMax = this.graphXMax
      const x = Math.E
      if (x < xMin || x > xMax) return -100 // Off screen
      return this.padding + ((x - xMin) / (xMax - xMin)) * width
    },
    getEPointY() {
      const height = this.graphHeight - 2 * this.padding
      const yMin = this.graphYMin
      const yMax = this.graphYMax
      const y = 1 // ln(e) = 1
      if (y < yMin || y > yMax) return -100 // Off screen
      return this.graphHeight - this.padding - ((y - yMin) / (yMax - yMin)) * height
    },
    getLinearPath() {
      const width = this.graphWidth - 2 * this.padding
      const height = this.graphHeight - 2 * this.padding
      const xMin = this.graphXMin
      const xMax = this.graphXMax
      const yMin = this.graphYMin
      const yMax = this.graphYMax
      
      const points = []
      const steps = 100
      
      for (let i = 0; i <= steps; i++) {
        const x = xMin + (xMax - xMin) * (i / steps)
        const y = x // y = x (linear function)
        
        if (y >= yMin && y <= yMax) {
          const xCoord = this.padding + ((x - xMin) / (xMax - xMin)) * width
          const yCoord = this.graphHeight - this.padding - ((y - yMin) / (yMax - yMin)) * height
          points.push(`${i === 0 ? 'M' : 'L'} ${xCoord} ${yCoord}`)
        }
      }
      
      return points.join(' ')
    },
    getOnePointX() {
      const width = this.graphWidth - 2 * this.padding
      const xMin = this.graphXMin
      const xMax = this.graphXMax
      const x = 1
      if (x < xMin || x > xMax) return -100 // Off screen
      return this.padding + ((x - xMin) / (xMax - xMin)) * width
    },
    getOnePointY() {
      const height = this.graphHeight - 2 * this.padding
      const yMin = this.graphYMin
      const yMax = this.graphYMax
      const y = 0 // ln(1) = 0
      if (y < yMin || y > yMax) return -100 // Off screen
      return this.graphHeight - this.padding - ((y - yMin) / (yMax - yMin)) * height
    },
    getXTickX(value) {
      const width = this.graphWidth - 2 * this.padding
      const xMin = this.graphXMin
      const xMax = this.graphXMax
      const x = Math.min(Math.max(value, xMin), xMax)
      return this.padding + ((x - xMin) / (xMax - xMin)) * width
    },
    getYTickY(value) {
      const height = this.graphHeight - 2 * this.padding
      const yMin = this.graphYMin
      const yMax = this.graphYMax
      const y = Math.min(Math.max(value, yMin), yMax)
      return this.graphHeight - this.padding - ((y - yMin) / (yMax - yMin)) * height
    },
    getXTicks() {
      const ticks = []
      const maxX = this.graphXMax
      const step = maxX <= 10 ? 1 : maxX <= 20 ? 2 : maxX <= 50 ? 5 : Math.ceil(maxX / 10)
      
      for (let i = 0; i <= maxX; i += step) {
        if (i >= this.graphXMin) {
          ticks.push({ value: i, label: i.toString() })
        }
      }
      
      // Always include the input value if it's not already there
      if (this.inputValue > 0 && this.result !== null) {
        const hasValue = ticks.some(tick => Math.abs(tick.value - this.inputValue) < 0.01)
        if (!hasValue) {
          ticks.push({ value: this.inputValue, label: this.inputValue.toString() })
          ticks.sort((a, b) => a.value - b.value)
        }
      }
      
      return ticks
    },
    getYTicks() {
      const ticks = []
      const maxY = this.graphYMax
      const minY = this.graphYMin
      const step = maxY <= 5 ? 0.5 : maxY <= 10 ? 1 : Math.ceil(maxY / 10)
      
      for (let y = 0; y <= maxY; y += step) {
        ticks.push({ value: y, label: y.toFixed(y % 1 === 0 ? 0 : 1) })
      }
      
      // Always include the result value if it's not already there
      if (this.result !== null && this.result > 0) {
        const hasValue = ticks.some(tick => Math.abs(tick.value - this.result) < 0.01)
        if (!hasValue && this.result <= maxY && this.result >= minY) {
          ticks.push({ value: this.result, label: this.formatResult(this.result) })
          ticks.sort((a, b) => a.value - b.value)
        }
      }
      
      return ticks
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
  gap: 0.5rem;
}

.input-prefix,
.input-suffix {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.number-input {
  width: 100%;
  max-width: 300px;
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

.logarithm-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.result-formula {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 2.5rem;
  font-weight: 700;
}

.formula-text {
  color: var(--text-primary);
}

.equals-sign {
  color: var(--text-secondary);
  font-weight: 400;
}

.result-value-box {
  padding: 1.5rem 3rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-value {
  font-size: 3rem;
  font-weight: 900;
  color: var(--primary-color);
  letter-spacing: -2px;
  line-height: 1;
}

.result-exact {
  margin-top: 1rem;
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.exact-label {
  opacity: 0.7;
  margin-right: 0.5rem;
}

.exact-value {
  font-weight: 600;
  color: var(--text-primary);
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
}

.info-value {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.125rem;
}

/* Graph Section */
.graph-section {
  margin-top: 3rem;
  padding-top: 3rem;
  border-top: 2px solid var(--border-light);
}

.graph-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.graph-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 1rem;
  padding: 1.5rem;
  overflow-x: auto;
  display: flex;
  justify-content: center;
}

.graph-svg {
  display: block;
  background: var(--bg-primary);
  border-radius: 0.5rem;
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
  
  .input-card {
    padding: 2rem 1.5rem;
  }
  
  .input-prefix,
  .input-suffix {
    font-size: 2.5rem;
  }
  
  .number-input {
    font-size: 1.75rem;
    padding: 1.25rem 1.5rem;
  }
  
  .result-value {
    font-size: 2.5rem;
  }
  
  .result-formula {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .graph-container {
    padding: 1rem;
  }
  
  .graph-svg {
    width: 100%;
    height: auto;
    max-width: 100%;
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

