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

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

type AgeUnit = 'days' | 'weeks' | 'months';

type WeightUnit = 'g' | 'dag' | 'kg' | 'oz' | 'lb' | 'st';

interface DogSizeResult {
  adultWeightKg: number;
  rangeLowKg: number;
  rangeHighKg: number;
}

const AGE_UNITS: AgeUnit[] = ['weeks', 'days', 'months'];

const WEIGHT_UNITS: WeightUnit[] = ['g', 'dag', 'kg', 'oz', 'lb', 'st'];

// Convert weight in given unit to kilograms
const WEIGHT_TO_KG: Record<WeightUnit, number> = {
  g: 0.001,
  dag: 0.01,
  kg: 1,
  oz: 0.028349523125,
  lb: 0.45359237,
  st: 6.35029318,
};

function toKg(value: number, unit: WeightUnit): number {
  return value * (WEIGHT_TO_KG[unit] ?? 1);
}

function fromKg(valueKg: number, unit: WeightUnit): number {
  const factor = WEIGHT_TO_KG[unit] ?? 1;
  return valueKg / factor;
}

function ageToWeeks(age: number, unit: AgeUnit): number {
  if (!Number.isFinite(age) || age <= 0) return NaN;
  switch (unit) {
    case 'days':
      return age / 7;
    case 'months':
      // Average weeks per month
      return age * 4.345;
    case 'weeks':
    default:
      return age;
  }
}

function getAdultWeightEstimate(currentWeightKg: number, ageWeeks: number): DogSizeResult | null {
  if (!Number.isFinite(currentWeightKg) || currentWeightKg <= 0) return null;
  if (!Number.isFinite(ageWeeks) || ageWeeks <= 0) return null;

  // Simple linear projection: (current weight / age in weeks) × 52
  const adultWeightKg = (currentWeightKg / ageWeeks) * 52;

  if (!Number.isFinite(adultWeightKg) || adultWeightKg <= 0) return null;

  // +/- 10% range (matches the example values)
  const rangeLowKg = adultWeightKg * 0.9;
  const rangeHighKg = adultWeightKg * 1.1;

  return {
    adultWeightKg,
    rangeLowKg,
    rangeHighKg,
  };
}

function getSizeCategory(adultWeightKg: number): 'small' | 'medium' | 'large' | 'giant' {
  if (adultWeightKg < 10) return 'small';
  if (adultWeightKg < 25) return 'medium';
  if (adultWeightKg < 45) return 'large';
  return 'giant';
}

