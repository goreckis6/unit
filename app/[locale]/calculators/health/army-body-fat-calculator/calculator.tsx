'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

interface BodyFatResult {
  bodyFatPercentage: number;
  maxAllowable: number;
  status: 'pass' | 'fail' | 'exempt';
  poundsToLose?: number;
  bmi: number;
}

export function ArmyBodyFatCalculator() {
  const t = useTranslations('calculators.armyBodyFat');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<string>('');
  const [heightInches, setHeightInches] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [waist, setWaist] = useState<string>('');
  const [neck, setNeck] = useState<string>('');
  const [hips, setHips] = useState<string>('');
  const [acftScore, setAcftScore] = useState<boolean>(false);
  const [result, setResult] = useState<BodyFatResult | null>(null);
  const resultRef = useScrollToResult(result);

  const getMaxAllowableBodyFat = (ageNum: number, genderVal: 'male' | 'female'): number => {
    if (genderVal === 'male') {
      if (ageNum >= 17 && ageNum <= 20) return 20;
      if (ageNum >= 21 && ageNum <= 27) return 22;
      if (ageNum >= 28 && ageNum <= 39) return 24;
      if (ageNum >= 40) return 26;
    } else {
      if (ageNum >= 17 && ageNum <= 20) return 30;
      if (ageNum >= 21 && ageNum <= 27) return 32;
      if (ageNum >= 28 && ageNum <= 39) return 34;
      if (ageNum >= 40) return 36;
    }
    return 0;
  };

  const calculateBodyFat = (
    heightVal: number,
    waistVal: number,
    neckVal: number,
    hipsVal: number,
    genderVal: 'male' | 'female'
  ): number => {
    if (genderVal === 'male') {
      // Army Male Formula: 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
      return 86.010 * Math.log10(waistVal - neckVal) - 70.041 * Math.log10(heightVal) + 36.76;
    } else {
      // Army Female Formula: 163.205 × log10(waist + hips - neck) - 97.684 × log10(height) - 78.387
      return (
        163.205 * Math.log10(waistVal + hipsVal - neckVal) - 97.684 * Math.log10(heightVal) - 78.387
      );
    }
  };

  const handleCalculate = () => {
    const heightVal = parseFloat(heightInches);
    const waistVal = parseFloat(waist);
    const neckVal = parseFloat(neck);
    const weightVal = parseFloat(weight);
    const ageVal = parseInt(age);
    const hipsVal = gender === 'female' ? parseFloat(hips) : 0;

    if (
      Number.isNaN(heightVal) ||
      Number.isNaN(waistVal) ||
      Number.isNaN(neckVal) ||
      Number.isNaN(weightVal) ||
      Number.isNaN(ageVal) ||
      (gender === 'female' && Number.isNaN(hipsVal))
    ) {
      setResult(null);
      return;
    }

    // Check ACFT exemption
    if (acftScore) {
      const bmi = (weightVal / (heightVal * heightVal)) * 703;
      setResult({
        bodyFatPercentage: 0,
        maxAllowable: getMaxAllowableBodyFat(ageVal, gender),
        status: 'exempt',
        bmi,
      });
      return;
    }

    const bodyFatPercentage = calculateBodyFat(heightVal, waistVal, neckVal, hipsVal, gender);
    const maxAllowable = getMaxAllowableBodyFat(ageVal, gender);
    const bmi = (weightVal / (heightVal * heightVal)) * 703;

    let poundsToLose: number | undefined;
    if (bodyFatPercentage > maxAllowable) {
      // Calculate approximate pounds to lose
      const excessFat = bodyFatPercentage - maxAllowable;
      poundsToLose = Math.ceil((excessFat / 100) * weightVal);
    }

    setResult({
      bodyFatPercentage,
      maxAllowable,
      status: bodyFatPercentage <= maxAllowable ? 'pass' : 'fail',
      poundsToLose,
      bmi,
    });
  };

  const handleReset = () => {
    setAge('');
    setHeightInches('');
    setWeight('');
    setWaist('');
    setNeck('');
    setHips('');
    setAcftScore(false);
    setResult(null);
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Gender Selection */}
            <div className="input-card">
              <label className="input-label">{t('gender')}</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setGender('male')}
                  className={`btn ${gender === 'male' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  {t('male')}
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`btn ${gender === 'female' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  {t('female')}
                </button>
              </div>
            </div>

            {/* Age */}
            <div className="input-card">
              <label htmlFor="age" className="input-label">
                {t('age')}
              </label>
              <div className="input-with-unit">
                <input
                  id="age"
                  type="number"
                  min="17"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="number-input"
                  placeholder="25"
                />
                <span className="unit-label">{t('years')}</span>
              </div>
            </div>

            {/* Height */}
            <div className="input-card">
              <label htmlFor="height" className="input-label">
                {t('height')}
              </label>
              <div className="input-with-unit">
                <input
                  id="height"
                  type="number"
                  step="0.25"
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  className="number-input"
                  placeholder="70"
                />
                <span className="unit-label">{t('inches')}</span>
              </div>
            </div>

            {/* Weight */}
            <div className="input-card">
              <label htmlFor="weight" className="input-label">
                {t('weight')}
              </label>
              <div className="input-with-unit">
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="number-input"
                  placeholder="180"
                />
                <span className="unit-label">{t('lbs')}</span>
              </div>
            </div>

            {/* Neck Circumference */}
            <div className="input-card">
              <label htmlFor="neck" className="input-label">
                {t('neckCircumference')}
              </label>
              <div className="input-with-unit">
                <input
                  id="neck"
                  type="number"
                  step="0.25"
                  value={neck}
                  onChange={(e) => setNeck(e.target.value)}
                  className="number-input"
                  placeholder="15"
                />
                <span className="unit-label">{t('inches')}</span>
              </div>
              <p className="input-hint">{t('neckHint')}</p>
            </div>

            {/* Waist Circumference */}
            <div className="input-card">
              <label htmlFor="waist" className="input-label">
                {t('waistCircumference')}
              </label>
              <div className="input-with-unit">
                <input
                  id="waist"
                  type="number"
                  step="0.25"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="number-input"
                  placeholder="32"
                />
                <span className="unit-label">{t('inches')}</span>
              </div>
              <p className="input-hint">
                {gender === 'male' ? t('waistHintMale') : t('waistHintFemale')}
              </p>
            </div>

            {/* Hips (Female Only) */}
            {gender === 'female' && (
              <div className="input-card">
                <label htmlFor="hips" className="input-label">
                  {t('hipsCircumference')}
                </label>
                <div className="input-with-unit">
                  <input
                    id="hips"
                    type="number"
                    step="0.25"
                    value={hips}
                    onChange={(e) => setHips(e.target.value)}
                    className="number-input"
                    placeholder="38"
                  />
                  <span className="unit-label">{t('inches')}</span>
                </div>
                <p className="input-hint">{t('hipsHint')}</p>
              </div>
            )}

            {/* ACFT Score 540+ Checkbox */}
            <div className="input-card">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={acftScore}
                  onChange={(e) => setAcftScore(e.target.checked)}
                  style={{ marginRight: '0.75rem' }}
                />
                {t('acftExemption')}
              </label>
              <p className="input-hint">{t('acftHint')}</p>
            </div>

            <div
              className="action-buttons"
              style={{ minHeight: '44px', minWidth: '140px', gap: '0.75rem' }}
            >
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
                  {age && heightInches && weight && waist && neck
                    ? t('clickCalculate')
                    : t('enterValues')}
                </span>
              </div>
            )}
            {result !== null && (
              <>
                {result.status === 'exempt' ? (
                  <div className="result-display">
                    <div
                      className="result-item"
                      style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                        border: '2px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            fontSize: '3rem',
                            fontWeight: '800',
                            color: '#22c55e',
                            marginBottom: '0.5rem',
                          }}
                        >
                          ✓ {t('exempt')}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                          {t('exemptMessage')}
                        </p>
                        <div className="result-label">{t('bmi')}</div>
                        <div
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {result.bmi.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="result-display">
                    {/* Body Fat Percentage */}
                    <div className="result-item">
                      <div className="result-label">{t('bodyFatPercentage')}</div>
                      <div
                        className="number-input result-value-box"
                        style={{
                          background:
                            result.status === 'pass'
                              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
                              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                          border:
                            result.status === 'pass'
                              ? '2px solid rgba(34, 197, 94, 0.3)'
                              : '2px solid rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        <span
                          className="result-value"
                          style={{
                            color: result.status === 'pass' ? '#22c55e' : '#ef4444',
                            fontSize: '2rem',
                            fontWeight: '800',
                          }}
                        >
                          {result.bodyFatPercentage.toFixed(1)}
                        </span>
                        <span className="result-unit">%</span>
                        <CopyButton text={`${result.bodyFatPercentage.toFixed(1)}%`} />
                      </div>
                    </div>

                    {/* Max Allowable */}
                    <div className="result-item">
                      <div className="result-label">{t('maxAllowable')}</div>
                      <div className="number-input result-value-box">
                        <span className="result-value">{result.maxAllowable}</span>
                        <span className="result-unit">%</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="result-item">
                      <div className="result-label">{t('status')}</div>
                      <div
                        className="number-input result-value-box"
                        style={{
                          background:
                            result.status === 'pass'
                              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
                              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                          border:
                            result.status === 'pass'
                              ? '2px solid rgba(34, 197, 94, 0.3)'
                              : '2px solid rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        <span
                          style={{
                            color: result.status === 'pass' ? '#22c55e' : '#ef4444',
                            fontWeight: '800',
                            fontSize: '1.5rem',
                          }}
                        >
                          {result.status === 'pass' ? `✓ ${t('pass')}` : `✗ ${t('fail')}`}
                        </span>
                      </div>
                    </div>

                    {/* BMI */}
                    <div className="result-item">
                      <div className="result-label">{t('bmi')}</div>
                      <div className="number-input result-value-box">
                        <span className="result-value">{result.bmi.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Pounds to Lose */}
                    {result.poundsToLose && (
                      <div className="result-item">
                        <div className="result-label">{t('poundsToLose')}</div>
                        <div
                          className="number-input result-value-box"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(251, 146, 60, 0.05) 100%)',
                            border: '2px solid rgba(251, 146, 60, 0.3)',
                          }}
                        >
                          <span
                            className="result-value"
                            style={{ color: '#fb923c', fontWeight: '700' }}
                          >
                            {result.poundsToLose}
                          </span>
                          <span className="result-unit">{t('lbs')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Calculation Details */}
                {result.status !== 'exempt' && (
                  <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
                    <h3 className="example-heading">{t('calculationDetails')}</h3>
                    <div className="example-text" style={{ lineHeight: '1.8' }}>
                      <p>
                        <strong>{t('formula')}</strong>
                      </p>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {gender === 'male'
                          ? `86.010 × log₁₀(${waist} - ${neck}) - 70.041 × log₁₀(${heightInches}) + 36.76`
                          : `163.205 × log₁₀(${waist} + ${hips} - ${neck}) - 97.684 × log₁₀(${heightInches}) - 78.387`}
                      </p>
                      <p>
                        <strong>{t('result')}:</strong> {result.bodyFatPercentage.toFixed(2)}%
                      </p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {t('basedOnAR6009')}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
