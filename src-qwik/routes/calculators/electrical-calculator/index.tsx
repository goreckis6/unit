import { component$, useStyles$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  useStyles$(`
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
    .back-link { color: #667eea; text-decoration: none; font-weight: 600; margin-bottom: 2rem; display: inline-block; }
    .back-link:hover { opacity: 0.8; }
    h1 { font-size: 2.5rem; font-weight: 800; color: #1a202c; margin-bottom: 0.5rem; }
    .description { font-size: 1.1rem; color: #718096; margin-bottom: 3rem; line-height: 1.7; }
    
    .calculators-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .calculator-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 2rem;
      text-decoration: none;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .calculator-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(102, 126, 234, 0.15);
      border-color: #667eea;
    }
    
    .calculator-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }
    
    .calculator-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0;
    }
    
    .calculator-description {
      font-size: 1rem;
      color: #718096;
      line-height: 1.6;
      margin: 0;
    }
  `);

  return (
    <div class="container">
      <a href="/" class="back-link">← Back to Home</a>
      <h1>Electrical Calculators</h1>
      <p class="description">
        Professional electrical calculators for power, voltage, current, and energy calculations.
      </p>
      
      <div class="calculators-grid">
        <a href="/calculators/wire-gauge-calculator" class="calculator-card">
          <div class="calculator-icon">⚡</div>
          <h3 class="calculator-name">Wire Gauge Calculator</h3>
          <p class="calculator-description">
            Calculate the appropriate wire gauge for your electrical project
          </p>
        </a>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Electrical Calculators - Professional Electrical Tools',
  meta: [
    {
      name: 'description',
      content: 'Professional electrical calculators for power, voltage, current, and energy calculations. Accurate tools for electricians and engineers.',
    },
    {
      property: 'og:title',
      content: 'Electrical Calculators - Unit Converter Hub',
    },
  ],
};
