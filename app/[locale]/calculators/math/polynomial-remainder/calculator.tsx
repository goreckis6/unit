'use client';

import { useCallback, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

const MAX_FRACTION_DIGITS = 8;

function parseNumberToken(token: string): number | null {
  const trimmed = token.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/,/g, '.');
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}

function parseCoefficients(input: string): number[] | null {
  const tokens = input
    .split(/[,\s;]+/g)
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) return null;

  const coeffs: number[] = [];
  for (const token of tokens) {
    const value = parseNumberToken(token);
    if (value === null) return null;
    coeffs.push(value);
  }
  return coeffs;
}

function evaluatePolynomialAt(coeffs: number[], a: number): number {
  // Horner's method: (((c0)*a + c1)*a + c2)*a + ...
  let acc = 0;
  for (const c of coeffs) {
    acc = acc * a + c;
  }
  return acc;
}

function formatNumber(value: number, locale: string): string {
  return value.toLocaleString(locale, {
    maximumFractionDigits: MAX_FRACTION_DIGITS,
  });
}

export function PolynomialRemainderCalculator() {
  const t = useTranslations('calculators.polynomialRemainder');
  const locale = useLocale();

  const [coeffsInput, setCoeffsInput] = useState<string>('2, -3, 0, 5');
  const [aInput, setAInput] = useState<string>('2');
  const [remainder, setRemainder] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayRemainder = useMemo(() => {
    if (remainder === null) return '';
    return formatNumber(remainder, locale);
  }, [locale, remainder]);

  const handleCalculate = useCallback(() => {
    const coeffs = parseCoefficients(coeffsInput);
    if (!coeffs) {
      setRemainder(null);
      setError(t('errorInvalidCoefficients'));
      return;
    }

    const a = parseNumberToken(aInput);
    if (a === null) {
      setRemainder(null);
      setError(t('errorInvalidA'));
      return;
    }

    setError(null);
    setRemainder(evaluatePolynomialAt(coeffs, a));
  }, [aInput, coeffsInput, t]);

  const handleReset = useCallback(() => {
    setCoeffsInput('2, -3, 0, 5');
    setAInput('2');
    setRemainder(null);
    setError(null);
  }, []);

  const handleCopy = useCallback(() => {
    if (!displayRemainder) return;
    void navigator.clipboard.writeText(displayRemainder);
  }, [displayRemainder]);

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <div className="input-label">{t('formulaHeading')}</div>
              <div
                className="number-input"
                style={{
                  minHeight: 'unset',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace',
                }}
              >
                {t('formulaText')}
              </div>
            </div>

            <div className="input-card">
              <label htmlFor="coeffs" className="input-label">
                {t('coefficientsLabel')}
              </label>
              <textarea
                id="coeffs"
                value={coeffsInput}
                onChange={(e) => setCoeffsInput(e.target.value)}
                className="number-input"
                placeholder={t('coefficientsPlaceholder')}
                rows={4}
                style={{ resize: 'vertical', minHeight: '120px', whiteSpace: 'pre-wrap' }}
              />
              <p className="seo-paragraph" style={{ marginTop: '0.75rem' }}>
                {t('coefficientsHelp')}
              </p>
            </div>

            <div className="input-card numbers-to-letters-compact">
              <label htmlFor="a" className="input-label">
                {t('aLabel')}
              </label>
              <input
                id="a"
                type="text"
                inputMode="decimal"
                value={aInput}
                onChange={(e) => setAInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder={t('aPlaceholder')}
                style={{ minHeight: '44px' }}
              />
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
            <label className="input-label">{t('remainderLabel')}</label>

            <div
              className="number-input"
              style={{
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {displayRemainder ? (
                <>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{displayRemainder}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {t('resultExpression', { a: aInput.trim() || 'a', value: displayRemainder })}
                  </div>
                </>
              ) : (
                <span style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>—</span>
              )}
            </div>

            <div className="action-buttons" style={{ marginTop: '1rem' }}>
              <button onClick={handleCopy} className="btn btn-secondary" disabled={!displayRemainder}>
                {t('copyResult')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

