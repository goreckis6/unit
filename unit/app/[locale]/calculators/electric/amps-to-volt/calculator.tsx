'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

export type CalcType = 'watts' | 'ohms';

/** Amps to volts with watts: V = P / I */
export function ampsToVoltWithWatts(amps: number, watts: number): number {
  if (amps <= 0 || watts <= 0) return 0;
  return watts / amps;
}

/** Amps to volts with ohms (Ohm's Law): V = I × R */
export function ampsToVoltWithOhms(amps: number, ohms: number): number {
  if (amps <= 0 || ohms <= 0) return 0;
  return amps * ohms;
}

export function AmpsToVoltCalculator() {
  const t = useTranslations('calculators.ampsToVolt');
  const [calcType, setCalcType] = useState<CalcType>('watts');
  const [amps, setAmps] = useState<string>('');
  const [watts, setWatts] = useState<string>('');
  const [ohms, setOhms] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const a = parseFloat(amps);

    if (!isNaN(a) && a > 0) {
      if (calcType === 'watts') {
        const w = parseFloat(watts);
        if (!isNaN(w) && w > 0) setResult(ampsToVoltWithWatts(a, w));
        else setResult(null);
      } else {
        const r = parseFloat(ohms);
        if (!isNaN(r) && r > 0) setResult(ampsToVoltWithOhms(a, r));
        else setResult(null);
      }
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setAmps('');
    setWatts('');
    setOhms('');
    setResult(null);
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="phase-selector">
              <label htmlFor="calc-type" className="phase-label">
                {t('selectCalculation')}
              </label>
              <select
                id="calc-type"
                value={calcType}
                onChange={(e) => {
                  setCalcType(e.target.value as CalcType);
                  setResult(null);
                }}
                className="calc-type-select"
              >
                <option value="watts">{t('withWatts')}</option>
                <option value="ohms">{t('withOhms')}</option>
              </select>
            </div>

            <div className="inputs-grid">
              <div className="input-card">
                <label htmlFor="amps" className="input-label">
                  {t('amps')}
                </label>
                <div className="input-with-unit">
                  <input
                    id="amps"
                    type="number"
                    value={amps}
                    onChange={(e) => setAmps(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    className="number-input"
                    placeholder="0"
                  />
                </div>
              </div>

              {calcType === 'watts' ? (
                <div className="input-card">
                  <label htmlFor="watts" className="input-label">
                    {t('watts')}
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="watts"
                      type="number"
                      value={watts}
                      onChange={(e) => setWatts(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="0"
                    />
                  </div>
                </div>
              ) : (
                <div className="input-card">
                  <label htmlFor="ohms" className="input-label">
                    {t('ohms')}
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="ohms"
                      type="number"
                      value={ohms}
                      onChange={(e) => setOhms(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button onClick={handleCalculate} className="btn btn-primary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('calculate')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Output */}
        <div
          ref={resultRef}
          className="result-section"
          style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}
        >
          <div className="input-card">
            <label className="input-label">
              {t('result')}
            </label>
            {result !== null ? (
              <div
                className="number-input"
                style={{
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  minHeight: '264px',
                  resize: 'vertical',
                  overflowY: 'auto',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontSize: '1.5em',
                  fontWeight: '500',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  letterSpacing: '0.02em',
                  lineHeight: '1.6',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, minWidth: 0, color: 'var(--primary-color)', fontWeight: 800 }}>
                    {result.toFixed(4)} V
                  </span>
                  <CopyButton text={`${result.toFixed(4)} V`} />
                </div>
              </div>
            ) : (
              <div
                className="number-input"
                style={{
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  minHeight: '264px',
                  resize: 'vertical',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontSize: '1.1em',
                  padding: '1.5rem',
                  opacity: 0.5,
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>
                  {t('calculate')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
