'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';
import { useScrollToResult } from '@/hooks/useScrollToResult';

type Rational = {
  n: bigint; // numerator
  d: bigint; // denominator (>0)
};

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

function normalize(r: Rational): Rational {
  if (r.d === 0n) return r;
  if (r.n === 0n) return { n: 0n, d: 1n };
  const sign = r.d < 0n ? -1n : 1n;
  const n = r.n * sign;
  const d = r.d * sign;
  const g = gcdBigInt(n, d);
  return { n: n / g, d: d / g };
}

function pow10BigInt(exp: number): bigint {
  let result = 1n;
  for (let i = 0; i < exp; i++) result *= 10n;
  return result;
}

function parseDecimalToRational(raw: string): Rational | null {
  const s = raw.trim();
  if (!s) return null;
  if (/[eE]/.test(s)) return null; // keep parsing predictable (no scientific notation)

  const sign = s.startsWith('-') ? -1n : 1n;
  const unsigned = s.replace(/^[+-]/, '');

  if (!/^\d+(\.\d+)?$/.test(unsigned)) return null;

  const [intPart, fracPart] = unsigned.split('.');
  const fracLen = fracPart ? fracPart.length : 0;
  const digits = `${intPart}${fracPart ?? ''}`.replace(/^0+(?=\d)/, '');
  const n = digits ? BigInt(digits) * sign : 0n;
  const d = fracLen ? pow10BigInt(fracLen) : 1n;
  return normalize({ n, d });
}

function parseRational(raw: string): Rational | null {
  const s = raw.trim();
  if (!s) return null;
  const cleaned = s.replace(/\s+/g, '');
  const slashIndex = cleaned.indexOf('/');
  if (slashIndex === -1) {
    return parseDecimalToRational(cleaned);
  }
  const left = cleaned.slice(0, slashIndex);
  const right = cleaned.slice(slashIndex + 1);
  if (!left || !right) return null;
  const a = parseDecimalToRational(left);
  const b = parseDecimalToRational(right);
  if (!a || !b) return null;
  // (a) / (b) for rationals
  if (b.n === 0n) return null;
  return normalize({ n: a.n * b.d, d: a.d * b.n });
}

function multiply(a: Rational, b: Rational): Rational {
  return normalize({ n: a.n * b.n, d: a.d * b.d });
}

function divide(a: Rational, b: Rational): Rational | null {
  if (b.n === 0n) return null;
  return normalize({ n: a.n * b.d, d: a.d * b.n });
}

function formatFraction(r: Rational): string {
  const rr = normalize(r);
  return `${rr.n.toString()}/${rr.d.toString()}`;
}

function formatMixedNumber(r: Rational): string {
  const rr = normalize(r);
  const sign = rr.n < 0n ? -1n : 1n;
  const nAbs = rr.n < 0n ? -rr.n : rr.n;
  const whole = nAbs / rr.d;
  const rem = nAbs % rr.d;
  if (rem === 0n) return (whole * sign).toString();
  if (whole === 0n) return `${(sign < 0n ? '-' : '')}${rem.toString()}/${rr.d.toString()}`;
  return `${(whole * sign).toString()} ${rem.toString()}/${rr.d.toString()}`;
}

function formatDecimal(r: Rational, precision: number): string {
  const rr = normalize(r);
  const sign = rr.n < 0n ? '-' : '';
  const nAbs = rr.n < 0n ? -rr.n : rr.n;
  const whole = nAbs / rr.d;
  let rem = nAbs % rr.d;

  let frac = '';
  for (let i = 0; i < precision; i++) {
    rem *= 10n;
    const digit = rem / rr.d;
    rem = rem % rr.d;
    frac += digit.toString();
  }
  // trim trailing zeros
  frac = frac.replace(/0+$/, '');
  return frac ? `${sign}${whole.toString()}.${frac}` : `${sign}${whole.toString()}`;
}

type CalcState =
  | { ok: false; error: string }
  | {
      ok: true;
      numeratorFraction: Rational;
      denominatorFraction: Rational;
      reciprocal: Rational;
      result: Rational;
    };

