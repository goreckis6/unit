'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export type KwToVoltsType = 'dc' | 'single' | 'three';

/** DC: V = P / I = (kW × 1000) / I */
export function kwToVoltsDc(kw: number, amps: number): number {
  if (amps <= 0) return 0;
  return (kw * 1000) / amps;
}

/** Single-phase AC: V = P / (I × PF) = (kW × 1000) / (I × PF) */
export function kwToVoltsSinglePhase(kw: number, amps: number, powerFactor: number): number {
  if (amps <= 0 || powerFactor <= 0 || powerFactor > 1) return 0;
  return (kw * 1000) / (amps * powerFactor);
}

/** Three-phase AC: V = P / (√3 × I × PF) = (kW × 1000) / (√3 × I × PF); result is line-to-line voltage */
export function kwToVoltsThreePhase(kw: number, amps: number, powerFactor: number): number {
  if (amps <= 0 || powerFactor <= 0 || powerFactor > 1) return 0;
  return (kw * 1000) / (Math.sqrt(3) * amps * powerFactor);
}

export function KwToVoltsCalculator() {
  const t = useTranslations('calculators.kwToVolts');
  const [phaseType, setPhaseType] = useState<KwToVoltsType>('single');
  const [kw, setKw] = useState<string>('');
  const [amps, setAmps] = useState<string>('10');
  const [powerFactor, setPowerFactor] = useState<string>('0.8');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const k = parseFloat(kw);
    const a = parseFloat(amps);
    const pf = parseFloat(powerFactor);

    if (!isNaN(k) && !isNaN(a) && a > 0 && k >= 0) {
      if (phaseType === 'dc') {
        setResult(kwToVoltsDc(k, a));
      } else if (!isNaN(pf) && pf > 0 && pf <= 1) {
        const vol = phaseType === 'single'
          ? kwToVoltsSinglePhase(k, a, pf)
          : kwToVoltsThreePhase(k, a, pf);
        setResult(vol);
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setKw('');
    setAmps('10');
    setPowerFactor('0.8');
    setResult(null);
  };

  const handlePhaseChange = (type: KwToVoltsType) => {
    setPhaseType(type);
    setResult(null);
  };

  const showPowerFactor = phaseType !== 'dc';

  return (
    <>
      <div className="input-section">
        <div className="phase-selector">
          <span className="phase-label">{t('currentType')}</span>
          <div className="phase-toggle">
            <button
              type="button"
              className={`phase-btn ${phaseType === 'dc' ? 'phase-btn-active' : ''}`}
              onClick={() => handlePhaseChange('dc')}
            >
              {t('directCurrent')}
            </button>
            <button
              type="button"
              className={`phase-btn ${phaseType === 'single' ? 'phase-btn-active' : ''}`}
              onClick={() => handlePhaseChange('single')}
            >
              {t('singlePhase')}
            </button>
            <button
              type="button"
              className={`phase-btn ${phaseType === 'three' ? 'phase-btn-active' : ''}`}
              onClick={() => handlePhaseChange('three')}
            >
              {t('threePhase')}
            </button>
          </div>
        </div>
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="kw" className="input-label">
              {t('kw')}
            </label>
            <div className="input-with-unit">
              <input
                id="kw"
                type="number"
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="0"
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
                placeholder="10"
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
              <div className="result-label">{t('voltage')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(2)}</span>
                <span className="result-unit">V</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
