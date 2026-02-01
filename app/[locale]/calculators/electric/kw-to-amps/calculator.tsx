'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

export type KwToAmpsType = 'dc' | 'single' | 'three';

export function kwToAmpsDc(kw: number, voltage: number): number {
  if (voltage <= 0) return 0;
  return (kw * 1000) / voltage;
}

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
  const [phaseType, setPhaseType] = useState<KwToAmpsType>('single');
  const [kw, setKw] = useState<string>('');
  const [voltage, setVoltage] = useState<string>('230');
  const [powerFactor, setPowerFactor] = useState<string>('0.8');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const k = parseFloat(kw);
    const v = parseFloat(voltage);
    const pf = parseFloat(powerFactor);

    if (!isNaN(k) && !isNaN(v) && v > 0 && k >= 0) {
      if (phaseType === 'dc') {
        setResult(kwToAmpsDc(k, v));
      } else if (!isNaN(pf) && pf > 0 && pf <= 1) {
        const amps = phaseType === 'single'
          ? kwToAmpsSinglePhase(k, v, pf)
          : kwToAmpsThreePhase(k, v, pf);
        setResult(amps);
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setKw('');
    setVoltage(phaseType === 'dc' ? '24' : phaseType === 'three' ? '400' : '230');
    setPowerFactor('0.8');
    setResult(null);
  };

  const handlePhaseChange = (type: KwToAmpsType) => {
    const prev = phaseType;
    setPhaseType(type);
    setResult(null);
    if (type === 'dc') {
      if (prev !== 'dc') setVoltage('24');
    } else if (type === 'three') {
      if (voltage === '24' || voltage === '12' || voltage === '48') setVoltage('400');
      else if (voltage === '230') setVoltage('400');
    } else {
      if (voltage === '400') setVoltage('230');
      else if (voltage === '24' || voltage === '12' || voltage === '48') setVoltage('230');
    }
  };

  const showPowerFactor = phaseType !== 'dc';
  const voltPlaceholder = phaseType === 'dc' ? '24' : phaseType === 'three' ? '400' : '230';

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
        <div ref={resultRef} className="result-section">
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
                <CopyButton text={`${result.toFixed(2)} A`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