export function ComplexFractionsCalculator() {
  const t = useTranslations('calculators.complexFractions');

  const [a, setA] = useState<string>('1');
  const [b, setB] = useState<string>('2');
  const [c, setC] = useState<string>('3');
  const [d, setD] = useState<string>('4');

  const [calc, setCalc] = useState<CalcState | null>(null);
  const resultRef = useScrollToResult(calc && calc.ok ? calc : null);

  const handleCalculate = () => {
    const ar = parseRational(a);
    const br = parseRational(b);
    const cr = parseRational(c);
    const dr = parseRational(d);

    if (!ar || !br || !cr || !dr) {
      setCalc({ ok: false, error: t('errorInvalid') });
      return;
    }
    if (br.n === 0n || dr.n === 0n) {
      setCalc({ ok: false, error: t('errorZeroDenominator') });
      return;
    }

    const numeratorFraction = normalize({ n: ar.n * br.d, d: ar.d * br.n }); // a/b
    const denominatorFraction = normalize({ n: cr.n * dr.d, d: cr.d * dr.n }); // c/d

    if (denominatorFraction.n === 0n) {
      setCalc({ ok: false, error: t('errorDivideByZero') });
      return;
    }

    const reciprocal = normalize({ n: denominatorFraction.d, d: denominatorFraction.n }); // d/c (of c/d)
    const result = multiply(numeratorFraction, reciprocal);
    setCalc({ ok: true, numeratorFraction, denominatorFraction, reciprocal, result });
  };

  const handleReset = () => {
    setA('1');
    setB('2');
    setC('3');
    setD('4');
    setCalc(null);
  };

  const stepStrings = useMemo(() => {
    if (!calc || !calc.ok) return null;
    const nf = calc.numeratorFraction;
    const df = calc.denominatorFraction;
    const rec = calc.reciprocal;
    const res = calc.result;

    const step1 = `(${formatFraction(nf)}) ÷ (${formatFraction(df)})`;
    const step2 = `= (${formatFraction(nf)}) × (${formatFraction(rec)})`;
    const step3 = `= ${formatFraction(res)}`;
    return { step1, step2, step3 };
  }, [calc]);

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <div className="input-label" style={{ marginBottom: '0.75rem' }}>
                {t('complexFractionLabel')}
              </div>

              <div className="inputs-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <div className="input-card" style={{ padding: '1rem' }}>
                  <div className="input-label">{t('numeratorFraction')}</div>
                  <div className="input-with-unit" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem' }}>
                    <input
                      value={a}
                      onChange={(e) => setA(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      inputMode="decimal"
                      placeholder="1"
                      aria-label={t('a')}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>/</div>
                    <input
                      value={b}
                      onChange={(e) => setB(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      inputMode="decimal"
                      placeholder="2"
                      aria-label={t('b')}
                    />
                  </div>
                </div>

                <div className="input-card" style={{ padding: '1rem' }}>
                  <div className="input-label">{t('denominatorFraction')}</div>
                  <div className="input-with-unit" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem' }}>
                    <input
                      value={c}
                      onChange={(e) => setC(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      inputMode="decimal"
                      placeholder="3"
                      aria-label={t('c')}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>/</div>
                    <input
                      value={d}
                      onChange={(e) => setD(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      inputMode="decimal"
                      placeholder="4"
                      aria-label={t('d')}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {t('inputHint')}
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
                      <span className="result-value">{formatFraction(calc.result)}</span>
                      <CopyButton text={formatFraction(calc.result)} />
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">{t('mixedNumber')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{formatMixedNumber(calc.result)}</span>
                      <CopyButton text={formatMixedNumber(calc.result)} />
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">{t('decimalValue')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{formatDecimal(calc.result, 12)}</span>
                      <CopyButton text={formatDecimal(calc.result, 12)} />
                    </div>
                  </div>
                </div>

                {stepStrings && (
                  <div className="seo-content-card" style={{ marginTop: '0.5rem' }}>
                    <h3 className="example-heading">{t('stepsHeading')}</h3>
                    <div className="example-text" style={{ lineHeight: 1.8 }}>
                      <p>
                        <strong>{stepStrings.step1}</strong>
                      </p>
                      <p>{stepStrings.step2}</p>
                      <p>{stepStrings.step3}</p>
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

