'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function add(a: number, b: number): number {
  return a + b;
}

export function AdditionCalculator() {
  const t = useTranslations('calculators.addition');
  const [first, setFirst] = useState<string>('');
  const [second, setSecond] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const a = parseFloat(first);
    const b = parseFloat(second);
    
    if (!isNaN(a) && !isNaN(b)) {
      setResult(add(a, b));
    } else {
      setResult(null);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="first">
          {t('firstNumber')}:
          <input
            id="first"
            type="number"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="second">
          {t('secondNumber')}:
          <input
            id="second"
            type="number"
            value={second}
            onChange={(e) => setSecond(e.target.value)}
            style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
          />
        </label>
      </div>
      <button
        onClick={handleCalculate}
        style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}
      >
        {t('calculate')}
      </button>
      {result !== null && (
        <div style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
          {t('result')}: {result}
        </div>
      )}
    </div>
  );
}
