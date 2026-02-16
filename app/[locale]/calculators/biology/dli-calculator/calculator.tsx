'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

type CalculationMode = 'forward' | 'findPPFD' | 'findHours';
type PlantType = 'microgreens' | 'leafyGreens' | 'floweringLow' | 'floweringHigh' | 'cannabisVeg' | 'cannabisFlower';
type LightSource = 'led' | 'hps' | 'metalHalide' | 'sunlight';

interface DLIRange {
  min: number;
  max: number;
}

const PLANT_DLI_RANGES: Record<PlantType, DLIRange> = {
  microgreens: { min: 6, max: 12 },
  leafyGreens: { min: 12, max: 17 },
  floweringLow: { min: 15, max: 20 },
  floweringHigh: { min: 20, max: 40 },
  cannabisVeg: { min: 20, max: 30 },
  cannabisFlower: { min: 30, max: 45 },
};

interface DLIResult {
  dli: number;
  status: 'tooLow' | 'optimal' | 'excessive';
  targetMin: number;
  targetMax: number;
  requiredPPFD?: number;
  requiredHours?: number;
  monthlyCost?: number;
}

// DLI = PPFD × Hours × 0.0036
// PPFD = DLI / (Hours × 0.0036)
// Hours = DLI / (PPFD × 0.0036)
function calculateDLI(ppfd: number, hours: number): number {
  return ppfd * hours * 0.0036;
}

function calculateRequiredPPFD(dli: number, hours: number): number {
  return dli / (hours * 0.0036);
}

function calculateRequiredHours(dli: number, ppfd: number): number {
  return dli / (ppfd * 0.0036);
}

function calculateMonthlyCost(watts: number, hoursPerDay: number, ratePerKWh: number): number {
  const dailyKWh = (watts / 1000) * hoursPerDay;
  const monthlyKWh = dailyKWh * 30;
  return monthlyKWh * ratePerKWh;
}

