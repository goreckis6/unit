'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

type AgeUnit = 'weeks' | 'days' | 'months';

type WeightUnit = 'g' | 'dag' | 'kg' | 'oz' | 'lb' | 'st';

interface DogSizeResult {
  adultWeightKg: number;
  rangeLowKg: number;
  rangeHighKg: number;
  ageWeeks: number;
  isAdultAlready: boolean;
}

const WEEKS_PER_YEAR = 52;

const WEIGHT_TO_KG: Record<WeightUnit, number> = {
  g: 0.001,
  dag: 0.01,
  kg: 1,
  oz: 0.0283495231,
  lb: 0.45359237,
  st: 6.35029318,
};

const WEIGHT_UNITS: WeightUnit[] = ['g', 'dag', 'kg', 'oz', 'lb', 'st'];

function ageToWeeks(ageValue: number, unit: AgeUnit): number {
  if (!Number.isFinite(ageValue) || ageValue <= 0) return 0;
  switch (unit) {
    case 'days':
      return ageValue / 7;
    case 'months':
      return ageValue * 4;
    case 'weeks':
    default:
      return ageValue;
  }
}

function formatNumber(value: number): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

export function DogSizeCalculator() {
  const t = useTranslations('calculators.dogSize');

  const [age, setAge] = useState<string>('8');
  const [ageUnit, setAgeUnit] = useState<AgeUnit>('weeks');
  const [weight, setWeight] = useState<string>('5');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [adultWeightUnit, setAdultWeightUnit] = useState<WeightUnit>('kg');
  const [result, setResult] = useState<DogSizeResult | null>(null);

  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const parsedAge = parseFloat(age.replace(',', '.'));
    const parsedWeight = parseFloat(weight.replace(',', '.'));

    const ageWeeks = ageToWeeks(parsedAge, ageUnit);

    if (!Number.isFinite(parsedAge) || parsedAge <= 0 || !Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setResult(null);
      return;
    }

    if (!Number.isFinite(ageWeeks) || ageWeeks <= 0) {
      setResult(null);
      return;
    }

    const weightKg = parsedWeight * (WEIGHT_TO_KG[weightUnit] ?? 1);

    const isAdultAlready = ageWeeks >= WEEKS_PER_YEAR;

    let adultWeightKg: number;
    if (isAdultAlready) {
      adultWeightKg = weightKg;
    } else {
      // Simple linear projection based on common puppy-growth rule of thumb:
      // Adult weight = (current weight / age in weeks) × 52.
      adultWeightKg = (weightKg / ageWeeks) * WEEKS_PER_YEAR;
    }

    // Provide a realistic range of ±10% around the central estimate.
    const rangeLowKg = adultWeightKg * 0.9;
    const rangeHighKg = adultWeightKg * 1.1;

    setResult({
      adultWeightKg,
      rangeLowKg,
      rangeHighKg,
      ageWeeks,
      isAdultAlready,
    });
  };

  const handleReset = () => {
    setAge('8');
    setAgeUnit('weeks');
    setWeight('5');
    setWeightUnit('kg');
    setAdultWeightUnit('kg');
    setResult(null);
  };

  const hasValues = age.trim().length > 0 && weight.trim().length > 0;

  const convertKgToUnit = (kg: number, unit: WeightUnit): number => {
    const factor = WEIGHT_TO_KG[unit] ?? 1;
    return kg / factor;
  };

  const displayAdultWeight = result ? convertKgToUnit(result.adultWeightKg, adultWeightUnit) : null;
  const displayRangeLow = result ? convertKgToUnit(result.rangeLowKg, adultWeightUnit) : null;
  const displayRangeHigh = result ? convertKgToUnit(result.rangeHighKg, adultWeightUnit) : null;

  const getSizeCategoryKey = (adultWeightKg: number): string => {
    // Categories match the ranges described in the SEO content:
    // Toy:   < 5.4 kg  (< 12 lb)
    // Small: 5.4–10 kg (12–22 lb)
    // Medium: 10–25.9 kg (22–57 lb)
    // Large: 25.9–44.9 kg (57–99 lb)
    // Giant: ≥ 44.9 kg  (≥ 99 lb)
    if (adultWeightKg < 5.4) return 'sizeToy';
    if (adultWeightKg < 10) return 'sizeSmall';
    if (adultWeightKg < 25.9) return 'sizeMedium';
    if (adultWeightKg < 44.9) return 'sizeLarge';
    return 'sizeGiant';
  };

  const sizeCategoryLabel =
    result && t(getSizeCategoryKey(result.adultWeightKg) as 'sizeSmall');

  const adultUnitLabel = t(`weightUnit_${adultWeightUnit}` as 'weightUnit_kg');
  const puppyUnitLabel = t(`weightUnit_${weightUnit}` as 'weightUnit_kg');

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Age input */}
            <div className="input-card">
              <label htmlFor="age" className="input-label">
                {t('ageLabel')}
              </label>
              <div className="mulch-calc-row">
                <input
                  id="age"
                  type="number"
                  min="0"
                  step="0.1"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input mulch-calc-field"
                  placeholder="8"
                />
                <select
                  value={ageUnit}
                  onChange={(e) => setAgeUnit(e.target.value as AgeUnit)}
                  className="number-input mulch-calc-field mulch-calc-select"
                  aria-label={t('ageUnitLabel')}
                >
                  <option value="weeks">{t('ageUnit_weeks')}</option>
                  <option value="days">{t('ageUnit_days')}</option>
                  <option value="months">{t('ageUnit_months')}</option>
                </select>
              </div>
              <p className="input-help-text">{t('ageHelp')}</p>
              <p className="input-help-text" style={{ fontWeight: 500 }}>
                {t('ageWarning')}
              </p>
            </div>

            {/* Weight input */}
            <div className="input-card">
              <label htmlFor="weight" className="input-label">
                {t('weightLabel')}
              </label>
              <div className="mulch-calc-row">
                <input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input mulch-calc-field"
                  placeholder="5"
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
                  className="number-input mulch-calc-field mulch-calc-select"
                  aria-label={t('weightUnitLabel')}
                >
                  {WEIGHT_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {t(`weightUnit_${u}` as 'weightUnit_kg')}
                    </option>
                  ))}
                </select>
              </div>
              <p className="input-help-text">{t('weightHelp')}</p>
            </div>

            {/* Adult weight unit selection */}
            <div className="input-card">
              <label htmlFor="adultWeightUnit" className="input-label">
                {t('adultWeightUnitLabel')}
              </label>
              <div className="mulch-calc-row">
                <select
                  id="adultWeightUnit"
                  value={adultWeightUnit}
                  onChange={(e) => setAdultWeightUnit(e.target.value as WeightUnit)}
                  className="number-input mulch-calc-field mulch-calc-select"
                >
                  {WEIGHT_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {t(`weightUnit_${u}` as 'weightUnit_kg')}
                    </option>
                  ))}
                </select>
              </div>
              <p className="input-help-text">{t('adultWeightUnitHelp')}</p>
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
                  {hasValues ? t('clickCalculate') : t('enterValue')}
                </span>
              </div>
            )}

            {result !== null && displayAdultWeight !== null && (
              <>
                <div className="result-display">
                  <div className="result-item">
                    <div className="result-label">{t('adultWeightLabel')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{formatNumber(displayAdultWeight)}</span>
                      <span className="result-unit">{adultUnitLabel}</span>
                      <CopyButton text={`${formatNumber(displayAdultWeight)} ${adultUnitLabel}`} />
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">{t('adultWeightRangeLabel')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">
                        {formatNumber(displayRangeLow ?? 0)}–{formatNumber(displayRangeHigh ?? 0)}
                      </span>
                      <span className="result-unit">{adultUnitLabel}</span>
                      <CopyButton
                        text={`${formatNumber(displayRangeLow ?? 0)}–${formatNumber(
                          displayRangeHigh ?? 0,
                        )} ${adultUnitLabel}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
                  <h3 className="example-heading">{t('summaryHeading')}</h3>
                  <div className="example-text" style={{ lineHeight: '1.8' }}>
                    <p>
                      <strong>{t('summaryYourPuppyAge')}</strong>{' '}
                      {formatNumber(parseFloat(age || '0'))} {t(`ageUnit_${ageUnit}` as 'ageUnit_weeks')}
                    </p>
                    <p>
                      <strong>{t('summaryWeightNow')}</strong>{' '}
                      {formatNumber(parseFloat(weight || '0'))} {puppyUnitLabel}
                    </p>
                    <p>{t('summaryWeightNowHelper')}</p>
                    <p>
                      <strong>{t('summaryAdultWeight')}</strong>{' '}
                      {formatNumber(displayAdultWeight)} {adultUnitLabel}
                    </p>
                    <p>
                      {t('summaryAdultWeightRange', {
                        rangeLow: formatNumber(displayRangeLow ?? 0),
                        rangeHigh: formatNumber(displayRangeHigh ?? 0),
                        unit: adultUnitLabel,
                      })}
                    </p>
                    <p>
                      {result.isAdultAlready
                        ? t('summaryAdultAlready')
                        : t('summarySizeCategory', { sizeCategory: sizeCategoryLabel })}
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
