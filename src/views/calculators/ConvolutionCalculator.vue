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
          <div class="title-badge">{{ $t('calculators.convolution.badge') }}</div>
          <h1 class="page-title">{{ $t('calculators.convolution.title') }}</h1>
          <p class="page-description">{{ $t('calculators.convolution.description') }}</p>
        </div>
      </div>

      <div class="calculator-container">
        <div class="calculator-card">
          <!-- Formula Display -->
          <div class="formula-display">
            <div class="formula-box">
              <span class="formula-label">{{ $t('calculators.convolution.formula') }}:</span>
              <span class="formula">(f * g)[n] = Σ f[k] × g[n-k]</span>
            </div>
          </div>

          <!-- Input Section -->
          <div class="input-section">
            <div class="input-row">
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.convolution.sequence1') }}</label>
                <input
                  v-model="sequence1"
                  type="text"
                  class="text-input"
                  :placeholder="$t('calculators.convolution.placeholder')"
                  @input="validateInput"
                  @keyup.enter="calculate"
                />
                <p class="input-hint">{{ $t('calculators.convolution.inputHint') }}</p>
              </div>
              
              <div class="input-card">
                <label class="input-label">{{ $t('calculators.convolution.sequence2') }}</label>
                <input
                  v-model="sequence2"
                  type="text"
                  class="text-input"
                  :placeholder="$t('calculators.convolution.placeholder')"
                  @input="validateInput"
                  @keyup.enter="calculate"
                />
                <p class="input-hint">{{ $t('calculators.convolution.inputHint') }}</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button @click="calculate" class="btn btn-primary" :disabled="!canCalculate">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('calculators.convolution.calculate') }}</span>
              </button>
              <button @click="clear" class="btn btn-secondary">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('calculators.convolution.clear') }}</span>
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
                  {{ $t('calculators.convolution.result') }}
                </div>
              </div>

              <div class="result-display">
                <div class="convolution-result">
                  <div class="result-formula">
                    <span class="formula-text">{{ parsedSequence1.join(', ') }} * {{ parsedSequence2.join(', ') }}</span>
                  </div>
                  <div class="result-value-box">
                    <div class="result-label">{{ $t('calculators.convolution.convolutionResult') }}:</div>
                    <div class="result-sequence">{{ result.join(', ') }}</div>
                  </div>
                </div>
              </div>

              <!-- Convolution Steps -->
              <div v-if="steps.length > 0" class="steps-section">
                <div class="steps-header">
                  <svg class="steps-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <h4 class="steps-title">{{ $t('calculators.convolution.stepByStep') }}</h4>
                </div>

                <div class="steps-visualization">
                  <div class="step-item" v-for="(step, index) in steps" :key="index">
                    <div class="step-number">{{ index + 1 }}</div>
                    <div class="step-content">
                      <div class="step-description">{{ step.description }}</div>
                      <div class="step-calculation">{{ step.calculation }}</div>
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
            <h2 class="seo-heading">{{ $t('calculators.convolution.seo.content.heading') }}</h2>
            
            <div class="seo-paragraphs">
              <p class="seo-paragraph">
                {{ $t('calculators.convolution.seo.content.paragraph1') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.convolution.seo.content.paragraph2') }}
              </p>
              
              <p class="seo-paragraph">
                {{ $t('calculators.convolution.seo.content.paragraph3') }}
              </p>
              
              <div class="seo-example">
                <h3 class="example-heading">{{ $t('calculators.convolution.seo.content.exampleHeading') }}</h3>
                <p class="example-text">{{ $t('calculators.convolution.seo.content.exampleText') }}</p>
              </div>
              
              <p class="seo-paragraph">
                {{ $t('calculators.convolution.seo.content.paragraph4') }}
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
  name: 'ConvolutionCalculator',
  components: {
    Navbar
  },
  data() {
    return {
      sequence1: '',
      sequence2: '',
      result: null,
      error: '',
      steps: [],
      parsedSequence1: [],
      parsedSequence2: []
    }
  },
  computed: {
    canCalculate() {
      return this.sequence1.trim() !== '' && this.sequence2.trim() !== ''
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
      
      document.title = this.$t('calculators.convolution.seo.title')
      
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', this.$t('calculators.convolution.seo.description'))
      
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', this.$t('calculators.convolution.seo.keywords'))
      
      document.documentElement.lang = locale
      
      this.updateOpenGraph()
    },
    updateOpenGraph() {
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      ogTitle.setAttribute('content', this.$t('calculators.convolution.seo.title'))
      if (!document.querySelector('meta[property="og:title"]')) {
        document.head.appendChild(ogTitle)
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      ogDescription.setAttribute('content', this.$t('calculators.convolution.seo.description'))
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
    parseSequence(input) {
      if (!input || input.trim() === '') return []
      
      // Split by comma or space, then parse each value
      const parts = input.split(/[,\s]+/).filter(p => p.trim() !== '')
      return parts.map(p => {
        const num = parseFloat(p.trim())
        if (isNaN(num)) {
          throw new Error('Invalid number')
        }
        return num
      })
    },
    validateInput() {
      this.error = ''
      try {
        if (this.sequence1.trim() !== '') {
          this.parseSequence(this.sequence1)
        }
        if (this.sequence2.trim() !== '') {
          this.parseSequence(this.sequence2)
        }
      } catch (e) {
        // Error will be shown on calculate
      }
    },
    convolve(seq1, seq2) {
      const result = []
      const steps = []
      
      // Length of convolution result
      const resultLength = seq1.length + seq2.length - 1
      
      for (let n = 0; n < resultLength; n++) {
        let sum = 0
        const stepProducts = []
        
        for (let k = 0; k <= n; k++) {
          const idx1 = k
          const idx2 = n - k
          
          if (idx1 < seq1.length && idx2 < seq2.length) {
            const product = seq1[idx1] * seq2[idx2]
            sum += product
            stepProducts.push({
              k,
              idx1,
              idx2,
              val1: seq1[idx1],
              val2: seq2[idx2],
              product
            })
          }
        }
        
        result.push(sum)
        
        // Create step description
        const productsStr = stepProducts.map(p => 
          `f[${p.idx1}]×g[${p.idx2}] = ${p.val1}×${p.val2} = ${p.product}`
        ).join(' + ')
        
        const stepDescription = this.$t('calculators.convolution.steps.step')
          .replace('{n}', n)
          .replace('{sum}', sum)
        
        steps.push({
          description: stepDescription,
          calculation: `(f * g)[${n}] = ${productsStr} = ${sum}`
        })
      }
      
      return { result, steps }
    },
    calculate() {
      this.error = ''
      this.steps = []
      this.result = null
      
      try {
        const seq1 = this.parseSequence(this.sequence1)
        const seq2 = this.parseSequence(this.sequence2)
        
        if (seq1.length === 0 || seq2.length === 0) {
          this.error = this.$t('calculators.convolution.error.emptySequence')
          return
        }
        
        if (seq1.length > 20 || seq2.length > 20) {
          this.error = this.$t('calculators.convolution.error.tooLong')
          return
        }
        
        this.parsedSequence1 = seq1
        this.parsedSequence2 = seq2
        
        const { result, steps } = this.convolve(seq1, seq2)
        this.result = result
        this.steps = steps
      } catch (e) {
        this.error = this.$t('calculators.convolution.error.invalidInput')
      }
    },
    clear() {
      this.sequence1 = ''
      this.sequence2 = ''
      this.result = null
      this.error = ''
      this.steps = []
      this.parsedSequence1 = []
      this.parsedSequence2 = []
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

.formula-display {
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%);
  border-radius: 1.5rem;
  border: 2px solid rgba(99, 102, 241, 0.15);
}

.formula-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.formula-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.formula {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: var(--primary-color);
}

.input-section {
  margin-bottom: 2rem;
}

.input-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.input-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
  border: 2px solid var(--border-light);
  border-radius: 1.5rem;
  padding: 2.5rem;
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

.text-input {
  width: 100%;
  padding: 1.5rem 2rem;
  border: 2px solid var(--border-color);
  border-radius: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
}

.text-input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  transform: scale(1.02);
}

.input-hint {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
  font-style: italic;
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

.convolution-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.result-formula {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
}

.result-value-box {
  padding: 1.5rem 3rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 300px;
}

.result-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.result-sequence {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
  font-family: 'Courier New', monospace;
  word-break: break-word;
}

.steps-section {
  margin-top: 3rem;
  padding-top: 3rem;
  border-top: 2px solid var(--border-light);
}

.steps-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.steps-icon {
  width: 28px;
  height: 28px;
  color: var(--primary-color);
}

.steps-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.steps-visualization {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  border: 1px solid var(--border-light);
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-description {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.step-calculation {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-light);
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
  
  .input-row {
    grid-template-columns: 1fr;
  }
  
  .input-card {
    padding: 2rem 1.5rem;
  }
  
  .text-input {
    font-size: 1.25rem;
    padding: 1.25rem 1.5rem;
  }
  
  .result-sequence {
    font-size: 1.5rem;
  }
  
  .result-formula {
    font-size: 1.25rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .step-calculation {
    font-size: 0.875rem;
  }
  
  .seo-content-card {
    padding: 2rem 1.5rem;
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

