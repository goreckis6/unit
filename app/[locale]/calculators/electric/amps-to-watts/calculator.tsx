'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export type CurrentType = 'dc' | 'single' | 'three';

export function ampsToWatts(
  amps: number,
  volts: number,
  powerFactor: number,
  type: CurrentType
): number {
  if (amps <= 0 || volts <= 0) return 0;
  if (type === 'dc') return amps * volts;
  if (powerFactor <= 0 || powerFactor > 1) return 0;
  if (type === 'three') return Math.sqrt(3) * amps * volts * powerFactor;
  return amps * volts * powerFactor;
}

export function AmpsToWattsCalculator() {
  const t = useTranslations('calculators.ampsToWatts');
  const [type, setType] = useState<CurrentType>('single');
  const [amps, setAmps] = useState<string>('');
  const [volts, setVolts] = useState<string>('230');
  const [powerFactor, setPowerFactor] = useState<string>('0.8');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const a = parseFloat(amps);
    const v = parseFloat(volts);
    const pf = parseFloat(powerFactor);

    if (!isNaN(a) && !isNaN(v) && a > 0 && v > 0) {
      if (type === 'dc') {
        setResult(ampsToWatts(a, v, 1, 'dc'));
      } else if (!isNaN(pf) && pf > 0 && pf <= 1) {
        setResult(ampsToWatts(a, v, pf, type));
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setAmps('');
    setVolts('230');
    setPowerFactor('0.8');
    setResult(null);
  };

  const showPowerFactor = type !== 'dc';
  const voltPlaceholder = type === 'three' ? '400' : '230';

  return (
    <>
      <div className="input-section">
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
        <div className="result-section">
          <div className="result-header">
            <div className="result-badge">
              {t('result')}
            </div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">Watts (W)</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(2)}</span>
                <span className="result-unit">W</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
