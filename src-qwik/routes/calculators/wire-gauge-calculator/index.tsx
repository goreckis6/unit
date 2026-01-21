import { component$, useSignal, useStyles$, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  const current = useSignal('');
  const length = useSignal('');
  const voltage = useSignal('230');
  const result = useSignal('');
  const error = useSignal('');

  useStyles$(`
    .container { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
    .back-link { color: #667eea; text-decoration: none; font-weight: 600; margin-bottom: 2rem; display: inline-block; }
    .back-link:hover { opacity: 0.8; }
    h1 { font-size: 2.5rem; font-weight: 800; color: #1a202c; margin-bottom: 0.5rem; }
    .description { font-size: 1.1rem; color: #718096; margin-bottom: 3rem; }
    
    .calculator-card {
      background: white;
      border-radius: 16px;
      padding: 3rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    
    .input-group {
      margin-bottom: 1.5rem;
    }
    
    .label {
      display: block;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }
    
    .input {
      width: 100%;
      padding: 1rem;
      font-size: 1.1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
    }
    
    .input:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .buttons {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      margin-bottom: 2rem;
    }
    
    .btn {
      flex: 1;
      padding: 1rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .btn-primary:hover { transform: translateY(-2px); }
    
    .btn-secondary {
      background: #e2e8f0;
      color: #2d3748;
    }
    
    .result-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      color: white;
      margin-top: 2rem;
    }
    
    .result-text {
      font-size: 1.8rem;
      font-weight: 700;
    }
    
    .error {
      background: #fed7d7;
      color: #c53030;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
  `);

  // ❌ TEMPORARILY DISABLED FOR SSR DEBUG - QRL serialization test
  // const calculate = $(() => {
  //   error.value = '';
  //   const curr = parseFloat(current.value);
  //   const len = parseFloat(length.value);
  //   
  //   if (isNaN(curr) || isNaN(len)) {
  //     error.value = 'Please enter valid numbers';
  //     result.value = '';
  //     return;
  //   }
  //   
  //   if (curr <= 0 || len <= 0) {
  //     error.value = 'Values must be greater than 0';
  //     result.value = '';
  //     return;
  //   }
  //   
  //   // Simple wire gauge calculation (AWG)
  //   let gauge = '';
  //   if (curr <= 0.5) gauge = 'AWG 20';
  //   else if (curr <= 1) gauge = 'AWG 18';
  //   else if (curr <= 2) gauge = 'AWG 16';
  //   else if (curr <= 3.5) gauge = 'AWG 14';
  //   else if (curr <= 5) gauge = 'AWG 12';
  //   else if (curr <= 10) gauge = 'AWG 10';
  //   else if (curr <= 15) gauge = 'AWG 8';
  //   else if (curr <= 20) gauge = 'AWG 6';
  //   else gauge = 'AWG 4 or larger';
  //   
  //   result.value = gauge;
  // });

  // const clear = $(() => {
  //   current.value = '';
  //   length.value = '';
  //   voltage.value = '230';
  //   result.value = '';
  //   error.value = '';
  // });
  
  // ✅ TEST: Plain functions (no QRL)
  const calculate = () => {
    // Disabled for SSR test
  };
  
  const clear = () => {
    // Disabled for SSR test
  };

  return (
    <div class="container">
      <a href="/calculators/electrical-calculator" class="back-link">← Back to Electrical Calculators</a>
      <h1>Wire Gauge Calculator</h1>
      <p class="description">Calculate the appropriate wire gauge for your electrical needs</p>
      
      <div class="calculator-card">
        <div class="input-group">
          <label class="label">Current (Amps)</label>
          <input
            type="number"
            class="input"
            placeholder="Enter current in amps"
            value={current.value}
            // ❌ DISABLED: onInput$={(e) => current.value = (e.target as HTMLInputElement).value}
          />
        </div>

        <div class="input-group">
          <label class="label">Wire Length (meters)</label>
          <input
            type="number"
            class="input"
            placeholder="Enter wire length"
            value={length.value}
            // ❌ DISABLED: onInput$={(e) => length.value = (e.target as HTMLInputElement).value}
          />
        </div>

        <div class="input-group">
          <label class="label">Voltage (V)</label>
          <input
            type="number"
            class="input"
            value={voltage.value}
            // ❌ DISABLED: onInput$={(e) => voltage.value = (e.target as HTMLInputElement).value}
          />
        </div>

        {error.value && (
          <div class="error">{error.value}</div>
        )}

        <div class="buttons">
          <button /* onClick$={calculate} */ class="btn btn-primary">Calculate</button>
          <button /* onClick$={clear} */ class="btn btn-secondary">Clear</button>
        </div>

        {result.value && !error.value && (
          <div class="result-section">
            <div class="result-text">Recommended Wire Gauge: {result.value}</div>
          </div>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Wire Gauge Calculator - Electrical Tool',
  meta: [
    {
      name: 'description',
      content: 'Calculate the appropriate wire gauge (AWG) for your electrical project based on current, length, and voltage.',
    },
    {
      property: 'og:title',
      content: 'Wire Gauge Calculator - Unit Converter Hub',
    },
  ],
};
