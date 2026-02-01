'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

interface PartialProduct {
  digit: string;
  placeValue: number;
  partial: bigint;
  shifted: bigint;
}

interface LongMultiplicationResult {
  multiplicand: string;
  multiplier: string;
  product: bigint;
  partials: PartialProduct[];
}

function parseNonNegativeBigInt(input: string): bigint | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  try {
    return BigInt(trimmed);
  } catch {
    return null;
  }
}

function buildLongMultiplication(multiplicand: bigint, multiplierStr: string): LongMultiplicationResult {
  const digits = multiplierStr.split('').reverse();
  const partials: PartialProduct[] = [];
  let product = 0n;
  let placeValue = 1;

  for (let i = 0; i < digits.length; i++) {
    const d = BigInt(digits[i]!);
    const partial = multiplicand * d;
    const shifted = partial * BigInt(placeValue);
    product += shifted;
    partials.push({
      digit: digits[i]!,
      placeValue,
      partial,
      shifted,
    });
    placeValue *= 10;
  }

  return {
    multiplicand: multiplicand.toString(),
    multiplier: multiplierStr,
    product,
    partials: partials.reverse(),
  };
}

export function LongMultiplicationCalculator() {
  const t = useTranslations('calculators.longMultiplication');

  const [multiplicand, setMultiplicand] = useState('123');
  const [multiplier, setMultiplier] = useState('45');
  const [result, setResult] = useState<LongMultiplicationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsedMultiplicand = useMemo(() => parseNonNegativeBigInt(multiplicand), [multiplicand]);
  const parsedMultiplier = useMemo(() => parseNonNegativeBigInt(multiplier), [multiplier]);
  const hasMultiplicand = multiplicand.trim().length > 0;
  const hasMultiplier = multiplier.trim().length > 0;
  const isMultiplicandValid = parsedMultiplicand !== null;
  const isMultiplierValid = parsedMultiplier !== null;
  const inlineError =
    (hasMultiplicand && parsedMultiplicand === null && t('errorInvalidMultiplicand')) ||
    (hasMultiplier && parsedMultiplier === null && t('errorInvalidMultiplier')) ||
    null;
  const displayError = error || inlineError;

  const computeResult = useCallback(
    (showErrors: boolean) => {
      const a = parseNonNegativeBigInt(multiplicand);
      if (a === null) {
        setResult(null);
        setError(showErrors ? t('errorInvalidMultiplicand') : null);
        return;
      }
      const b = parseNonNegativeBigInt(multiplier);
      if (b === null) {
        setResult(null);
        setError(showErrors ? t('errorInvalidMultiplier') : null);
        return;
      }

      const normA = a.toString();
      const normB = b.toString();
      const res = buildLongMultiplication(a, normB);
      setError(null);
      setResult(res);
    },
    [multiplicand, multiplier, t]
  );

  useEffect(() => {
    if (!multiplicand.trim() || !multiplier.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    computeResult(false);
  }, [multiplicand, multiplier, computeResult]);

  const handleReset = useCallback(() => {
    setMultiplicand('123');
    setMultiplier('45');
    setResult(null);
    setError(null);
  }, []);

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card numbers-to-letters-compact">
              <label htmlFor="multiplicand" className="input-label">
                {t('multiplicandLabel')}
              </label>
              <input
                id="multiplicand"
                type="text"
                inputMode="numeric"
                value={multiplicand}
                onChange={(e) => setMultiplicand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && computeResult(true)}
                className="number-input"
                placeholder={t('multiplicandPlaceholder')}
                style={{ minHeight: '44px' }}
              />
              <p className="seo-paragraph" style={{ marginTop: '0.75rem' }}>
                {t('multiplicandHelp')}
              </p>
            </div>

            <div className="input-card numbers-to-letters-compact">
              <label htmlFor="multiplier" className="input-label">
                {t('multiplierLabel')}
              </label>
              <input
                id="multiplier"
                type="text"
                inputMode="numeric"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && computeResult(true)}
                className="number-input"
                placeholder={t('multiplierPlaceholder')}
                style={{ minHeight: '44px' }}
              />
              <p className="seo-paragraph" style={{ marginTop: '0.75rem' }}>
                {t('multiplierHelp')}
              </p>
            </div>

            {displayError && (
              <p className="seo-paragraph" style={{ color: 'var(--error)', marginBottom: 0 }}>
                {displayError}
              </p>
            )}

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button
                onClick={() => computeResult(true)}
                className="btn btn-primary"
                style={{ minHeight: '44px' }}
                disabled={!isMultiplicandValid || !isMultiplierValid}
              >
                {t('calculate')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card">
            <label className="input-label">{t('resultLabel')}</label>
            <div
              className="number-input"
              style={{ minHeight: '160px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              {result ? (
                <>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                    {t('productValue', { value: result.product.toString() })}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {t('equation', { a: result.multiplicand, b: result.multiplier, p: result.product.toString() })}
                  </div>
                  {result.partials.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                        {t('stepsHeading')}
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'grid', gap: '0.35rem' }}>
                        {result.partials.map((step, idx) => (
                          <li key={idx}>
                            {t('stepLine', {
                              multiplicand: result.multiplicand,
                              digit: step.digit,
                              partial: step.partial.toString(),
                            })}
                            {step.placeValue > 1 &&
                              ` ${t('stepLineShifted', { shifted: step.shifted.toString() })}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <span style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
