'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

type ConcentrationUnit = 'cells/ml' | 'cells/µl' | 'cells/cl' | 'cells/liter';
type VolumeUnit = 'ml' | 'µl' | 'cl' | 'liter';

interface C1V1Result {
  calculatedValue: number;
  calculatedField: 'c1' | 'v1' | 'c2' | 'v2';
  formula: string;
}

// Conversion factors to base unit (cells/ml for concentration, ml for volume)
const CONCENTRATION_TO_BASE: Record<ConcentrationUnit, number> = {
  'cells/ml': 1,
  'cells/µl': 1000, // 1 µl = 0.001 ml, so cells/µl = 1000 × cells/ml
  'cells/cl': 0.1, // 1 cl = 10 ml, so cells/cl = 0.1 × cells/ml
  'cells/liter': 0.001, // 1 liter = 1000 ml, so cells/liter = 0.001 × cells/ml
};

const VOLUME_TO_BASE: Record<VolumeUnit, number> = {
  ml: 1,
  µl: 0.001, // 1 µl = 0.001 ml
  cl: 10, // 1 cl = 10 ml
  liter: 1000, // 1 liter = 1000 ml
};

const CONCENTRATION_UNITS: ConcentrationUnit[] = ['cells/ml', 'cells/µl', 'cells/cl', 'cells/liter'];
const VOLUME_UNITS: VolumeUnit[] = ['ml', 'µl', 'cl', 'liter'];

function formatNumber(value: number, decimals: number = 4): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

