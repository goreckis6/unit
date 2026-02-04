'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

type RaisinSize = 'small' | 'standard' | 'jumbo';

interface DogRaisinResult {
  toxicDoseGrams: number;
  toxicCountApprox: number;
}

const TOXIC_DOSE_PER_KG = 2.8; // g raisins / kg body weight (reported lowest AKI case)

const RAISIN_WEIGHTS: Record<RaisinSize, number> = {
  small: 0.5,
  standard: 1,
  jumbo: 1.5,
};

export function DogRaisinToxicityCalculator() {
  const t = useTranslations('calculators.dogRaisinToxicity');
  const [weightKg, setWeightKg] = useState<string>('');
  const [size, setSize] = useState<RaisinSize>('standard');
  const [result, setResult] = useState<DogRaisinResult | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const parsedWeight = parseFloat(weightKg.replace(',', '.'));

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setResult(null);
      return;
    }

    const toxicDoseGrams = parsedWeight * TOXIC_DOSE_PER_KG;
    const raisinWeight = RAISIN_WEIGHTS[size];
    const toxicCountApprox = toxicDoseGrams / raisinWeight;

    setResult({
      toxicDoseGrams,
      toxicCountApprox,
    });
  };

  const handleReset = () => {
    setWeightKg('');
    setSize('standard');
    setResult(null);
  };

  const hasValue = weightKg.trim().length > 0;

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="weightKg" className="input-label">
                {t('weightLabel')}
              </label>
              <div className="input-with-unit">
                <input
                  id="weightKg"
                  type="number"
                  min="0"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder={t('weightPlaceholder')}
                />
                <span className="input-unit">kg</span>
              </div>
              <p className="input-help-text">{t('weightHelp')}</p>
            </div>

            <div className="input-card">
              <label htmlFor="raisinSize" className="input-label">
                {t('sizeLabel')}
              </label>
              <select
                id="raisinSize"
                value={size}
                onChange={(e) => setSize(e.target.value as RaisinSize)}
                className="number-input select-dropdown"
                style={{ minHeight: '44px', cursor: 'pointer' }}
              >
                <option value="small">{t('sizeSmall')}</option>
                <option value="standard">{t('sizeStandard')}</option>
                <option value="jumbo">{t('sizeJumbo')}</option>
              </select>
              <p className="input-help-text">{t('sizeHelp')}</p>
            </div>

            <div className="action-buttons" style={{ minHeight: '44px', minWidth: '140px', gap: '0.75rem' }}>
              <button onClick={handleCalculate} className="btn btn-primary">
                {t('calculate')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary">
                {t('reset')}
              </button>
            </div>

            <div className="seo-content-card" style={{ marginTop: '0.5rem' }}>
              <p className="example-text" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                {t('warningText')}
              </p>
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
                  {hasValue ? t('clickCalculate') : t('enterValue')}
                </span>
              </div>
            )}

            {result !== null && (
              <>
                <div className="result-display">
                  <div className="result-item">
                    <div className="result-label">{t('toxicDoseLabel')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{result.toxicDoseGrams.toFixed(1)}</span>
                      <span className="result-unit">g</span>
                      <CopyButton text={`${result.toxicDoseGrams.toFixed(1)} g`} />
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">{t('toxicCountLabel')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">
                        {Math.round(result.toxicCountApprox).toLocaleString()}
                      </span>
                      <span className="result-unit">{t('toxicCountUnit')}</span>
                      <CopyButton
                        text={`${Math.round(result.toxicCountApprox)} ${t('toxicCountUnitShort')}`}
                      />
                    </div>
                    <p className="input-help-text" style={{ marginTop: '0.35rem' }}>
                      {t('toxicCountApproxNote')}
                    </p>
                  </div>
                </div>

                <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
                  <h3 className="example-heading">{t('calculationHeading')}</h3>
                  <div className="example-text" style={{ lineHeight: '1.8' }}>
                    <p>{t('calculationExplanation')}</p>
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

