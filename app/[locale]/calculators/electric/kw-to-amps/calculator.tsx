'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function kwToAmpsSinglePhase(kw: number, voltage: number, powerFactor: number): number {
  if (voltage <= 0 || powerFactor <= 0 || powerFactor > 1) return 0;
  return (kw * 1000) / (powerFactor * voltage);
}

export function kwToAmpsThreePhase(kw: number, voltage: number, powerFactor: number): number {
  if (voltage <= 0 || powerFactor <= 0 || powerFactor > 1) return 0;
  return (kw * 1000) / (Math.sqrt(3) * powerFactor * voltage);
}

export function KwToAmpsCalculator() {
  const t = useTranslations('calculators.kwToAmps');
  const [phaseType, setPhaseType] = useState<'single' | 'three'>('single');
  const [kw, setKw] = useState<string>('');
  const [voltage, setVoltage] = useState<string>('230');
  const [powerFactor, setPowerFactor] = useState<string>('0.8');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const k = parseFloat(kw);
    const v = parseFloat(voltage);
    const pf = parseFloat(powerFactor);
    
    if (!isNaN(k) && !isNaN(v) && !isNaN(pf) && v > 0 && pf > 0 && pf <= 1) {
      const amps = phaseType === 'single' 
        ? kwToAmpsSinglePhase(k, v, pf)
        : kwToAmpsThreePhase(k, v, pf);
      setResult(amps);
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setKw('');
    setVoltage('230');
    setPowerFactor('0.8');
    setResult(null);
  };

  const handlePhaseChange = (type: 'single' | 'three') => {
    setPhaseType(type);
    if (type === 'three' && voltage === '230') {
      setVoltage('400');
    } else if (type === 'single' && voltage === '400') {
      setVoltage('230');
    }
    setResult(null);
  };

  return (
    <>
      <div className="phase-selector">
        <button
          className={`phase-btn ${phaseType === 'single' ? 'active' : ''}`}
          onClick={() => handlePhaseChange('single')}
        >
          {t('singlePhase')}
        </button>
        <button
          className={`phase-btn ${phaseType === 'three' ? 'active' : ''}`}
          onClick={() => handlePhaseChange('three')}
        >
          {t('threePhase')}
        </button>
      </div>

      <div className="input-section">
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
            <label htmlFor="voltage" className="input-label">
              {t('voltage')}
            </label>
            <div className="input-with-unit">
              <input
                id="voltage"
                type="number"
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder={phaseType === 'single' ? '230' : '400'}
              />
            </div>
          </div>

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
              <div className="result-label">{t('current')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(2)}</span>
                <span className="result-unit">A</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
