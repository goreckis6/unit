'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

/** Single Phase: I = VA / V; Three Phase: I = VA / (√3 × V) */
export function vaToAmps(va: number, voltage: number, phase: 'single' | 'three'): number {
  if (voltage <= 0 || va < 0) return 0;
  if (phase === 'three') {
    return va / (Math.sqrt(3) * voltage);
  }
  return va / voltage;
}

export function VaToAmpsCalculator() {
  const t = useTranslations('calculators.vaToAmps');
  const [va, setVa] = useState<string>('');
  const [voltage, setVoltage] = useState<string>('');
  const [phase, setPhase] = useState<'single' | 'three'>('single');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const vaVal = parseFloat(va);
    const voltageVal = parseFloat(voltage);
    
    if (!isNaN(vaVal) && !isNaN(voltageVal) && vaVal >= 0 && voltageVal > 0) {
      setResult(vaToAmps(vaVal, voltageVal, phase));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setVa('');
    setVoltage('');
    setPhase('single');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="phase-selector">
          <label className="phase-label">{t('phaseType')}</label>
          <div className="phase-toggle">
            <button
              type="button"
              onClick={() => setPhase('single')}
              className={`phase-btn ${phase === 'single' ? 'phase-btn-active' : ''}`}
            >
              {t('singlePhase')}
            </button>
            <button
              type="button"
              onClick={() => setPhase('three')}
              className={`phase-btn ${phase === 'three' ? 'phase-btn-active' : ''}`}
            >
              {t('threePhase')}
            </button>
          </div>
        </div>

        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="va" className="input-label">
              {t('va')}
            </label>
            <div className="input-with-unit">
              <input
                id="va"
                type="number"
                value={va}
                onChange={(e) => setVa(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="0"
              />
            </div>
          </div>

          <div className="input-card">
            <label htmlFor="voltage" className="input-label">
              {t('voltage')}
            </label>
            <div className="input-with-unit">
              <input
                id="voltage"
                type="number"
                step="0.1"
                min="0.1"
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="0"
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
              <div className="result-label">{t('amps')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">A</span>
                <CopyButton text={`${result.toFixed(4)} A`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