export function C1V1Calculator() {
  const t = useTranslations('calculators.c1v1');

  const [c1, setC1] = useState<string>('');
  const [c1Unit, setC1Unit] = useState<ConcentrationUnit>('cells/ml');
  const [v1, setV1] = useState<string>('');
  const [v1Unit, setV1Unit] = useState<VolumeUnit>('ml');
  const [c2, setC2] = useState<string>('');
  const [c2Unit, setC2Unit] = useState<ConcentrationUnit>('cells/ml');
  const [v2Unit, setV2Unit] = useState<VolumeUnit>('ml');
  const [result, setResult] = useState<C1V1Result | null>(null);

  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const parsedC1 = parseFloat(c1.replace(',', '.'));
    const parsedV1 = parseFloat(v1.replace(',', '.'));
    const parsedC2 = parseFloat(c2.replace(',', '.'));

    // Validate all three inputs are provided and positive
    if (!Number.isFinite(parsedC1) || parsedC1 <= 0 ||
        !Number.isFinite(parsedV1) || parsedV1 <= 0 ||
        !Number.isFinite(parsedC2) || parsedC2 <= 0) {
      setResult(null);
      return;
    }

    // Convert to base units
    const c1Base = parsedC1 * CONCENTRATION_TO_BASE[c1Unit];
    const v1Base = parsedV1 * VOLUME_TO_BASE[v1Unit];
    const c2Base = parsedC2 * CONCENTRATION_TO_BASE[c2Unit];

    if (c2Base === 0) {
      setResult(null);
      return;
    }

    // Calculate V2: V2 = (C1 × V1) / C2
    const v2Base = (c1Base * v1Base) / c2Base;

    if (!Number.isFinite(v2Base) || v2Base <= 0) {
      setResult(null);
      return;
    }

    // Convert V2 back to display unit
    const displayValue = v2Base / VOLUME_TO_BASE[v2Unit];
    const formula = `V2 = (C1 × V1) / C2 = (${formatNumber(parsedC1, 2)} ${c1Unit} × ${formatNumber(parsedV1, 2)} ${v1Unit}) / ${formatNumber(parsedC2, 2)} ${c2Unit}`;

    setResult({
      calculatedValue: displayValue,
      calculatedField: 'v2',
      formula,
    });
  };

  const handleReset = () => {
    setC1('');
    setV1('');
    setC2('');
    setResult(null);
  };

  const hasEnoughInputs = () => {
    return c1.trim() !== '' && v1.trim() !== '' && c2.trim() !== '';
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Initial Concentration */}
            <div className="input-card">
              <label htmlFor="c1" className="input-label">
                {t('c1Label')}
              </label>
              <div className="input-with-unit">
                <input
                  id="c1"
                  type="number"
                  step="0.0001"
                  value={c1}
                  onChange={(e) => setC1(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="1000"
                />
                <select
                  value={c1Unit}
                  onChange={(e) => setC1Unit(e.target.value as ConcentrationUnit)}
                  className="unit-select"
                >
                  {CONCENTRATION_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {t(`concentrationUnit_${unit.replace('/', '_')}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Initial Volume */}
            <div className="input-card">
              <label htmlFor="v1" className="input-label">
                {t('v1Label')}
              </label>
              <div className="input-with-unit">
                <input
                  id="v1"
                  type="number"
                  step="0.0001"
                  value={v1}
                  onChange={(e) => setV1(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="10"
                />
                <select
                  value={v1Unit}
                  onChange={(e) => setV1Unit(e.target.value as VolumeUnit)}
                  className="unit-select"
                >
                  {VOLUME_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {t(`volumeUnit_${unit}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Final Concentration */}
            <div className="input-card">
              <label htmlFor="c2" className="input-label">
                {t('c2Label')}
              </label>
              <div className="input-with-unit">
                <input
                  id="c2"
                  type="number"
                  step="0.0001"
                  value={c2}
                  onChange={(e) => setC2(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="100"
                />
                <select
                  value={c2Unit}
                  onChange={(e) => setC2Unit(e.target.value as ConcentrationUnit)}
                  className="unit-select"
                >
                  {CONCENTRATION_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {t(`concentrationUnit_${unit.replace('/', '_')}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Final Volume Unit Selector */}
            <div className="input-card">
              <label htmlFor="v2Unit" className="input-label">
                {t('v2UnitLabel')}
              </label>
              <div className="input-with-unit">
                <select
                  id="v2Unit"
                  value={v2Unit}
                  onChange={(e) => setV2Unit(e.target.value as VolumeUnit)}
                  className="unit-select"
                  style={{ width: '100%' }}
                >
                  {VOLUME_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {t(`volumeUnit_${unit}`)}
                    </option>
                  ))}
                </select>
              </div>
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
                  <div className="result-item">
                    <div className="result-label">
                      {result.calculatedField === 'c1' && t('c1Label')}
                      {result.calculatedField === 'v1' && t('v1Label')}
                      {result.calculatedField === 'c2' && t('c2Label')}
                      {result.calculatedField === 'v2' && t('v2Label')}
                    </div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{formatNumber(result.calculatedValue)}</span>
                      <span className="result-unit">
                        {result.calculatedField === 'c1' && t(`concentrationUnit_${c1Unit.replace('/', '_')}`)}
                        {result.calculatedField === 'v1' && t(`volumeUnit_${v1Unit}`)}
                        {result.calculatedField === 'c2' && t(`concentrationUnit_${c2Unit.replace('/', '_')}`)}
                        {result.calculatedField === 'v2' && t(`volumeUnit_${v2Unit}`)}
                      </span>
                      <CopyButton
                        text={`${formatNumber(result.calculatedValue)} ${
                          result.calculatedField === 'c1'
                            ? t(`concentrationUnit_${c1Unit.replace('/', '_')}`)
                            : result.calculatedField === 'v1'
                              ? t(`volumeUnit_${v1Unit}`)
                              : result.calculatedField === 'c2'
                                ? t(`concentrationUnit_${c2Unit.replace('/', '_')}`)
                                : t(`volumeUnit_${v2Unit}`)
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
                  <h3 className="example-heading">{t('calculationHeading')}</h3>
                  <div className="example-text" style={{ lineHeight: '1.8' }}>
                    <p>
                      <strong>{result.formula}</strong>
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                      {t('formulaExplanation')}
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
