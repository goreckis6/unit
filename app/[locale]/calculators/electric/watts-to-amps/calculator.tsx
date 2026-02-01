'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

export type PhaseType = 'dc' | 'single' | 'three';

export function wattsToAmps(
  watts: number,
  volts: number,
  powerFactor: number,
  type: PhaseType
): number {
  if (watts < 0 || volts <= 0) return 0;
  if (type === 'dc') return watts / volts;
  if (powerFactor <= 0 || powerFactor > 1) return 0;
  if (type === 'three') return watts / (Math.sqrt(3) * volts * powerFactor);
  return watts / (volts * powerFactor);
}

export function WattsToAmpsCalculator() {
  const t = useTranslations('calculators.wattsToAmps');
  const [type, setType] = useState<PhaseType>('single');
  const [watts, setWatts] = useState<string>('');
  const [volts, setVolts] = useState<string>('230');
  const [powerFactor, setPowerFactor] = useState<string>('0.8');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const w = parseFloat(watts);
    const v = parseFloat(volts);
    const pf = parseFloat(powerFactor);

    if (!isNaN(w) && !isNaN(v) && w >= 0 && v > 0) {
      if (type === 'dc') {
        setResult(wattsToAmps(w, v, 1, 'dc'));
      } else if (!isNaN(pf) && pf > 0 && pf <= 1) {
        setResult(wattsToAmps(w, v, pf, type));
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setWatts('');
    setVolts('230');
    setPowerFactor('0.8');
    setResult(null);
  };

  const showPowerFactor = type !== 'dc';
  const voltPlaceholder = type === 'three' ? '400' : '230';

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="phase-selector">
              <span className="phase-label">{t('currentType')}</span>
              <div className="phase-toggle">
                <button
                  type="button"
                  className={`phase-btn ${type === 'dc' ? 'phase-btn-active' : ''}`}
                  onClick={() => setType('dc')}
                >
                  {t('directCurrent')}
                </button>
                <button
                  type="button"
                  className={`phase-btn ${type === 'single' ? 'phase-btn-active' : ''}`}
                  onClick={() => setType('single')}
                >
                  {t('singlePhase')}
                </button>
                <button
                  type="button"
                  className={`phase-btn ${type === 'three' ? 'phase-btn-active' : ''}`}
                  onClick={() => setType('three')}
                >
                  {t('threePhase')}
                </button>
              </div>
            </div>

            <div className="inputs-grid">
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
              <div className="input-card">
                <label htmlFor="volts" className="input-label">
                  {t('volts')}
                </label>
                <div className="input-with-unit">
                  <input
                    id="volts"
                    type="number"
                    value={volts}
                    onChange={(e) => setVolts(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    className="number-input"
                    placeholder={voltPlaceholder}
                  />
                </div>
              </div>
              {showPowerFactor && (
                <div className="input-card">
                  <label htmlFor="powerFactor" className="input-label">
                    {t('powerFactor')}
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="powerFactor"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="1"
                      value={powerFactor}
                      onChange={(e) => setPowerFactor(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="0.8"
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
                    {result.toFixed(4)} A
                  </span>
                  <CopyButton text={`${result.toFixed(4)} A`} />
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