export function DogSizeCalculator() {
  const t = useTranslations('calculators.dogSize');

  const [ageValue, setAgeValue] = useState<string>('8');
  const [ageUnit, setAgeUnit] = useState<AgeUnit>('weeks');
  const [weightValue, setWeightValue] = useState<string>('5');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [adultWeightUnit, setAdultWeightUnit] = useState<WeightUnit>('kg');
  const [result, setResult] = useState<DogSizeResult | null>(null);

  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const age = parseFloat(ageValue.replace(',', '.'));
    const weight = parseFloat(weightValue.replace(',', '.'));

    const ageWeeks = ageToWeeks(age, ageUnit);
    const weightKg = toKg(weight, weightUnit);

    const estimate = getAdultWeightEstimate(weightKg, ageWeeks);

    if (!estimate) {
      setResult(null);
      return;
    }

    setResult(estimate);
  };

  const handleReset = () => {
    setAgeValue('8');
    setAgeUnit('weeks');
    setWeightValue('5');
    setWeightUnit('kg');
    setAdultWeightUnit('kg');
    setResult(null);
  };

  const age = parseFloat(ageValue.replace(',', '.'));
  const weight = parseFloat(weightValue.replace(',', '.'));
  const ageWeeks = ageToWeeks(age, ageUnit);

  const hasInputs =
    !Number.isNaN(age) && age > 0 && !Number.isNaN(weight) && weight > 0;

  const isAdultAlready = Number.isFinite(ageWeeks) && ageWeeks >= 52;

  const formatNumber = (value: number): string =>
    value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

  const getSizeLabel = (adultWeightKg: number): string => {
    const category = getSizeCategory(adultWeightKg);
    switch (category) {
      case 'small':
        return t('sizeCategorySmall');
      case 'medium':
        return t('sizeCategoryMedium');
      case 'large':
        return t('sizeCategoryLarge');
      case 'giant':
      default:
        return t('sizeCategoryGiant');
    }
  };

  const renderAdultWeightValue = (kgValue: number): string => {
    const converted = fromKg(kgValue, adultWeightUnit);
    return formatNumber(converted);
  };

  const ageUnitLabelKey: Record<AgeUnit, string> = {
    days: 'ageUnit_days',
    weeks: 'ageUnit_weeks',
    months: 'ageUnit_months',
  };

  const weightUnitLabelKey: Record<WeightUnit, string> = {
    g: 'weightUnit_g',
    dag: 'weightUnit_dag',
    kg: 'weightUnit_kg',
    oz: 'weightUnit_oz',
    lb: 'weightUnit_lb',
    st: 'weightUnit_st',
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Age Input */}
            <div className="input-card">
              <label htmlFor="ageValue" className="input-label">
                {t('ageLabel')}
              </label>
              <div className="mulch-calc-row">
                <input
                  id="ageValue"
                  type="number"
                  min="0"
                  step="0.1"
                  value={ageValue}
                  onChange={(e) => setAgeValue(e.target.value)}
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
                  {AGE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {t(ageUnitLabelKey[u] as any)}
                    </option>
                  ))}
                </select>
              </div>
              <p className="input-help-text">{t('ageHelp')}</p>
            </div>

            {/* Warning about adult dogs */}
            <div className="input-card" style={{ borderLeft: '4px solid #f97316' }}>
              <p className="input-help-text" style={{ marginBottom: 0 }}>
                {t('adultAgeWarning')}
              </p>
              {isAdultAlready && (
                <p className="input-help-text" style={{ marginBottom: 0, marginTop: '0.35rem', color: '#b91c1c' }}>
                  {t('adultAgeAlready')}
                </p>
              )}
            </div>

            {/* Weight Input */}
            <div className="input-card">
              <label htmlFor="weightValue" className="input-label">
                {t('weightLabel')}
              </label>
              <div className="mulch-calc-row">
                <input
                  id="weightValue"
                  type="number"
                  min="0"
                  step="0.1"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
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
                      {t(weightUnitLabelKey[u] as any)}
                    </option>
                  ))}
                </select>
              </div>
              <p className="input-help-text">{t('weightHelp')}</p>
            </div>

            {/* Action buttons */}
            <div className="action-buttons" style={{ minHeight: '44px', minWidth: '140px', gap: '0.75rem' }}>
              <button onClick={handleCalculate} className="btn btn-primary" disabled={!hasInputs}>
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
                  {hasInputs ? t('clickCalculate') : t('enterValue')}
                </span>
              </div>
            )}

            {result !== null && (
              <>
                <div className="result-display">
                  {/* Adult weight numeric value with unit selector */}
                  <div className="result-item">
                    <div className="result-label">{t('adultWeightLabel')}</div>
                    <div className="mulch-calc-row" style={{ marginBottom: '0.75rem' }}>
                      <div className="number-input result-value-box" style={{ flex: 1 }}>
                        <span className="result-value">
                          {renderAdultWeightValue(result.adultWeightKg)}
                        </span>
                        <span className="result-unit">
                          {t(weightUnitLabelKey[adultWeightUnit] as any)}
                        </span>
                        <CopyButton
                          text={`${renderAdultWeightValue(result.adultWeightKg)} ${t(
                            weightUnitLabelKey[adultWeightUnit] as any
                          )}`}
                        />
                      </div>
                      <select
                        value={adultWeightUnit}
                        onChange={(e) => setAdultWeightUnit(e.target.value as WeightUnit)}
                        className="number-input mulch-calc-field mulch-calc-select"
                        aria-label={t('adultWeightUnitLabel')}
                      >
                        {WEIGHT_UNITS.map((u) => (
                          <option key={u} value={u}>
                            {t(weightUnitLabelKey[u] as any)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Text summary */}
                <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
                  <h3 className="example-heading">{t('summaryHeading')}</h3>
                  <div className="example-text" style={{ lineHeight: '1.8' }}>
                    <p>
                      <strong>{t('summaryPuppyAgeTitle')}</strong>
                    </p>
                    <p>
                      {t('summaryPuppyAgeLine', {
                        age: formatNumber(age),
                        unit: t(ageUnitLabelKey[ageUnit] as any),
                      })}
                    </p>
                    <p>
                      <strong>{t('summaryPuppyWeightTitle')}</strong>
                    </p>
                    <p>
                      {t('summaryPuppyWeightLine', {
                        weight: formatNumber(weight),
                        unit: t(weightUnitLabelKey[weightUnit] as any),
                      })}
                    </p>
                    <p>{t('summaryPuppyWeightExplanation')}</p>

                    <p style={{ marginTop: '1.25rem' }}>
                      <strong>{t('summaryAdultWeightTitle')}</strong>
                    </p>
                    <p>
                      {t('summaryAdultWeightLine', {
                        weight: renderAdultWeightValue(result.adultWeightKg),
                        unit: t(weightUnitLabelKey[adultWeightUnit] as any),
                      })}
                    </p>
                    <p>
                      {t('summaryAdultRangeLine', {
                        low: renderAdultWeightValue(result.rangeLowKg),
                        high: renderAdultWeightValue(result.rangeHighKg),
                        unit: t(weightUnitLabelKey[adultWeightUnit] as any),
                      })}
                    </p>
                    <p>
                      {t('summarySizeCategoryLine', {
                        category: getSizeLabel(result.adultWeightKg),
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

