'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

type TempUnit = 'fahrenheit' | 'celsius';
type GrowthStage = 'propagation' | 'vegetative' | 'earlyFlowering' | 'lateFlowering';

interface VPDResult {
  vpdValue: number;
  status: 'optimal' | 'tooLow' | 'tooHigh';
  leafTemp: number;
  airSVP: number;
  leafSVP: number;
  advice: string;
}

interface StageRange {
  min: number;
  max: number;
}

const STAGE_RANGES: Record<GrowthStage, StageRange> = {
  propagation: { min: 0.4, max: 0.8 },
  vegetative: { min: 0.8, max: 1.2 },
  earlyFlowering: { min: 1.0, max: 1.3 },
  lateFlowering: { min: 1.2, max: 1.6 },
};

// Tetens equation for calculating Saturated Vapor Pressure (SVP) in kPa
function calculateSVP(tempCelsius: number): number {
  return 0.61078 * Math.exp((17.27 * tempCelsius) / (tempCelsius + 237.3));
}

function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

export function VPDCalculator() {
  const t = useTranslations('calculators.vpd');

  const [airTemp, setAirTemp] = useState<string>('');
  const [tempUnit, setTempUnit] = useState<TempUnit>('fahrenheit');
  const [relativeHumidity, setRelativeHumidity] = useState<string>('');
  const [useLeafOffset, setUseLeafOffset] = useState<boolean>(true);
  const [leafOffset, setLeafOffset] = useState<string>('-2');
  const [actualLeafTemp, setActualLeafTemp] = useState<string>('');
  const [growthStage, setGrowthStage] = useState<GrowthStage>('vegetative');
  const [result, setResult] = useState<VPDResult | null>(null);

  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const parsedAirTemp = parseFloat(airTemp.replace(',', '.'));
    const parsedRH = parseFloat(relativeHumidity.replace(',', '.'));

    // Validate inputs
    if (!Number.isFinite(parsedAirTemp) || !Number.isFinite(parsedRH) || parsedRH < 0 || parsedRH > 100) {
      setResult(null);
      return;
    }

    // Convert to Celsius for calculation
    const airTempC = tempUnit === 'fahrenheit' ? fahrenheitToCelsius(parsedAirTemp) : parsedAirTemp;

    // Calculate leaf temperature
    let leafTempC: number;
    if (useLeafOffset) {
      const parsedOffset = parseFloat(leafOffset.replace(',', '.'));
      if (!Number.isFinite(parsedOffset)) {
        setResult(null);
        return;
      }
      const offsetC = tempUnit === 'fahrenheit' ? parsedOffset * (5 / 9) : parsedOffset;
      leafTempC = airTempC + offsetC;
    } else {
      const parsedLeafTemp = parseFloat(actualLeafTemp.replace(',', '.'));
      if (!Number.isFinite(parsedLeafTemp)) {
        setResult(null);
        return;
      }
      leafTempC = tempUnit === 'fahrenheit' ? fahrenheitToCelsius(parsedLeafTemp) : parsedLeafTemp;
    }

    // Calculate SVP for air and leaf temperatures
    const airSVP = calculateSVP(airTempC);
    const leafSVP = calculateSVP(leafTempC);

    // Calculate VPD
    const vpd = leafSVP - (airSVP * parsedRH) / 100;

    // Determine status based on growth stage
    const stageRange = STAGE_RANGES[growthStage];
    let status: 'optimal' | 'tooLow' | 'tooHigh';
    let advice: string;

    if (vpd < stageRange.min) {
      status = 'tooLow';
      advice = t('adviceTooLow');
    } else if (vpd > stageRange.max) {
      status = 'tooHigh';
      advice = t('adviceTooHigh');
    } else {
      status = 'optimal';
      advice = t('adviceOptimal');
    }

    setResult({
      vpdValue: vpd,
      status,
      leafTemp: tempUnit === 'fahrenheit' ? celsiusToFahrenheit(leafTempC) : leafTempC,
      airSVP,
      leafSVP,
      advice,
    });
  };

  // Auto-recalculate when temp unit or growth stage changes
  useEffect(() => {
    if (airTemp.trim() !== '' && relativeHumidity.trim() !== '') {
      if (useLeafOffset && leafOffset.trim() !== '') {
        handleCalculate();
      } else if (!useLeafOffset && actualLeafTemp.trim() !== '') {
        handleCalculate();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempUnit, growthStage]);

  const handleReset = () => {
    setAirTemp('');
    setRelativeHumidity('');
    setLeafOffset('-2');
    setActualLeafTemp('');
    setResult(null);
  };

  const hasEnoughInputs = () => {
    if (airTemp.trim() === '' || relativeHumidity.trim() === '') return false;
    if (useLeafOffset) {
      return leafOffset.trim() !== '';
    } else {
      return actualLeafTemp.trim() !== '';
    }
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Air Temperature */}
            <div className="input-card">
              <label htmlFor="airTemp" className="input-label">
                {t('airTemp')}
              </label>
              <div className="input-with-unit">
                <input
                  id="airTemp"
                  type="number"
                  step="0.1"
                  value={airTemp}
                  onChange={(e) => setAirTemp(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder={tempUnit === 'fahrenheit' ? '75' : '24'}
                />
                <select
                  value={tempUnit}
                  onChange={(e) => setTempUnit(e.target.value as TempUnit)}
                  className="unit-select"
                >
                  <option value="fahrenheit">{t('fahrenheit')}</option>
                  <option value="celsius">{t('celsius')}</option>
                </select>
              </div>
            </div>

            {/* Relative Humidity */}
            <div className="input-card">
              <label htmlFor="rh" className="input-label">
                {t('relativeHumidity')}
              </label>
              <div className="input-with-unit">
                <input
                  id="rh"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={relativeHumidity}
                  onChange={(e) => setRelativeHumidity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="60"
                />
                <span className="unit-select" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                  %
                </span>
              </div>
            </div>

            {/* Leaf Temperature Toggle */}
            <div className="input-card">
              <label className="input-label">{t('leafTempMethod')}</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  onClick={() => setUseLeafOffset(true)}
                  className={`btn ${useLeafOffset ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.5rem' }}
                >
                  {t('useOffset')}
                </button>
                <button
                  onClick={() => setUseLeafOffset(false)}
                  className={`btn ${!useLeafOffset ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.5rem' }}
                >
                  {t('useActual')}
                </button>
              </div>

              {useLeafOffset ? (
                <div>
                  <label htmlFor="leafOffset" className="input-label" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    {t('leafOffset')}
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="leafOffset"
                      type="number"
                      step="0.1"
                      value={leafOffset}
                      onChange={(e) => setLeafOffset(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="-2"
                    />
                    <span className="unit-select" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                      {tempUnit === 'fahrenheit' ? '°F' : '°C'}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="leafTemp" className="input-label" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    {t('actualLeafTemp')}
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="leafTemp"
                      type="number"
                      step="0.1"
                      value={actualLeafTemp}
                      onChange={(e) => setActualLeafTemp(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder={tempUnit === 'fahrenheit' ? '73' : '23'}
                    />
                    <select
                      value={tempUnit}
                      onChange={(e) => setTempUnit(e.target.value as TempUnit)}
                      className="unit-select"
                    >
                      <option value="fahrenheit">{t('fahrenheit')}</option>
                      <option value="celsius">{t('celsius')}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Growth Stage */}
            <div className="input-card">
              <label htmlFor="growthStage" className="input-label">
                {t('growthStage')}
              </label>
              <select
                id="growthStage"
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value as GrowthStage)}
                className="unit-select"
                style={{ width: '100%' }}
              >
                <option value="propagation">{t('stagePropagation')}</option>
                <option value="vegetative">{t('stageVegetative')}</option>
                <option value="earlyFlowering">{t('stageEarlyFlowering')}</option>
                <option value="lateFlowering">{t('stageLateFlowering')}</option>
              </select>
            </div>

            <div className="action-buttons" style={{ minHeight: '44px', minWidth: '140px', gap: '0.75rem' }}>
              <button onClick={handleCalculate} className="btn btn-primary" disabled={!hasEnoughInputs()}>
                {t('calculate')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary">
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Result */}
        <div
          ref={resultRef}
          className="result-section"
          style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}
        >
          <div className="input-card">
            <label className="input-label">{t('result')}</label>
            {result === null && (
              <div
                className="number-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '52px',
                  padding: '0.75rem 1rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>
                  {hasEnoughInputs() ? t('clickCalculate') : t('enterValue')}
                </span>
              </div>
            )}
            {result !== null && (
              <>
                <div className="result-display">
                  {/* VPD Value */}
                  <div className="result-item">
                    <div className="result-label">{t('vpdValue')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {result.vpdValue.toFixed(2)}
                      </span>
                      <span className="result-unit">kPa</span>
                      <CopyButton text={`${result.vpdValue.toFixed(2)} kPa`} />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="result-item">
                    <div className="result-label">{t('status')}</div>
                    <div
                      className="number-input result-value-box"
                      style={{
                        backgroundColor:
                          result.status === 'optimal'
                            ? 'rgba(34, 197, 94, 0.1)'
                            : result.status === 'tooLow'
                              ? 'rgba(59, 130, 246, 0.1)'
                              : 'rgba(239, 68, 68, 0.1)',
                        border:
                          result.status === 'optimal'
                            ? '2px solid rgba(34, 197, 94, 0.3)'
                            : result.status === 'tooLow'
                              ? '2px solid rgba(59, 130, 246, 0.3)'
                              : '2px solid rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      <span
                        className="result-value"
                        style={{
                          color:
                            result.status === 'optimal'
                              ? 'rgb(34, 197, 94)'
                              : result.status === 'tooLow'
                                ? 'rgb(59, 130, 246)'
                                : 'rgb(239, 68, 68)',
                          fontWeight: 'bold',
                        }}
                      >
                        {result.status === 'optimal' && t('statusOptimal')}
                        {result.status === 'tooLow' && t('statusTooLow')}
                        {result.status === 'tooHigh' && t('statusTooHigh')}
                      </span>
                    </div>
                  </div>

                  {/* Leaf Temperature */}
                  <div className="result-item">
                    <div className="result-label">{t('calculatedLeafTemp')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{result.leafTemp.toFixed(1)}</span>
                      <span className="result-unit">{tempUnit === 'fahrenheit' ? '°F' : '°C'}</span>
                      <CopyButton
                        text={`${result.leafTemp.toFixed(1)} ${tempUnit === 'fahrenheit' ? '°F' : '°C'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Advice Card */}
                <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
                  <h3 className="example-heading">{t('adviceHeading')}</h3>
                  <div className="example-text" style={{ lineHeight: '1.8' }}>
                    <p style={{ marginBottom: '1rem' }}>
                      <strong>{result.advice}</strong>
                    </p>
                    <p>
                      {t('targetRange')}: {STAGE_RANGES[growthStage].min} - {STAGE_RANGES[growthStage].max} kPa
                    </p>
                  </div>
                </div>

                {/* Calculation Details */}
                <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
                  <h3 className="example-heading">{t('calculationHeading')}</h3>
                  <div className="example-text" style={{ lineHeight: '1.8' }}>
                    <p>
                      <strong>{t('formulaLabel')}</strong>
                    </p>
                    <p style={{ fontFamily: 'monospace', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem' }}>
                      VPD = SVP(leaf) - SVP(air) × (RH / 100)
                    </p>
                    <p style={{ marginTop: '1rem' }}>
                      SVP(air) = {result.airSVP.toFixed(3)} kPa<br />
                      SVP(leaf) = {result.leafSVP.toFixed(3)} kPa<br />
                      VPD = {result.leafSVP.toFixed(3)} - {result.airSVP.toFixed(3)} × ({relativeHumidity}/100) = {result.vpdValue.toFixed(2)} kPa
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