export function DLICalculator() {
  const t = useTranslations('calculators.dli');

  const [calculationMode, setCalculationMode] = useState<CalculationMode>('forward');
  const [ppfd, setPpfd] = useState<string>('');
  const [photoperiod, setPhotoperiod] = useState<string>('');
  const [plantType, setPlantType] = useState<PlantType>('leafyGreens');
  const [lightSource, setLightSource] = useState<LightSource>('led');
  
  // Reverse calculation inputs
  const [targetDLI, setTargetDLI] = useState<string>('');
  const [reverseHours, setReverseHours] = useState<string>('');
  const [reversePPFD, setReversePPFD] = useState<string>('');
  
  // Energy cost inputs
  const [lightWattage, setLightWattage] = useState<string>('');
  const [electricityRate, setElectricityRate] = useState<string>('0.12');
  
  const [result, setResult] = useState<DLIResult | null>(null);

  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const range = PLANT_DLI_RANGES[plantType];
    
    if (calculationMode === 'forward') {
      const parsedPPFD = parseFloat(ppfd.replace(',', '.'));
      const parsedHours = parseFloat(photoperiod.replace(',', '.'));

      if (!Number.isFinite(parsedPPFD) || !Number.isFinite(parsedHours) || parsedHours < 1 || parsedHours > 24) {
        setResult(null);
        return;
      }

      const dli = calculateDLI(parsedPPFD, parsedHours);
      let status: 'tooLow' | 'optimal' | 'excessive';
      
      if (dli < range.min) {
        status = 'tooLow';
      } else if (dli > range.max) {
        status = 'excessive';
      } else {
        status = 'optimal';
      }

      let monthlyCost: number | undefined;
      if (lightWattage.trim() !== '' && electricityRate.trim() !== '') {
        const parsedWattage = parseFloat(lightWattage.replace(',', '.'));
        const parsedRate = parseFloat(electricityRate.replace(',', '.'));
        if (Number.isFinite(parsedWattage) && Number.isFinite(parsedRate) && parsedWattage > 0 && parsedRate > 0) {
          monthlyCost = calculateMonthlyCost(parsedWattage, parsedHours, parsedRate);
        }
      }

      setResult({
        dli,
        status,
        targetMin: range.min,
        targetMax: range.max,
        monthlyCost,
      });
    } else if (calculationMode === 'findPPFD') {
      const parsedDLI = parseFloat(targetDLI.replace(',', '.'));
      const parsedHours = parseFloat(reverseHours.replace(',', '.'));

      if (!Number.isFinite(parsedDLI) || !Number.isFinite(parsedHours) || parsedHours < 1 || parsedHours > 24) {
        setResult(null);
        return;
      }

      const requiredPPFD = calculateRequiredPPFD(parsedDLI, parsedHours);
      const dli = parsedDLI;
      
      let status: 'tooLow' | 'optimal' | 'excessive';
      if (dli < range.min) {
        status = 'tooLow';
      } else if (dli > range.max) {
        status = 'excessive';
      } else {
        status = 'optimal';
      }

      setResult({
        dli,
        status,
        targetMin: range.min,
        targetMax: range.max,
        requiredPPFD,
      });
    } else if (calculationMode === 'findHours') {
      const parsedDLI = parseFloat(targetDLI.replace(',', '.'));
      const parsedPPFD = parseFloat(reversePPFD.replace(',', '.'));

      if (!Number.isFinite(parsedDLI) || !Number.isFinite(parsedPPFD) || parsedPPFD <= 0) {
        setResult(null);
        return;
      }

      const requiredHours = calculateRequiredHours(parsedDLI, parsedPPFD);
      const dli = parsedDLI;
      
      let status: 'tooLow' | 'optimal' | 'excessive';
      if (dli < range.min) {
        status = 'tooLow';
      } else if (dli > range.max) {
        status = 'excessive';
      } else {
        status = 'optimal';
      }

      setResult({
        dli,
        status,
        targetMin: range.min,
        targetMax: range.max,
        requiredHours,
      });
    }
  };

  // Auto-update target DLI when plant type changes in reverse modes
  useEffect(() => {
    if (calculationMode !== 'forward' && targetDLI.trim() === '') {
      const range = PLANT_DLI_RANGES[plantType];
      const midPoint = (range.min + range.max) / 2;
      setTargetDLI(midPoint.toFixed(1));
    }
  }, [plantType, calculationMode, targetDLI]);

  const handleReset = () => {
    setPpfd('');
    setPhotoperiod('');
    setTargetDLI('');
    setReverseHours('');
    setReversePPFD('');
    setLightWattage('');
    setElectricityRate('0.12');
    setResult(null);
  };

  const hasEnoughInputs = () => {
    if (calculationMode === 'forward') {
      return ppfd.trim() !== '' && photoperiod.trim() !== '';
    } else if (calculationMode === 'findPPFD') {
      return targetDLI.trim() !== '' && reverseHours.trim() !== '';
    } else if (calculationMode === 'findHours') {
      return targetDLI.trim() !== '' && reversePPFD.trim() !== '';
    }
    return false;
  };

  const getStatusColor = (status: string) => {
    if (status === 'optimal') return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: 'rgb(34, 197, 94)' };
    if (status === 'tooLow') return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: 'rgb(59, 130, 246)' };
    return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: 'rgb(239, 68, 68)' };
  };

  const getProgressPercentage = () => {
    if (!result) return 0;
    const { dli, targetMin, targetMax } = result;
    const range = targetMax - targetMin;
    const position = dli - targetMin;
    return Math.max(0, Math.min(100, (position / range) * 100));
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Calculation Mode Toggle */}
            <div className="input-card">
              <label className="input-label">{t('calculationMode')}</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setCalculationMode('forward')}
                  className={`btn ${calculationMode === 'forward' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, minWidth: '120px', padding: '0.5rem' }}
                >
                  {t('modeForward')}
                </button>
                <button
                  onClick={() => setCalculationMode('findPPFD')}
                  className={`btn ${calculationMode === 'findPPFD' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, minWidth: '120px', padding: '0.5rem' }}
                >
                  {t('modeFindPPFD')}
                </button>
                <button
                  onClick={() => setCalculationMode('findHours')}
                  className={`btn ${calculationMode === 'findHours' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, minWidth: '120px', padding: '0.5rem' }}
                >
                  {t('modeFindHours')}
                </button>
              </div>
            </div>

            {/* Forward Calculation Inputs */}
            {calculationMode === 'forward' && (
              <>
                <div className="input-card">
                  <label htmlFor="ppfd" className="input-label">
                    {t('lightIntensity')}
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="ppfd"
                      type="number"
                      step="1"
                      min="0"
                      value={ppfd}
                      onChange={(e) => setPpfd(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="300"
                    />
                    <span className="unit-select" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                      μmol/m²/s
                    </span>
                  </div>
                </div>

                <div className="input-card">
                  <label htmlFor="photoperiod" className="input-label">
                    {t('photoperiod')}
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="photoperiod"
                      type="number"
                      step="0.5"
                      min="1"
                      max="24"
                      value={photoperiod}
                      onChange={(e) => setPhotoperiod(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="16"
                    />
                    <span className="unit-select" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                      {t('hoursPerDay')}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Find PPFD Inputs */}
            {calculationMode === 'findPPFD' && (
              <>
                <div className="input-card">
                  <label htmlFor="targetDLI" className="input-label">
                    {t('targetDLI')}
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="targetDLI"
                      type="number"
                      step="0.1"
                      min="0"
                      value={targetDLI}
                      onChange={(e) => setTargetDLI(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="15"
                    />
                    <span className="unit-select" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                      mol/m²/d
                    </span>
                  </div>
                </div>

                <div className="input-card">
                  <label htmlFor="reverseHours" className="input-label">
                    {t('photoperiod')}
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="reverseHours"
                      type="number"
                      step="0.5"
                      min="1"
                      max="24"
                      value={reverseHours}
                      onChange={(e) => setReverseHours(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="16"
                    />
                    <span className="unit-select" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                      {t('hoursPerDay')}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Find Hours Inputs */}
            {calculationMode === 'findHours' && (
              <>
                <div className="input-card">
                  <label htmlFor="targetDLI2" className="input-label">
                    {t('targetDLI')}
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="targetDLI2"
                      type="number"
                      step="0.1"
                      min="0"
                      value={targetDLI}
                      onChange={(e) => setTargetDLI(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="15"
                    />
                    <span className="unit-select" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                      mol/m²/d
                    </span>
                  </div>
                </div>

                <div className="input-card">
                  <label htmlFor="reversePPFD" className="input-label">
                    {t('currentPPFD')}
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="reversePPFD"
                      type="number"
                      step="1"
                      min="0"
                      value={reversePPFD}
                      onChange={(e) => setReversePPFD(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="300"
                    />
                    <span className="unit-select" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                      μmol/m²/s
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Plant Type */}
            <div className="input-card">
              <label htmlFor="plantType" className="input-label">
                {t('plantType')}
              </label>
              <select
                id="plantType"
                value={plantType}
                onChange={(e) => setPlantType(e.target.value as PlantType)}
                className="unit-select"
                style={{ width: '100%' }}
              >
                <option value="microgreens">{t('plantMicrogreens')}</option>
                <option value="leafyGreens">{t('plantLeafyGreens')}</option>
                <option value="floweringLow">{t('plantFloweringLow')}</option>
                <option value="floweringHigh">{t('plantFloweringHigh')}</option>
                <option value="cannabisVeg">{t('plantCannabisVeg')}</option>
                <option value="cannabisFlower">{t('plantCannabisFlower')}</option>
              </select>
            </div>

            {/* Light Source Type */}
            <div className="input-card">
              <label htmlFor="lightSource" className="input-label">
                {t('lightSource')}
              </label>
              <select
                id="lightSource"
                value={lightSource}
                onChange={(e) => setLightSource(e.target.value as LightSource)}
                className="unit-select"
                style={{ width: '100%' }}
              >
                <option value="led">{t('sourceLED')}</option>
                <option value="hps">{t('sourceHPS')}</option>
                <option value="metalHalide">{t('sourceMetalHalide')}</option>
                <option value="sunlight">{t('sourceSunlight')}</option>
              </select>
            </div>

            {/* Energy Cost (only for forward mode) */}
            {calculationMode === 'forward' && (
              <>
                <div className="input-card">
                  <label htmlFor="lightWattage" className="input-label" style={{ fontSize: '0.9rem' }}>
                    {t('lightWattage')} ({t('optional')})
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="lightWattage"
                      type="number"
                      step="1"
                      min="0"
                      value={lightWattage}
                      onChange={(e) => setLightWattage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="100"
                    />
                    <span className="unit-select" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                      W
                    </span>
                  </div>
                </div>

                <div className="input-card">
                  <label htmlFor="electricityRate" className="input-label" style={{ fontSize: '0.9rem' }}>
                    {t('electricityRate')} ({t('optional')})
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="electricityRate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={electricityRate}
                      onChange={(e) => setElectricityRate(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="0.12"
                    />
                    <span className="unit-select" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                      $/kWh
                    </span>
                  </div>
                </div>
              </>
            )}

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
                  {/* DLI Value */}
                  <div className="result-item">
                    <div className="result-label">
                      {calculationMode === 'forward' ? t('dliValue') : calculationMode === 'findPPFD' ? t('requiredPPFD') : t('requiredHours')}
                    </div>
                    <div className="number-input result-value-box">
                      <span className="result-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {calculationMode === 'forward' 
                          ? result.dli.toFixed(2)
                          : calculationMode === 'findPPFD'
                          ? result.requiredPPFD!.toFixed(0)
                          : result.requiredHours!.toFixed(1)}
                      </span>
                      <span className="result-unit">
                        {calculationMode === 'forward' 
                          ? 'mol/m²/d'
                          : calculationMode === 'findPPFD'
                          ? 'μmol/m²/s'
                          : t('hours')}
                      </span>
                      <CopyButton
                        text={`${calculationMode === 'forward' 
                          ? result.dli.toFixed(2)
                          : calculationMode === 'findPPFD'
                          ? result.requiredPPFD!.toFixed(0)
                          : result.requiredHours!.toFixed(1)} ${calculationMode === 'forward' 
                          ? 'mol/m²/d'
                          : calculationMode === 'findPPFD'
                          ? 'μmol/m²/s'
                          : t('hours')}`}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="result-item">
                    <div className="result-label">{t('status')}</div>
                    <div
                      className="number-input result-value-box"
                      style={{
                        backgroundColor: getStatusColor(result.status).bg,
                        border: `2px solid ${getStatusColor(result.status).border}`,
                      }}
                    >
                      <span
                        className="result-value"
                        style={{
                          color: getStatusColor(result.status).text,
                          fontWeight: 'bold',
                        }}
                      >
                        {result.status === 'optimal' && t('statusOptimal')}
                        {result.status === 'tooLow' && t('statusTooLow')}
                        {result.status === 'excessive' && t('statusExcessive')}
                      </span>
                    </div>
                  </div>

                  {/* Comparison Bar */}
                  {calculationMode === 'forward' && (
                    <div className="result-item">
                      <div className="result-label">{t('targetRange')}: {result.targetMin} - {result.targetMax} mol/m²/d</div>
                      <div style={{ 
                        width: '100%', 
                        height: '30px', 
                        backgroundColor: 'var(--bg-secondary)', 
                        borderRadius: '4px',
                        position: 'relative',
                        overflow: 'hidden',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: `${(result.targetMin / 50) * 100}%`,
                          width: `${((result.targetMax - result.targetMin) / 50) * 100}%`,
                          height: '100%',
                          backgroundColor: 'rgba(34, 197, 94, 0.3)',
                        }} />
                        <div style={{
                          position: 'absolute',
                          left: `${(result.dli / 50) * 100}%`,
                          width: '4px',
                          height: '100%',
                          backgroundColor: getStatusColor(result.status).text,
                          transform: 'translateX(-50%)',
                        }} />
                        <div style={{
                          position: 'absolute',
                          left: `${(result.dli / 50) * 100}%`,
                          top: '-20px',
                          transform: 'translateX(-50%)',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          color: getStatusColor(result.status).text,
                        }}>
                          {result.dli.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Monthly Cost */}
                  {calculationMode === 'forward' && result.monthlyCost !== undefined && (
                    <div className="result-item">
                      <div className="result-label">{t('monthlyCost')}</div>
                      <div className="number-input result-value-box">
                        <span className="result-value" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                          ${result.monthlyCost.toFixed(2)}
                        </span>
                        <span className="result-unit" style={{ fontSize: '0.9rem' }}>
                          {t('perMonth')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Advice Card */}
                <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
                  <h3 className="example-heading">{t('adviceHeading')}</h3>
                  <div className="example-text" style={{ lineHeight: '1.8' }}>
                    <p style={{ marginBottom: '1rem' }}>
                      <strong>
                        {result.status === 'optimal' && t('adviceOptimal')}
                        {result.status === 'tooLow' && t('adviceTooLow')}
                        {result.status === 'excessive' && t('adviceExcessive')}
                      </strong>
                    </p>
                    <p>
                      {t('targetRange')}: {result.targetMin} - {result.targetMax} mol/m²/d ({t('for')} {t(`plant${plantType.charAt(0).toUpperCase() + plantType.slice(1)}`)})
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
                    {calculationMode === 'forward' && (
                      <p style={{ fontFamily: 'monospace', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem' }}>
                        DLI = PPFD × Hours × 0.0036<br />
                        DLI = {ppfd || 'PPFD'} × {photoperiod || 'Hours'} × 0.0036 = {result.dli.toFixed(2)} mol/m²/d
                      </p>
                    )}
                    {calculationMode === 'findPPFD' && (
                      <p style={{ fontFamily: 'monospace', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem' }}>
                        PPFD = DLI / (Hours × 0.0036)<br />
                        PPFD = {targetDLI || 'DLI'} / ({reverseHours || 'Hours'} × 0.0036) = {result.requiredPPFD!.toFixed(0)} μmol/m²/s
                      </p>
                    )}
                    {calculationMode === 'findHours' && (
                      <p style={{ fontFamily: 'monospace', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem' }}>
                        Hours = DLI / (PPFD × 0.0036)<br />
                        Hours = {targetDLI || 'DLI'} / ({reversePPFD || 'PPFD'} × 0.0036) = {result.requiredHours!.toFixed(1)} {t('hours')}
                      </p>
                    )}
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
