<template>
  <div class="home">
    <Navbar />
    
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Unit Converter Hub</h1>
          <p class="hero-subtitle">Free Online Calculators & Unit Converters</p>
          <p class="hero-description">
            Fast, accurate, and easy-to-use tools for all your calculation needs. 
            From basic arithmetic to complex electrical calculations.
          </p>
        </div>
      </div>
    </section>

    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">Calculator Categories</h2>
        <p class="section-subtitle">Explore our collection of calculators</p>
        <div class="categories-grid">
          <router-link to="/calculators/math-calculators" class="category-card">
            <div class="category-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="category-name">Math Calculators</h3>
            <p class="category-description">
              Essential math calculators for arithmetic, algebra, and more
            </p>
            <span class="category-link">View Calculator →</span>
          </router-link>
          
          <router-link to="/calculators/electrical-calculator" class="category-card">
            <div class="category-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="category-name">Electrical Calculators</h3>
            <p class="category-description">
              Professional electrical calculators for power, voltage, and current
            </p>
            <span class="category-link">View Calculator →</span>
          </router-link>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="container">
        <h2 class="section-title">Why Choose Unit Converter Hub?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3 class="feature-title">Lightning Fast</h3>
            <p class="feature-description">Instant calculations with accurate results every time</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🆓</div>
            <h3 class="feature-title">100% Free</h3>
            <p class="feature-description">All calculators are completely free with no hidden fees</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3 class="feature-title">Mobile Friendly</h3>
            <p class="feature-description">Works perfectly on smartphones, tablets, and desktops</p>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'

export default {
  name: 'Home',
  components: {
    Navbar,
    Footer
  }
}
</script>

<style scoped>
.home {
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6rem 2rem;
  text-align: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  font-weight: 600;
  opacity: 0.95;
}

.hero-description {
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto;
  opacity: 0.9;
  line-height: 1.8;
}

.categories-section {
  padding: 6rem 2rem;
  background: white;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 1rem;
  color: #1a202c;
}

.section-subtitle {
  font-size: 1.2rem;
  text-align: center;
  color: #718096;
  margin-bottom: 4rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.category-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 3rem;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.category-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}

.category-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.category-description {
  font-size: 1.1rem;
  color: #718096;
  line-height: 1.7;
  margin: 0;
}

.category-link {
  color: #667eea;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: auto;
}

.features-section {
  padding: 6rem 2rem;
  background: #f7fafc;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  margin-top: 4rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
}

.feature-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
}

.feature-description {
  font-size: 1.1rem;
  color: #718096;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.4rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 2rem;
  }

  .category-card {
    padding: 2rem;
  }
}
</style>
