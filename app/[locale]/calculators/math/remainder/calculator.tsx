'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

function parseBigIntStrict(input: string): bigint | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Allow leading +/-, digits only
  if (!/^[+-]?\d+$/.test(trimmed)) return null;
  try {
    return BigInt(trimmed);
  } catch {
    return null;
  }
}

function absBigInt(n: bigint): bigint {
  return n < 0n ? -n : n;
}

/**
 * Euclidean remainder: r in [0, |b|-1] when b != 0.
 * Uses bAbs = |b|, so result is always non-negative.
 */
function euclideanDivision(a: bigint, b: bigint): { q: bigint; r: bigint; bAbs: bigint } | null {
  if (b === 0n) return null;
  const bAbs = absBigInt(b);
  const r = ((a % bAbs) + bAbs) % bAbs;
  const q = (a - r) / bAbs;
  return { q, r, bAbs };
}

export function RemainderCalculator() {
  const t = useTranslations('calculators.remainder');

  const [dividend, setDividend] = useState<string>('23');
  const [divisor, setDivisor] = useState<string>('5');
  const [result, setResult] = useState<{ q: bigint; r: bigint; bAbs: bigint } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const display = useMemo(() => {
    if (!result) return null;
    const q = result.q.toString();
    const r = result.r.toString();
    const bAbs = result.bAbs.toString();
    return { q, r, bAbs };
  }, [result]);

  const handleCalculate = useCallback(() => {
    const a = parseBigIntStrict(dividend);
    if (a === null) {
      setResult(null);
      setError(t('errorInvalidDividend'));
      return;
    }
    const b = parseBigIntStrict(divisor);
    if (b === null) {
      setResult(null);
      setError(t('errorInvalidDivisor'));
      return;
    }
    if (b === 0n) {
      setResult(null);
      setError(t('errorDivisionByZero'));
      return;
    }

    const out = euclideanDivision(a, b);
    if (!out) {
      setResult(null);
      setError(t('errorDivisionByZero'));
      return;
    }

    setError(null);
    setResult(out);
  }, [dividend, divisor, t]);

  const handleReset = useCallback(() => {
    setDividend('23');
    setDivisor('5');
    setResult(null);
    setError(null);
  }, []);

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <div className="input-label">{t('formulaHeading')}</div>
              <div className="number-input" style={{ minHeight: 'unset', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace' }}>
                {t('formulaText')}
              </div>
            </div>

            <div className="input-card numbers-to-letters-compact">
              <label htmlFor="dividend" className="input-label">
                {t('dividendLabel')}
              </label>
              <input
                id="dividend"
                type="text"
                inputMode="numeric"
                value={dividend}
                onChange={(e) => setDividend(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder={t('dividendPlaceholder')}
                style={{ minHeight: '44px' }}
              />
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
                onChange={(e) => setDivisor(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
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
              <button onClick={handleCalculate} className="btn btn-primary" style={{ minHeight: '44px' }}>
                {t('calculate')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Output */}
        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card">
            <label className="input-label">{t('resultLabel')}</label>

            <div className="number-input" style={{ minHeight: '160px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {display ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, flex: '1 1 auto' }}>{t('remainderValue', { value: display.r })}</div>
                    <CopyButton text={display.r} className="btn btn-secondary" />
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>{t('quotientValue', { value: display.q })}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {t('equation', { a: dividend.trim(), b: display.bAbs, q: display.q, r: display.r })}
                  </div>
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

