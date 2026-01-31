'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

interface LongDivisionStep {
  index: number;
  digit: string;
  partialDividend: bigint;
  quotientDigit: bigint;
  product: bigint;
  remainder: bigint;
  nextDigit?: string;
}

interface LongDivisionResult {
  dividend: string;
  divisor: string;
  quotient: bigint;
  remainder: bigint;
  steps: LongDivisionStep[];
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

function buildLongDivisionSteps(dividend: string, divisor: bigint): LongDivisionStep[] {
  const digits = dividend.split('');
  let remainder = 0n;

  return digits.map((digit, index) => {
    const partialDividend = remainder * 10n + BigInt(digit);
    const quotientDigit = partialDividend / divisor;
    const product = quotientDigit * divisor;
    const newRemainder = partialDividend - product;
    remainder = newRemainder;

    return {
      index: index + 1,
      digit,
      partialDividend,
      quotientDigit,
      product,
      remainder: newRemainder,
      nextDigit: index < digits.length - 1 ? digits[index + 1] : undefined,
    };
  });
}

export function LongDivisionCalculator() {
  const t = useTranslations('calculators.longDivision');

  const [dividend, setDividend] = useState('487');
  const [divisor, setDivisor] = useState('32');
  const [result, setResult] = useState<LongDivisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const computeResult = useCallback(
    (showErrors: boolean) => {
      const parsedDividend = parseNonNegativeBigInt(dividend);
      if (parsedDividend === null) {
        setResult(null);
        setError(showErrors ? t('errorInvalidDividend') : null);
        return;
      }

      const parsedDivisor = parseNonNegativeBigInt(divisor);
      if (parsedDivisor === null) {
        setResult(null);
        setError(showErrors ? t('errorInvalidDivisor') : null);
        return;
      }

      if (parsedDivisor === 0n) {
        setResult(null);
        setError(showErrors ? t('errorDivisionByZero') : null);
        return;
      }

      const normalizedDividend = parsedDividend.toString();
      const normalizedDivisor = parsedDivisor.toString();
      const quotient = parsedDividend / parsedDivisor;
      const remainder = parsedDividend % parsedDivisor;
      const steps = buildLongDivisionSteps(normalizedDividend, parsedDivisor);

      setError(null);
      setResult({
        dividend: normalizedDividend,
        divisor: normalizedDivisor,
        quotient,
        remainder,
        steps,
      });
    },
    [dividend, divisor, t]
  );

  useEffect(() => {
    if (!dividend.trim() || !divisor.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    computeResult(false);
  }, [dividend, divisor, computeResult]);

  const display = useMemo(() => {
    if (!result) return null;
    return {
      dividend: result.dividend,
      divisor: result.divisor,
      quotient: result.quotient.toString(),
      remainder: result.remainder.toString(),
      steps: result.steps,
    };
  }, [result]);

  const handleReset = useCallback(() => {
    setDividend('487');
    setDivisor('32');
    setResult(null);
    setError(null);
  }, []);

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card numbers-to-letters-compact">
              <label htmlFor="dividend" className="input-label">
                {t('dividendLabel')}
              </label>
              <input
                id="dividend"
                type="text"
                inputMode="numeric"
                value={dividend}
                onChange={(event) => setDividend(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && computeResult(true)}
                className="number-input"
                placeholder={t('dividendPlaceholder')}
                style={{ minHeight: '44px' }}
              />
              <p className="seo-paragraph" style={{ marginTop: '0.75rem' }}>
                {t('dividendHelp')}
              </p>
            </div>

            <div className="input-card numbers-to-letters-compact">
              <label htmlFor="divisor" className="input-label">
                {t('divisorLabel')}
              </label>
              <input
                id="divisor"
                type="text"
                inputMode="numeric"
                value={divisor}
                onChange={(event) => setDivisor(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && computeResult(true)}
                className="number-input"
                placeholder={t('divisorPlaceholder')}
                style={{ minHeight: '44px' }}
              />
              <p className="seo-paragraph" style={{ marginTop: '0.75rem' }}>
                {t('divisorHelp')}
              </p>
            </div>

            {error && (
              <p className="seo-paragraph" style={{ color: 'var(--error)', marginBottom: 0 }}>
                {error}
              </p>
            )}

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button onClick={() => computeResult(true)} className="btn btn-primary" style={{ minHeight: '44px' }}>
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
            <div className="number-input" style={{ minHeight: '160px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {display ? (
                <>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{t('quotientValue', { value: display.quotient })}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{t('remainderValue', { value: display.remainder })}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {t('equation', { a: display.dividend, b: display.divisor, q: display.quotient, r: display.remainder })}
                  </div>
                  <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t('diagramLabel')} </span>
                    {t('divisionDiagram', {
                      divisor: display.divisor,
                      dividend: display.dividend,
                      quotient: display.quotient,
                      remainder: display.remainder,
                    })}
                  </div>
                </>
              ) : (
                <span style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>—</span>
              )}
            </div>
          </div>

          {display && (
            <div className="input-card" style={{ marginTop: '1.25rem' }}>
              <label className="input-label">{t('stepsHeading')}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
                {display.steps.map((step) => (
                  <div key={step.index} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>
                      {t('stepLabel', { step: step.index })}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {t('bringDown', { digit: step.digit, value: step.partialDividend.toString() })}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {t('divide', { partial: step.partialDividend.toString(), divisor: display.divisor, quotientDigit: step.quotientDigit.toString() })}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {t('multiply', { quotientDigit: step.quotientDigit.toString(), divisor: display.divisor, product: step.product.toString() })}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {t('subtract', { partial: step.partialDividend.toString(), product: step.product.toString(), remainder: step.remainder.toString() })}
                    </div>
                    {step.nextDigit && (
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {t('nextDigit', { digit: step.nextDigit })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
