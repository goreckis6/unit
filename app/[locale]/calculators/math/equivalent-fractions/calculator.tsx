'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';
import { useScrollToResult } from '@/hooks/useScrollToResult';

type Fraction = { n: bigint; d: bigint };

function absBigInt(x: bigint) {
  return x < 0n ? -x : x;
}

function gcdBigInt(a: bigint, b: bigint): bigint {
  let x = absBigInt(a);
  let y = absBigInt(b);
  while (y !== 0n) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function normalize(f: Fraction): Fraction {
  if (f.d === 0n) return f;
  if (f.n === 0n) return { n: 0n, d: 1n };
  const sign = f.d < 0n ? -1n : 1n;
  const n = f.n * sign;
  const d = f.d * sign;
  const g = gcdBigInt(n, d);
  return { n: n / g, d: d / g };
}

function parseInteger(raw: string): bigint | null {
  const s = raw.trim();
  if (!s) return null;
  if (!/^[+-]?\d+$/.test(s)) return null;
  try {
    return BigInt(s);
  } catch {
    return null;
  }
}

function formatFraction(f: Fraction): string {
  const nf = normalize(f);
  return `${nf.n.toString()}/${nf.d.toString()}`;
}

function formatRawFraction(f: Fraction): string {
  // Keep as-is (do NOT reduce), but keep denominator positive for display.
  if (f.d === 0n) return `${f.n.toString()}/0`;
  const sign = f.d < 0n ? -1n : 1n;
  const n = f.n * sign;
  const d = f.d * sign;
  return `${n.toString()}/${d.toString()}`;
}

function formatMixedNumber(f: Fraction): string {
  const nf = normalize(f);
  const sign = nf.n < 0n ? -1n : 1n;
  const nAbs = absBigInt(nf.n);
  const whole = nAbs / nf.d;
  const rem = nAbs % nf.d;
  if (rem === 0n) return (whole * sign).toString();
  if (whole === 0n) return `${sign < 0n ? '-' : ''}${rem.toString()}/${nf.d.toString()}`;
  return `${(whole * sign).toString()} ${rem.toString()}/${nf.d.toString()}`;
}

function formatDecimal(f: Fraction, precision: number): string {
  const nf = normalize(f);
  const sign = nf.n < 0n ? '-' : '';
  const nAbs = absBigInt(nf.n);
  const whole = nAbs / nf.d;
  let rem = nAbs % nf.d;

  let frac = '';
  for (let i = 0; i < precision; i++) {
    rem *= 10n;
    const digit = rem / nf.d;
    rem = rem % nf.d;
    frac += digit.toString();
  }
  frac = frac.replace(/0+$/, '');
  return frac ? `${sign}${whole.toString()}.${frac}` : `${sign}${whole.toString()}`;
}

type CalcState =
  | { ok: false; error: string }
  | {
      ok: true;
      input: Fraction;
      gcd: bigint;
      simplified: Fraction;
      maxMultiplier: number;
      equivalents: Array<{ k: number; frac: Fraction }>;
    };

export function EquivalentFractionsCalculator() {
  const t = useTranslations('calculators.equivalentFractions');

  const [numerator, setNumerator] = useState<string>('1');
  const [denominator, setDenominator] = useState<string>('2');
  const [maxMultiplier, setMaxMultiplier] = useState<string>('10');

  const [calc, setCalc] = useState<CalcState | null>(null);
  const resultRef = useScrollToResult(calc && calc.ok ? calc : null);

  const handleCalculate = () => {
    const n = parseInteger(numerator);
    const d = parseInteger(denominator);
    const max = Number.parseInt(maxMultiplier.trim(), 10);

    if (n === null || d === null || Number.isNaN(max)) {
      setCalc({ ok: false, error: t('errorInvalid') });
      return;
    }
    if (d === 0n) {
      setCalc({ ok: false, error: t('errorZeroDenominator') });
      return;
    }
    if (!Number.isFinite(max) || max < 2 || max > 50) {
      setCalc({ ok: false, error: t('errorMaxMultiplier') });
      return;
    }

    const input: Fraction = { n, d };
    const g = gcdBigInt(n, d);
    const simplified = normalize(input);

    const equivalents: Array<{ k: number; frac: Fraction }> = [];
    for (let k = 1; k <= max; k++) {
      // IMPORTANT: equivalent fractions should NOT be reduced back to simplest form,
      // otherwise every entry looks the same (e.g. 2/4 becomes 1/2).
      equivalents.push({ k, frac: { n: simplified.n * BigInt(k), d: simplified.d * BigInt(k) } });
    }

    setCalc({ ok: true, input, gcd: g, simplified, maxMultiplier: max, equivalents });
  };

  const handleReset = () => {
    setNumerator('1');
    setDenominator('2');
    setMaxMultiplier('10');
    setCalc(null);
  };

  const steps = useMemo(() => {
    if (!calc || !calc.ok) return null;
    const input = calc.input;
    const g = calc.gcd;
    const simplified = calc.simplified;
    return {
      step1: `${t('stepGcd')} gcd(${input.n.toString()}, ${input.d.toString()}) = ${g.toString()}`,
      step2: `${t('stepDivide')} ${input.n.toString()}/${input.d.toString()} = ${formatFraction(simplified)}`,
      step3: `${t('stepMultiply')} ${formatFraction(simplified)} × k/k`,
    };
  }, [calc, t]);

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <div className="input-label" style={{ marginBottom: '0.75rem' }}>
                {t('fractionLabel')}
              </div>

              <div className="input-with-unit" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem' }}>
                <input
                  value={numerator}
                  onChange={(e) => setNumerator(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  inputMode="numeric"
                  placeholder="1"
                  aria-label={t('numerator')}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>/</div>
                <input
                  value={denominator}
                  onChange={(e) => setDenominator(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  inputMode="numeric"
                  placeholder="2"
                  aria-label={t('denominator')}
                />
              </div>

              <div className="inputs-grid" style={{ marginTop: '1rem' }}>
                <div className="input-card">
                  <label htmlFor="maxMultiplier" className="input-label">
                    {t('maxMultiplier')}
                  </label>
                  <input
                    id="maxMultiplier"
                    value={maxMultiplier}
                    onChange={(e) => setMaxMultiplier(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    className="number-input"
                    inputMode="numeric"
                    placeholder="10"
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
              <div className="number-input" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t('resultPlaceholder')}</span>
              </div>
            )}

            {calc && !calc.ok && (
              <div className="number-input" style={{ minHeight: '200px', padding: '1.25rem' }}>
                <div style={{ fontWeight: 800, marginBottom: '0.5rem' }}>{t('errorTitle')}</div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{'error' in calc ? calc.error : ''}</div>
              </div>
            )}

            {calc && calc.ok && (
              <div
                className="number-input"
                style={{
                  minHeight: '200px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                  <div className="result-item">
                    <div className="result-label">{t('simplifiedFraction')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{formatFraction(calc.simplified)}</span>
                      <CopyButton text={formatFraction(calc.simplified)} />
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">{t('mixedNumber')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{formatMixedNumber(calc.simplified)}</span>
                      <CopyButton text={formatMixedNumber(calc.simplified)} />
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">{t('decimalValue')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{formatDecimal(calc.simplified, 12)}</span>
                      <CopyButton text={formatDecimal(calc.simplified, 12)} />
                    </div>
                  </div>
                </div>

                <div className="seo-content-card" style={{ marginTop: '0.25rem' }}>
                  <h3 className="example-heading">{t('equivalentsHeading')}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {calc.equivalents.map(({ k, frac }) => (
                      <div key={k} className="number-input result-value-box" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline', minWidth: 0 }}>
                          <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{t('multiplierLabel', { k })}</span>
                          <span className="result-value" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {formatRawFraction(frac)}
                          </span>
                        </div>
                        <CopyButton text={formatRawFraction(frac)} />
                      </div>
                    ))}
                  </div>
                </div>

                {steps && (
                  <div className="seo-content-card" style={{ marginTop: '0.25rem' }}>
                    <h3 className="example-heading">{t('stepsHeading')}</h3>
                    <div className="example-text" style={{ lineHeight: 1.8 }}>
                      <p>
                        <strong>{steps.step1}</strong>
                      </p>
                      <p>{steps.step2}</p>
                      <p>{steps.step3}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

