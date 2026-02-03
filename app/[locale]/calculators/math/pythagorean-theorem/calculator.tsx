'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

const MAX_FRACTION_DIGITS = 6;

type LengthUnit = 'mm' | 'cm' | 'm' | 'km' | 'in' | 'ft' | 'yd' | 'mi' | 'nmi';

interface ResultData {
  a: number;
  b: number;
  c: number;
  area: number;
  perimeter: number;
  unit: LengthUnit;
  computed: 'a' | 'b' | 'c' | 'none';
}

function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(/,/g, '.');
  if (!normalized) return null;
  const num = Number(normalized);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function formatNumber(value: number, locale: string): string {
  return value.toLocaleString(locale, {
    maximumFractionDigits: MAX_FRACTION_DIGITS,
  });
}

function getUnitAbbr(unit: LengthUnit, t: (key: string) => string): string {
  const unitKey = `unitAbbr${unit.charAt(0).toUpperCase()}${unit.slice(1)}`;
  return t(unitKey);
}

export function PythagoreanTheoremCalculator() {
  const t = useTranslations('calculators.pythagoreanTheorem');
  const locale = useLocale();
  const [aValue, setAValue] = useState<string>('3');
  const [bValue, setBValue] = useState<string>('4');
  const [cValue, setCValue] = useState<string>('');
  const [aUnit, setAUnit] = useState<LengthUnit>('cm');
  const [bUnit, setBUnit] = useState<LengthUnit>('cm');
  const [cUnit, setCUnit] = useState<LengthUnit>('cm');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const resultRef = useScrollToResult(result);

  // Conversion factors to meters
  const toMeters: Record<LengthUnit, number> = {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mi: 1609.344,
    nmi: 1852,
  };

  const handleCalculate = () => {
    const a = parseNumber(aValue);
    const b = parseNumber(bValue);
    const c = parseNumber(cValue);

    const emptyCount = [a, b, c].filter((v) => v === null).length;

    if (emptyCount > 1) {
      setError(t('errorTwoEmpty'));
      setResult(null);
      return;
    }

    if (emptyCount === 0) {
      // Check if it's a valid right triangle
      const aMeters = a! * toMeters[aUnit];
      const bMeters = b! * toMeters[bUnit];
      const cMeters = c! * toMeters[cUnit];

      const sides = [aMeters, bMeters, cMeters].sort((x, y) => x - y);
      const hypotenuse = sides[2];
      const leg1 = sides[0];
      const leg2 = sides[1];

      const expectedHypotenuse = Math.sqrt(leg1 * leg1 + leg2 * leg2);
      const tolerance = 0.001 * hypotenuse;

      if (Math.abs(hypotenuse - expectedHypotenuse) > tolerance) {
        setError(t('errorNotRightTriangle'));
        setResult(null);
        return;
      }

      // Use the common unit (c unit as default for display)
      const commonUnit = cUnit;
      const aInCommon = aMeters / toMeters[commonUnit];
      const bInCommon = bMeters / toMeters[commonUnit];
      const cInCommon = cMeters / toMeters[commonUnit];

      const area = (leg1 * leg2) / 2 / toMeters[commonUnit] / toMeters[commonUnit];
      const perimeter = aInCommon + bInCommon + cInCommon;

      setError(null);
      setResult({
        a: aInCommon,
        b: bInCommon,
        c: cInCommon,
        area,
        perimeter,
        unit: commonUnit,
        computed: 'none',
      });
      return;
    }

    setError(null);

    // Calculate missing side
    if (a === null) {
      // a² = c² - b²
      const bMeters = b! * toMeters[bUnit];
      const cMeters = c! * toMeters[cUnit];

      if (cMeters <= bMeters) {
        setError(t('errorInvalidSides'));
        setResult(null);
        return;
      }

      const aMeters = Math.sqrt(cMeters * cMeters - bMeters * bMeters);
      const aInUnit = aMeters / toMeters[aUnit];
      const bInUnit = bMeters / toMeters[aUnit];
      const cInUnit = cMeters / toMeters[aUnit];

      const area = (aMeters * bMeters) / 2 / toMeters[aUnit] / toMeters[aUnit];
      const perimeter = aInUnit + bInUnit + cInUnit;

      setResult({
        a: aInUnit,
        b: bInUnit,
        c: cInUnit,
        area,
        perimeter,
        unit: aUnit,
        computed: 'a',
      });
    } else if (b === null) {
      // b² = c² - a²
      const aMeters = a! * toMeters[aUnit];
      const cMeters = c! * toMeters[cUnit];

      if (cMeters <= aMeters) {
        setError(t('errorInvalidSides'));
        setResult(null);
        return;
      }

      const bMeters = Math.sqrt(cMeters * cMeters - aMeters * aMeters);
      const aInUnit = aMeters / toMeters[bUnit];
      const bInUnit = bMeters / toMeters[bUnit];
      const cInUnit = cMeters / toMeters[bUnit];

      const area = (aMeters * bMeters) / 2 / toMeters[bUnit] / toMeters[bUnit];
      const perimeter = aInUnit + bInUnit + cInUnit;

      setResult({
        a: aInUnit,
        b: bInUnit,
        c: cInUnit,
        area,
        perimeter,
        unit: bUnit,
        computed: 'b',
      });
    } else if (c === null) {
      // c² = a² + b²
      const aMeters = a! * toMeters[aUnit];
      const bMeters = b! * toMeters[bUnit];

      const cMeters = Math.sqrt(aMeters * aMeters + bMeters * bMeters);
      const aInUnit = aMeters / toMeters[cUnit];
      const bInUnit = bMeters / toMeters[cUnit];
      const cInUnit = cMeters / toMeters[cUnit];

      const area = (aMeters * bMeters) / 2 / toMeters[cUnit] / toMeters[cUnit];
      const perimeter = aInUnit + bInUnit + cInUnit;

      setResult({
        a: aInUnit,
        b: bInUnit,
        c: cInUnit,
        area,
        perimeter,
        unit: cUnit,
        computed: 'c',
      });
    }
  };

  const handleReset = () => {
    setAValue('3');
    setBValue('4');
    setCValue('');
    setAUnit('cm');
    setBUnit('cm');
    setCUnit('cm');
    setError(null);
    setResult(null);
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="side-a" className="input-label">
                {t('sideA')}
              </label>
              <div className="input-with-unit">
                <input
                  id="side-a"
                  type="text"
                  inputMode="decimal"
                  value={aValue}
                  onChange={(e) => setAValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder={t('optional')}
                />
                <select
                  value={aUnit}
                  onChange={(e) => setAUnit(e.target.value as LengthUnit)}
                  className="unit-select"
                >
                  <option value="mm">{t('unitMm')}</option>
                  <option value="cm">{t('unitCm')}</option>
                  <option value="m">{t('unitM')}</option>
                  <option value="km">{t('unitKm')}</option>
                  <option value="in">{t('unitIn')}</option>
                  <option value="ft">{t('unitFt')}</option>
                  <option value="yd">{t('unitYd')}</option>
                  <option value="mi">{t('unitMi')}</option>
                  <option value="nmi">{t('unitNmi')}</option>
                </select>
              </div>
            </div>

            <div className="input-card">
              <label htmlFor="side-b" className="input-label">
                {t('sideB')}
              </label>
              <div className="input-with-unit">
                <input
                  id="side-b"
                  type="text"
                  inputMode="decimal"
                  value={bValue}
                  onChange={(e) => setBValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder={t('optional')}
                />
                <select
                  value={bUnit}
                  onChange={(e) => setBUnit(e.target.value as LengthUnit)}
                  className="unit-select"
                >
                  <option value="mm">{t('unitMm')}</option>
                  <option value="cm">{t('unitCm')}</option>
                  <option value="m">{t('unitM')}</option>
                  <option value="km">{t('unitKm')}</option>
                  <option value="in">{t('unitIn')}</option>
                  <option value="ft">{t('unitFt')}</option>
                  <option value="yd">{t('unitYd')}</option>
                  <option value="mi">{t('unitMi')}</option>
                  <option value="nmi">{t('unitNmi')}</option>
                </select>
              </div>
            </div>

            <div className="input-card">
              <label htmlFor="side-c" className="input-label">
                {t('sideC')}
              </label>
              <div className="input-with-unit">
                <input
                  id="side-c"
                  type="text"
                  inputMode="decimal"
                  value={cValue}
                  onChange={(e) => setCValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder={t('optional')}
                />
                <select
                  value={cUnit}
                  onChange={(e) => setCUnit(e.target.value as LengthUnit)}
                  className="unit-select"
                >
                  <option value="mm">{t('unitMm')}</option>
                  <option value="cm">{t('unitCm')}</option>
                  <option value="m">{t('unitM')}</option>
                  <option value="km">{t('unitKm')}</option>
                  <option value="in">{t('unitIn')}</option>
                  <option value="ft">{t('unitFt')}</option>
                  <option value="yd">{t('unitYd')}</option>
                  <option value="mi">{t('unitMi')}</option>
                  <option value="nmi">{t('unitNmi')}</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="seo-paragraph" style={{ color: 'var(--error)', marginBottom: 0, fontSize: '0.9rem' }}>
                {error}
              </p>
            )}

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
            {!result && (
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
                  {aValue || bValue || cValue ? t('clickCalculate') : t('enterSides')}
                </span>
              </div>
            )}
            {result && (
              <>
                <div className="result-display">
                  <div className="result-item">
                    <div className="result-label">{t('sideA')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">
                        {formatNumber(result.a, locale)} {getUnitAbbr(result.unit, t)}
                        {result.computed === 'a' && <span style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}>✓</span>}
                      </span>
                      <CopyButton text={`${formatNumber(result.a, locale)} ${getUnitAbbr(result.unit, t)}`} />
                    </div>
                  </div>
                  <div className="result-item">
                    <div className="result-label">{t('sideB')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">
                        {formatNumber(result.b, locale)} {getUnitAbbr(result.unit, t)}
                        {result.computed === 'b' && <span style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}>✓</span>}
                      </span>
                      <CopyButton text={`${formatNumber(result.b, locale)} ${getUnitAbbr(result.unit, t)}`} />
                    </div>
                  </div>
                  <div className="result-item">
                    <div className="result-label">{t('sideC')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">
                        {formatNumber(result.c, locale)} {getUnitAbbr(result.unit, t)}
                        {result.computed === 'c' && <span style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}>✓</span>}
                      </span>
                      <CopyButton text={`${formatNumber(result.c, locale)} ${getUnitAbbr(result.unit, t)}`} />
                    </div>
                  </div>
                  <div className="result-item">
                    <div className="result-label">{t('area')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">
                        {formatNumber(result.area, locale)} {getUnitAbbr(result.unit, t)}²
                      </span>
                      <CopyButton text={`${formatNumber(result.area, locale)} ${getUnitAbbr(result.unit, t)}²`} />
                    </div>
                  </div>
                  <div className="result-item">
                    <div className="result-label">{t('perimeter')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">
                        {formatNumber(result.perimeter, locale)} {getUnitAbbr(result.unit, t)}
                      </span>
                      <CopyButton text={`${formatNumber(result.perimeter, locale)} ${getUnitAbbr(result.unit, t)}`} />
                    </div>
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
