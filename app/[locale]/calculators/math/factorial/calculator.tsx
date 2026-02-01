'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

function parseNonNegativeInt(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  const n = parseInt(trimmed, 10);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

function factorialBigInt(n: number): bigint {
  if (n <= 1) return 1n;
  let result = 1n;
  for (let i = 2; i <= n; i++) {
    result *= BigInt(i);
  }
  return result;
}

export function FactorialCalculator() {
  const t = useTranslations('calculators.factorial');

  const [input, setInput] = useState('5');
  const [result, setResult] = useState<{ value: bigint; n: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => parseNonNegativeInt(input), [input]);
  const hasInput = input.trim().length > 0;
  const isValid = parsed !== null;
  const displayError =
    (hasInput && parsed === null && t('errorInvalid')) ||
    (hasInput && parsed !== null && parsed > 170 && t('errorTooLarge')) ||
    null;

  const computeResult = useCallback(
    (showErrors: boolean) => {
      const n = parseNonNegativeInt(input);
      if (n === null) {
        setResult(null);
        setError(showErrors ? t('errorInvalid') : null);
        return;
      }
      if (n > 170) {
        setResult(null);
        setError(showErrors ? t('errorTooLarge') : null);
        return;
      }
      setError(null);
      setResult({ n, value: factorialBigInt(n) });
    },
    [input, t]
  );

  useEffect(() => {
    if (!input.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    const n = parseNonNegativeInt(input);
    if (n === null || n > 170) {
      setResult(null);
      return;
    }
    setResult({ n, value: factorialBigInt(n) });
  }, [input]);

  const handleReset = useCallback(() => {
    setInput('5');
    setResult(null);
    setError(null);
  }, []);

  const expansion = useMemo(() => {
    if (!result || result.n > 15) return null;
    const parts: string[] = [];
    for (let i = 1; i <= result.n; i++) {
      parts.push(String(i));
    }
    return parts.join(' × ');
  }, [result]);

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card numbers-to-letters-compact">
              <label htmlFor="factorial-n" className="input-label">
                {t('inputLabel')}
              </label>
              <input
                id="factorial-n"
                type="text"
                inputMode="numeric"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && computeResult(true)}
                className="number-input"
                placeholder={t('inputPlaceholder')}
                style={{ minHeight: '44px' }}
              />
              <p className="seo-paragraph" style={{ marginTop: '0.75rem' }}>
                {t('inputHelp')}
              </p>
            </div>

            {(error || displayError) && (
              <p className="seo-paragraph" style={{ color: 'var(--error)', marginBottom: 0 }}>
                {error || displayError}
              </p>
            )}

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button
                onClick={() => computeResult(true)}
                className="btn btn-primary"
                style={{ minHeight: '44px' }}
                disabled={!isValid || (parsed !== null && parsed > 170)}
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
            {result ? (
              <div
                className="number-input"
                style={{
                  minHeight: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word',
                }}
              >
                <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  {t('resultValue', { n: result.n, value: result.value.toString() })}
                </div>
                {expansion && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    {t('expansion', { expansion })}
                  </div>
                )}
                <div style={{ color: 'var(--text-secondary)' }}>
                  {t('equation', { n: result.n, value: result.value.toString() })}
                </div>
              </div>
            ) : (
              <div
                className="number-input"
                style={{
                  minHeight: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  opacity: 0.7,
                }}
              >
                —
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
