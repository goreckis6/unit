'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

export type PhaseType = 'single' | 'three';

export function ampToKva(amps: number, volts: number, phase: PhaseType): number {
  if (amps <= 0 || volts <= 0) return 0;
  if (phase === 'three') return (Math.sqrt(3) * amps * volts) / 1000;
  return (amps * volts) / 1000;
}

export function AmpToKvaCalculator() {
  const t = useTranslations('calculators.ampToKva');
  const [phase, setPhase] = useState<PhaseType>('single');
  const [amps, setAmps] = useState<string>('');
  const [volts, setVolts] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const a = parseFloat(amps);
    const v = parseFloat(volts);

    if (!isNaN(a) && !isNaN(v) && a > 0 && v > 0) {
      setResult(ampToKva(a, v, phase));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setAmps('');
    setVolts('');
    setResult(null);
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="phase-selector">
              <span className="phase-label">{t('phaseType')}</span>
              <div className="phase-toggle">
                <button
                  type="button"
                  className={`phase-btn ${phase === 'single' ? 'phase-btn-active' : ''}`}
                  onClick={() => setPhase('single')}
                >
                  {t('singlePhase')}
                </button>
                <button
                  type="button"
                  className={`phase-btn ${phase === 'three' ? 'phase-btn-active' : ''}`}
                  onClick={() => setPhase('three')}
                >
                  {t('threePhase')}
                </button>
              </div>
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
                    placeholder={phase === 'single' ? '230' : '400'}
                  />
                </div>
              </div>
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
                    {result.toFixed(4)} kVA
                  </span>
                  <CopyButton text={`${result.toFixed(4)} kVA`} />
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
