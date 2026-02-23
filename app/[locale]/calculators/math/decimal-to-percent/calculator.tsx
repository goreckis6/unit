'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';
import { useScrollToResult } from '@/hooks/useScrollToResult';

function trimTrailingZeros(numStr: string): string {
  if (!numStr.includes('.')) return numStr;
  const trimmed = numStr.replace(/(\.\d*?[1-9])0+$/g, '$1').replace(/\.0+$/g, '');
  return trimmed;
}

type CalcState =
  | { ok: false; error: string }
  | { ok: true; decimal: number; percent: number; decimals: number };

export function DecimalToPercentCalculator() {
  const t = useTranslations('calculators.decimalToPercent');

  const [decimalInput, setDecimalInput] = useState<string>('0.5');
  const [decimalPlaces, setDecimalPlaces] = useState<string>('2');
  const [calc, setCalc] = useState<CalcState | null>(null);
  const resultRef = useScrollToResult(calc && calc.ok ? calc : null);

  const handleCalculate = () => {
    const decimal = Number.parseFloat(decimalInput.trim());
    const places = Number.parseInt(decimalPlaces.trim(), 10);

    if (!Number.isFinite(decimal) || Number.isNaN(decimal) || !Number.isFinite(places) || Number.isNaN(places)) {
      setCalc({ ok: false, error: t('errorInvalid') });
      return;
    }
    if (places < 0 || places > 12) {
      setCalc({ ok: false, error: t('errorDecimalPlaces') });
      return;
    }

    const percent = decimal * 100;
    setCalc({ ok: true, decimal, percent, decimals: places });
  };

  const handleReset = () => {
    setDecimalInput('0.5');
    setDecimalPlaces('2');
    setCalc(null);
  };

  const formatted = useMemo(() => {
    if (!calc || !calc.ok) return null;
    const value = calc.percent.toFixed(calc.decimals);
    const trimmed = trimTrailingZeros(value);
    return {
      percentNumber: trimmed,
      percentWithSymbol: `${trimmed}%`,
      formulaLine: `${calc.decimal.toString()} × 100 = ${trimmed}%`,
    };
  }, [calc]);

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="decimal" className="input-label">
                {t('decimal')}
              </label>
              <input
                id="decimal"
                value={decimalInput}
                onChange={(e) => setDecimalInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                inputMode="decimal"
                placeholder="0.5"
              />

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
                    placeholder="2"
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

            {calc && calc.ok && formatted && (
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
                <div className="result-item">
                  <div className="result-label">{t('percentResult')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value">{formatted.percentWithSymbol}</span>
                    <CopyButton text={formatted.percentWithSymbol} />
                  </div>
                </div>

                <div className="result-item">
                  <div className="result-label">{t('percentNumber')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value">{formatted.percentNumber}</span>
                    <CopyButton text={formatted.percentNumber} />
                  </div>
                </div>

                <div className="seo-content-card" style={{ marginTop: '0.25rem' }}>
                  <h3 className="example-heading">{t('stepsHeading')}</h3>
                  <div className="example-text" style={{ lineHeight: 1.8 }}>
                    <p>
                      <strong>{t('formula')}</strong>
                    </p>
                    <p>{formatted.formulaLine}</p>
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

