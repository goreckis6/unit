'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export type CalcType = 'watts' | 'ohms';

/** Volts to amps with watts: I = P / V */
export function voltsToAmpsWithWatts(volts: number, watts: number): number {
  if (volts <= 0 || watts < 0) return 0;
  return watts / volts;
}

/** Volts to amps with ohms (Ohm's Law): I = V / R */
export function voltsToAmpsWithOhms(volts: number, ohms: number): number {
  if (volts < 0 || ohms <= 0) return 0;
  return volts / ohms;
}

export function VoltsToAmpsCalculator() {
  const t = useTranslations('calculators.voltsToAmps');
  const [calcType, setCalcType] = useState<CalcType>('watts');
  const [volts, setVolts] = useState<string>('');
  const [watts, setWatts] = useState<string>('');
  const [ohms, setOhms] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const v = parseFloat(volts);

    if (!isNaN(v) && v > 0) {
      if (calcType === 'watts') {
        const w = parseFloat(watts);
        if (!isNaN(w) && w >= 0) setResult(voltsToAmpsWithWatts(v, w));
        else setResult(null);
      } else {
        const r = parseFloat(ohms);
        if (!isNaN(r) && r > 0) setResult(voltsToAmpsWithOhms(v, r));
        else setResult(null);
      }
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setVolts('');
    setWatts('');
    setOhms('');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
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
                placeholder="230"
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
            <div className="result-badge">{t('result')}</div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">{t('amps')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">A</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
