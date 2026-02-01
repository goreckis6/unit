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
      <div className="input-section">
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
      </div>

      <div className="action-buttons">
        <button onClick={handleCalculate} className="btn btn-primary">
          {t('calculate')}
        </button>
        <button onClick={handleReset} className="btn btn-secondary">
          {t('reset')}
        </button>
      </div>

      {result !== null && (
        <div ref={resultRef} className="result-section">
          <div className="result-header">
            <div className="result-badge">
              {t('result')}
            </div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">kVA</div>
              <div className="number-input result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">kVA</span>
                <CopyButton text={`${result.toFixed(4)} kVA`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
