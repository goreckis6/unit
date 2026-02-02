'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';
import { useScrollToResult } from '@/hooks/useScrollToResult';

function gcdBigInt(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

type Fraction = { n: bigint; d: bigint };

function normalizeFraction(f: Fraction): Fraction {
  if (f.d === 0n) return f;
  const sign = f.d < 0n ? -1n : 1n;
  const n = f.n * sign;
  const d = f.d * sign;
  const g = gcdBigInt(n, d);
  return { n: n / g, d: d / g };
}

function formatFraction(f: Fraction): string {
  return `${f.n.toString()}/${f.d.toString()}`;
}

function toFixedTrimmed(value: number, decimals: number): string {
  const fixed = value.toFixed(decimals);
  if (!fixed.includes('.')) return fixed;
  return fixed.replace(/(\.\d*?[1-9])0+$/g, '$1').replace(/\.0+$/g, '');
}

type CalcState =
  | { ok: false; error: string }
  | {
      ok: true;
      raw: Fraction;
      simplified: Fraction;
      decimal: number;
      decimals: number;
    };

export function FractionToDecimalCalculator() {
  const t = useTranslations('calculators.fractionToDecimal');

  const [numerator, setNumerator] = useState<string>('1');
  const [denominator, setDenominator] = useState<string>('2');
  const [decimalPlaces, setDecimalPlaces] = useState<string>('6');
  const [calc, setCalc] = useState<CalcState | null>(null);
  const resultRef = useScrollToResult(calc && calc.ok ? calc : null);

  const handleCalculate = () => {
    const n = Number.parseInt(numerator.trim(), 10);
    const d = Number.parseInt(denominator.trim(), 10);
    const places = Number.parseInt(decimalPlaces.trim(), 10);

    if (!Number.isFinite(n) || Number.isNaN(n) || !Number.isFinite(d) || Number.isNaN(d)) {
      setCalc({ ok: false, error: t('errorInvalid') });
      return;
    }
    if (!Number.isFinite(places) || Number.isNaN(places)) {
      setCalc({ ok: false, error: t('errorInvalid') });
      return;
    }
    if (d === 0) {
      setCalc({ ok: false, error: t('errorZeroDenominator') });
      return;
    }
    if (places < 0 || places > 12) {
      setCalc({ ok: false, error: t('errorDecimalPlaces') });
      return;
    }

    const raw: Fraction = { n: BigInt(n), d: BigInt(d) };
    const simplified = normalizeFraction(raw);
    const decimal = Number(n) / Number(d);
    setCalc({ ok: true, raw, simplified, decimal, decimals: places });
  };

  const handleReset = () => {
    setNumerator('1');
    setDenominator('2');
    setDecimalPlaces('6');
    setCalc(null);
  };

  const formatted = useMemo(() => {
    if (!calc || !calc.ok) return null;
    const decimalString = toFixedTrimmed(calc.decimal, calc.decimals);
    const simplifiedText = formatFraction(calc.simplified);
    return { decimalString, simplifiedText };
  }, [calc]);

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label className="input-label">{t('fractionLabel')}</label>
              <div className="fraction-inputs">
                <div className="input-wrapper">
                  <label htmlFor="numerator" className="fraction-label">
                    {t('numerator')}
                  </label>
                  <input
                    id="numerator"
                    value={numerator}
                    onChange={(e) => setNumerator(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    className="fraction-input"
                    inputMode="numeric"
                    placeholder="1"
                  />
                </div>
                <div className="fraction-divider"></div>
                <div className="input-wrapper">
                  <label htmlFor="denominator" className="fraction-label">
                    {t('denominator')}
                  </label>
                  <input
                    id="denominator"
                    value={denominator}
                    onChange={(e) => setDenominator(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    className="fraction-input"
                    inputMode="numeric"
                    placeholder="2"
                  />
                </div>
              </div>

              <div className="inputs-grid" style={{ marginTop: '1rem' }}>
                <div className="input-card">
                  <label htmlFor="decimalPlaces" className="input-label">
                    {t('decimalPlaces')}
                  </label>
                  <input
                    id="decimalPlaces"
                    value={decimalPlaces}
                    onChange={(e) => setDecimalPlaces(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    className="number-input"
                    inputMode="numeric"
                    placeholder="6"
                  />
                  <div style={{ marginTop: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {t('inputHint')}
                  </div>
                </div>
              </div>
            </div>

            <div className="action-buttons" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleCalculate} className="btn btn-primary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('calculate')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div ref={resultRef} className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card">
            <label className="input-label">{t('result')}</label>

            {!calc && (
              <div className="number-input" style={{ minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t('resultPlaceholder')}</span>
              </div>
            )}

            {calc && !calc.ok && (
              <div className="number-input" style={{ minHeight: '220px', padding: '1.25rem' }}>
                <div style={{ fontWeight: 800, marginBottom: '0.5rem' }}>{t('errorTitle')}</div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{calc.error}</div>
              </div>
            )}

            {calc && calc.ok && formatted && (
              <div
                className="number-input"
                style={{
                  minHeight: '220px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div className="result-item">
                  <div className="result-label">{t('decimalResult')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value">{formatted.decimalString}</span>
                    <CopyButton text={formatted.decimalString} />
                  </div>
                </div>

                <div className="result-item">
                  <div className="result-label">{t('simplifiedFraction')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value">{formatted.simplifiedText}</span>
                    <CopyButton text={formatted.simplifiedText} />
                  </div>
                </div>

                <div className="seo-content-card" style={{ marginTop: '0.25rem' }}>
                  <h3 className="example-heading">{t('stepsHeading')}</h3>
                  <div className="example-text" style={{ lineHeight: 1.8 }}>
                    <p>
                      <strong>{t('stepDivide')}</strong>
                    </p>
                    <p>{t('stepDivideText', { n: calc.simplified.n.toString(), d: calc.simplified.d.toString() })}</p>
                    <p>
                      <strong>{t('stepDecimal')}</strong>
                    </p>
                    <p>{t('stepDecimalText', { n: calc.simplified.n.toString(), d: calc.simplified.d.toString() })}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

