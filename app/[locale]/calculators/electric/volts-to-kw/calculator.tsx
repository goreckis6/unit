'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

export type PhaseType = 'dc' | 'single' | 'three';

export function voltsToKw(
  volts: number,
  amps: number,
  powerFactor: number,
  type: PhaseType
): number {
  if (volts <= 0 || amps <= 0) return 0;
  if (type === 'dc') return (volts * amps) / 1000;
  if (powerFactor <= 0 || powerFactor > 1) return 0;
  if (type === 'three') return (Math.sqrt(3) * volts * amps * powerFactor) / 1000;
  return (volts * amps * powerFactor) / 1000;
}

export function VoltsToKwCalculator() {
  const t = useTranslations('calculators.voltsToKw');
  const [type, setType] = useState<PhaseType>('single');
  const [volts, setVolts] = useState<string>('230');
  const [amps, setAmps] = useState<string>('');
  const [powerFactor, setPowerFactor] = useState<string>('0.8');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const v = parseFloat(volts);
    const a = parseFloat(amps);
    const pf = parseFloat(powerFactor);

    if (!isNaN(v) && !isNaN(a) && v > 0 && a > 0) {
      if (type === 'dc') {
        setResult(voltsToKw(v, a, 1, 'dc'));
      } else if (!isNaN(pf) && pf > 0 && pf <= 1) {
        setResult(voltsToKw(v, a, pf, type));
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setVolts('230');
    setAmps('');
    setPowerFactor('0.8');
    setResult(null);
  };

  const showPowerFactor = type !== 'dc';
  const voltPlaceholder = type === 'three' ? '400' : '230';

  return (
    <>
      <div className="input-section">
        <div className="phase-selector">
          <span className="phase-label">{t('phaseType')}</span>
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
            <div className="result-badge">{t('result')}</div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">{t('kw')}</div>
              <div className="number-input result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">kW</span>
                <CopyButton text={`${result.toFixed(4)} kW`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
