import { component$, useSignal, useStyles$, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  const firstNumber = useSignal('');
  const secondNumber = useSignal('');
  const result = useSignal<number | null>(null);
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
    
    .addition-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .number-input {
      flex: 1;
      padding: 1rem;
      font-size: 1.5rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      text-align: center;
    }
    
    .number-input:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .operator {
      font-size: 3rem;
      color: #667eea;
      font-weight: 800;
    }
    
    .buttons {
      display: flex;
      gap: 1rem;
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
    
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3); }
    
    .btn-secondary {
      background: #e2e8f0;
      color: #2d3748;
    }
    
    .btn-secondary:hover { background: #cbd5e0; }
    
    .result-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 3rem;
      text-align: center;
      color: white;
    }
    
    .result-label {
      font-size: 1.2rem;
      margin-bottom: 1rem;
      opacity: 0.9;
    }
    
    .result-value {
      font-size: 4rem;
      font-weight: 900;
      margin-bottom: 1rem;
    }
    
    .result-formula {
      font-size: 1.5rem;
      opacity: 0.8;
    }
    
    .error {
      background: #fed7d7;
      color: #c53030;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    
    @media (max-width: 768px) {
      .addition-row { flex-direction: column; }
      .operator { font-size: 2rem; }
      .result-value { font-size: 3rem; }
    }
  `);

  const calculate = $(() => {
    error.value = '';
    const a = parseFloat(firstNumber.value);
    const b = parseFloat(secondNumber.value);
    
    if (isNaN(a) || isNaN(b)) {
      error.value = 'Please enter valid numbers';
      result.value = null;
      return;
    }
    
    result.value = a + b;
  });

  const clear = $(() => {
    firstNumber.value = '';
    secondNumber.value = '';
    result.value = null;
    error.value = '';
  });

  return (
    <div class="container">
      <a href="/calculators/math-calculators" class="back-link">← Back to Math Calculators</a>
      <h1>Addition Calculator</h1>
      <p class="description">Add two numbers together quickly and accurately</p>
      
      <div class="calculator-card">
        <div class="addition-row">
          <input
            type="number"
            class="number-input"
            placeholder="First number"
            value={firstNumber.value}
            onInput$={(e) => firstNumber.value = (e.target as HTMLInputElement).value}
          />
          <span class="operator">+</span>
          <input
            type="number"
            class="number-input"
            placeholder="Second number"
            value={secondNumber.value}
            onInput$={(e) => secondNumber.value = (e.target as HTMLInputElement).value}
          />
        </div>

        {error.value && (
          <div class="error">{error.value}</div>
        )}

        <div class="buttons">
          <button onClick$={calculate} class="btn btn-primary">Calculate</button>
          <button onClick$={clear} class="btn btn-secondary">Clear</button>
        </div>

        {result.value !== null && !error.value && (
          <div class="result-section">
            <div class="result-label">Result</div>
            <div class="result-value">{result.value}</div>
            <div class="result-formula">
              {firstNumber.value} + {secondNumber.value} = {result.value}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Addition Calculator - Free Online Math Tool',
  meta: [
    {
      name: 'description',
      content: 'Free online addition calculator. Add two numbers together quickly and accurately with our simple calculator tool.',
    },
    {
      property: 'og:title',
      content: 'Addition Calculator - Unit Converter Hub',
    },
  ],
};
