'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

// Area: length × width in given unit → m². Factor = (linear unit in m)².
const AREA_TO_SQ_M: Record<string, number> = {
  meters: 1,
  feet: 0.3048 * 0.3048,
  yards: 0.9144 * 0.9144,
  inches: 0.0254 * 0.0254,
  cm: 0.01 * 0.01,
};

// Depth: value in given unit → meters.
const DEPTH_TO_M: Record<string, number> = {
  cm: 0.01,
  feet: 0.3048,
  inches: 0.0254,
  yards: 0.9144,
  meters: 1,
};

const AREA_UNITS = ['meters', 'feet', 'cm', 'yards', 'inches'] as const;
const DEPTH_UNITS = ['cm', 'feet', 'inches', 'yards', 'meters'] as const;

export function MulchCalculator() {
  const t = useTranslations('calculators.mulchCalculator');
  const [areaMode, setAreaMode] = useState<'area' | 'dimensions'>('area');
  const [area, setArea] = useState<string>('200');
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [areaUnit, setAreaUnit] = useState<string>('meters');
  const [depth, setDepth] = useState<string>('2');
  const [depthUnit, setDepthUnit] = useState<string>('cm');
  const [price, setPrice] = useState<string>('');
  const [result, setResult] = useState<{ volume: number; cost: number | null; areaM2: number } | null>(null);
  const resultRef = useScrollToResult(result);

  const getAreaInSqM = (): number | null => {
    if (areaMode === 'area') {
      const a = parseFloat(area);
      return Number.isNaN(a) || a <= 0 ? null : a;
    }
    const l = parseFloat(length);
    const w = parseFloat(width);
    if (Number.isNaN(l) || l <= 0 || Number.isNaN(w) || w <= 0) return null;
    const factor = AREA_TO_SQ_M[areaUnit] ?? 1;
    return l * w * factor;
  };

  const getDepthInM = (): number | null => {
    const d = parseFloat(depth);
    if (Number.isNaN(d) || d <= 0) return null;
    const factor = DEPTH_TO_M[depthUnit] ?? 0.01;
    return d * factor;
  };

  const handleCalculate = () => {
    const areaM2 = getAreaInSqM();
    const depthM = getDepthInM();
    const p = price.trim() === '' ? null : parseFloat(price);

    if (areaM2 === null || depthM === null) {
      setResult(null);
      return;
    }
    if (p !== null && (Number.isNaN(p) || p < 0)) {
      setResult(null);
      return;
    }

    const volume = areaM2 * depthM;
    const cost = p !== null ? volume * p : null;
    setResult({ volume, cost, areaM2 });
  };

  const handleReset = () => {
    setAreaMode('area');
    setArea('200');
    setLength('');
    setWidth('');
    setAreaUnit('meters');
    setDepth('2');
    setDepthUnit('cm');
    setPrice('');
    setResult(null);
  };

  const areaM2 = getAreaInSqM();
  const depthM = getDepthInM();
  const valid =
    areaM2 !== null &&
    areaM2 > 0 &&
    depthM !== null &&
    depthM > 0 &&
    (price.trim() === '' || (!Number.isNaN(parseFloat(price)) && parseFloat(price) >= 0));

  const areaUnitLabel = t(`areaUnit_${areaUnit}` as 'areaUnit_meters');
  const depthUnitLabel = t(`depthUnit_${depthUnit}` as 'depthUnit_cm');

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Area: toggle Total Area vs Use dimensions */}
            <div className="input-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <label className="input-label" style={{ marginBottom: 0 }}>
                  <input
                    type="radio"
                    name="areaMode"
                    checked={areaMode === 'area'}
                    onChange={() => setAreaMode('area')}
                    style={{ marginRight: '0.35rem' }}
                  />
                  {t('totalArea')}
                </label>
                <label className="input-label" style={{ marginBottom: 0 }}>
                  <input
                    type="radio"
                    name="areaMode"
                    checked={areaMode === 'dimensions'}
                    onChange={() => setAreaMode('dimensions')}
                    style={{ marginRight: '0.35rem' }}
                  />
                  {t('useDimensions')}
                </label>
              </div>
              {areaMode === 'area' && (
                <div className="mulch-calc-row">
                  <input
                    id="area"
                    type="number"
                    min="0"
                    step="0.01"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    className="number-input mulch-calc-field"
                    placeholder="200"
                  />
                  <span className="mulch-calc-unit">{t('squareMeters')}</span>
                </div>
              )}
              {areaMode === 'dimensions' && (
                <div className="mulch-calc-rows">
                  <div className="mulch-calc-row">
                    <label htmlFor="length" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>{t('length')}</label>
                    <input
                      id="length"
                      type="number"
                      min="0"
                      step="0.01"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input mulch-calc-field"
                      placeholder={t('length')}
                    />
                    <span className="mulch-calc-unit">{t('length')}</span>
                    <span className="mulch-calc-times">×</span>
                    <label htmlFor="width" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>{t('width')}</label>
                    <input
                      id="width"
                      type="number"
                      min="0"
                      step="0.01"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input mulch-calc-field"
                      placeholder={t('width')}
                    />
                    <span className="mulch-calc-unit">{t('width')}</span>
                  </div>
                  <div className="mulch-calc-row">
                    <select
                      value={areaUnit}
                      onChange={(e) => setAreaUnit(e.target.value)}
                      className="number-input mulch-calc-field mulch-calc-select"
                      aria-label={t('areaUnitLabel')}
                    >
                      {AREA_UNITS.map((u) => (
                        <option key={u} value={u}>{t(`areaUnit_${u}` as 'areaUnit_meters')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="input-card">
              <label htmlFor="depth" className="input-label">
                {t('mulchDepth')}
              </label>
              <div className="mulch-calc-row">
                <input
                  id="depth"
                  type="number"
                  min="0"
                  step="0.1"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input mulch-calc-field"
                  placeholder="2"
                />
                <select
                  value={depthUnit}
                  onChange={(e) => setDepthUnit(e.target.value)}
                  className="number-input mulch-calc-field mulch-calc-select"
                  aria-label={t('depthUnitLabel')}
                >
                  {DEPTH_UNITS.map((u) => (
                    <option key={u} value={u}>{t(`depthUnit_${u}` as 'depthUnit_cm')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-card">
              <label htmlFor="price" className="input-label">
                {t('priceOptional')}
              </label>
              <div className="mulch-calc-row">
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input mulch-calc-field"
                  placeholder={t('pricePlaceholder')}
                />
                <span className="mulch-calc-unit">{t('pricePerCubicMeter')}</span>
              </div>
            </div>

            <div className="action-buttons" style={{ minHeight: '44px', minWidth: '140px', gap: '0.75rem' }}>
              <button onClick={handleCalculate} className="btn btn-primary">
                {t('calculate')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary">
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

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
                  {valid ? t('clickCalculate') : t('enterValue')}
                </span>
              </div>
            )}
            {result !== null && (
              <>
                <div className="result-display">
                  <div className="result-item">
                    <div className="result-label">{t('volumeNeeded')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{result.volume.toFixed(2)}</span>
                      <span className="result-unit">{t('cubicMeters')}</span>
                      <CopyButton text={`${result.volume.toFixed(2)} ${t('cubicMeters')}`} />
                    </div>
                  </div>
                  {result.cost !== null && (
                    <div className="result-item">
                      <div className="result-label">{t('estimatedCost')}</div>
                      <div className="number-input result-value-box">
                        <span className="result-value">{result.cost.toFixed(2)}</span>
                        <CopyButton text={result.cost.toFixed(2)} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
                  <h3 className="example-heading">{t('calculationHeading')}</h3>
                  <div className="example-text" style={{ lineHeight: '1.8' }}>
                    <p>
                      {t('calculationSummary', {
                        area: result.areaM2.toFixed(2),
                        depth: depthUnit === 'cm' ? depth : `${depth} ${depthUnitLabel}`,
                        volume: result.volume.toFixed(2),
                      })}
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
