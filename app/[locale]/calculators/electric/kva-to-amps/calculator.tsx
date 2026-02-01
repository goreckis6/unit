'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

export type PhaseType = 'single' | 'three';

export function kvaToAmps(kva: number, volts: number, phase: PhaseType): number {
  if (kva <= 0 || volts <= 0) return 0;
  if (phase === 'three') return (kva * 1000) / (Math.sqrt(3) * volts);
  return (kva * 1000) / volts;
}

export function KvaToAmpsCalculator() {
  const t = useTranslations('calculators.kvaToAmps');
  const [phase, setPhase] = useState<PhaseType>('single');
  const [kva, setKva] = useState<string>('');
  const [volts, setVolts] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const k = parseFloat(kva);
    const v = parseFloat(volts);

    if (!isNaN(k) && !isNaN(v) && k > 0 && v > 0) {
      setResult(kvaToAmps(k, v, phase));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setKva('');
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
            <label htmlFor="kva" className="input-label">
              {t('kva')}
            </label>
            <div className="input-with-unit">
              <input
                id="kva"
                type="number"
                value={kva}
                onChange={(e) => setKva(e.target.value)}
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
              <div className="result-label">Amps (A)</div>
              <div className="number-input result-value-box">
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
