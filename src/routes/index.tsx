import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  const popularCalculators = [
    { name: 'Percentage Calculator', url: '/calculators/percentage-calculator' },
    { name: 'Fraction Calculator', url: '/calculators/adding-fractions-calculator' },
    { name: 'Square Root Calculator', url: '/calculators/square-root-calculator' },
    { name: 'Multiplication Calculator', url: '/calculators/multiplication-calculator' },
    { name: 'Division Calculator', url: '/calculators/division-calculator' },
    { name: 'Exponent Calculator', url: '/calculators/exponent-calculator' },
    { name: 'Power Calculator', url: '/calculators/power-calculator' },
    { name: 'Quadratic Equation', url: '/calculators/quadratic-equation-calculator' },
    { name: 'Watts to Amps', url: '/calculators/watts-to-amps-calculator' },
    { name: 'Volts to Watts', url: '/calculators/volts-to-watts-calculator' },
    { name: 'Ohms Law Calculator', url: '/calculators/ohms-law-calculator' },
    { name: 'Energy Calculator', url: '/calculators/energy-consumption-calculator' },
  ];

  return (
    <div class="home">
      <section class="hero">
        <h1>Unit Converter Hub</h1>
        <p class="subtitle">Free Online Calculators & Unit Converters</p>
        <p class="description">
          Fast, accurate, and easy-to-use tools for all your calculation needs.
          From math calculators to electrical converters - we've got you covered!
        </p>
        <div class="cta-buttons">
          <Link href="/calculators/math-calculators" class="btn btn-primary">
            Browse All Calculators
          </Link>
        </div>
      </section>

      <section class="popular-tools">
        <h2>Popular Calculators</h2>
        <div class="calculator-grid">
          {popularCalculators.map((calc) => (
            <Link key={calc.url} href={calc.url} class="calculator-card">
              <h3>{calc.name}</h3>
              <span class="arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section class="features">
        <div class="feature">
          <h3>⚡ Fast & Accurate</h3>
          <p>Instant calculations with precise results</p>
        </div>
        <div class="feature">
          <h3>📱 Mobile Friendly</h3>
          <p>Works perfectly on any device</p>
        </div>
        <div class="feature">
          <h3>🆓 Completely Free</h3>
          <p>No sign-up or payment required</p>
        </div>
      </section>

      <style>{`
        .home {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .hero {
          text-align: center;
          padding: 4rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px;
          margin-bottom: 4rem;
        }

        .hero h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          font-weight: 800;
        }

        .subtitle {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          opacity: 0.95;
        }

        .description {
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto 2rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 1rem 2rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-primary {
          background: white;
          color: #667eea;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .popular-tools {
          margin-bottom: 4rem;
        }

        .popular-tools h2 {
          font-size: 2rem;
          margin-bottom: 2rem;
          text-align: center;
          color: #333;
        }

        .calculator-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .calculator-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          text-decoration: none;
          color: #333;
          border: 2px solid #e0e0e0;
          transition: all 0.3s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .calculator-card:hover {
          border-color: #667eea;
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .calculator-card h3 {
          font-size: 1.1rem;
          margin: 0;
          font-weight: 600;
        }

        .calculator-card .arrow {
          font-size: 1.5rem;
          color: #667eea;
          transition: transform 0.3s;
        }

        .calculator-card:hover .arrow {
          transform: translateX(4px);
        }

        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 4rem;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 16px;
        }

        .feature {
          text-align: center;
          padding: 1rem;
        }

        .feature h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .feature p {
          color: #666;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 1.2rem;
          }

          .calculator-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Unit Converter Hub - Free Online Calculators & Converters',
  meta: [
    {
      name: 'description',
      content: 'Free online calculators and unit converters for math, electrical, and more. Fast, accurate, and easy to use tools for all your calculation needs.',
    },
  ],
};
