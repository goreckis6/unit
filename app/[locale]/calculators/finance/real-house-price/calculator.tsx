'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

interface RealHousePriceResult {
  commissionAmount: number;
  ownerReceives: number;
}

export function RealHousePriceCalculator() {
  const t = useTranslations('calculators.realHousePrice');
  const [housePrice, setHousePrice] = useState<string>('');
  const [commissionPercent, setCommissionPercent] = useState<string>('');
  const [result, setResult] = useState<RealHousePriceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const price = parseFloat(housePrice.replace(/[,\s]/g, ''));
    const rate = parseFloat(commissionPercent);

    if (isNaN(price) || price <= 0) {
      setError(t('errorInvalidPrice'));
      return;
    }

    if (isNaN(rate) || rate < 0 || rate > 100) {
      setError(t('errorInvalidCommission'));
      return;
    }

    const commissionAmount = (price * rate) / 100;
    const ownerReceives = price - commissionAmount;

    setResult({ commissionAmount, ownerReceives });
  };

  const handleReset = () => {
    setHousePrice('');
    setCommissionPercent('');
    setResult(null);
    setError(null);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="housePrice" className="input-label">
                {t('housePrice')}
              </label>
              <div className="input-with-unit">
                <input
                  id="housePrice"
                  type="text"
                  inputMode="decimal"
                  value={housePrice}
                  onChange={(e) => setHousePrice(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="500000"
                />
                <span className="input-unit">{t('currency')}</span>
              </div>
            </div>

            <div className="input-card">
              <label htmlFor="commissionPercent" className="input-label">
                {t('commissionPercent')}
              </label>
              <div className="input-with-unit">
                <input
                  id="commissionPercent"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="5"
                />
                <span className="input-unit">%</span>
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

        {/* Right Column - Result */}
        <div
          ref={resultRef}
          className="result-section"
          style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}
        >
          <div className="input-card">
            <label className="input-label">{t('result')}</label>
            {error && (
              <div
                className="number-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '52px',
                  padding: '0.75rem 1rem',
                  color: 'var(--error-color, #ef4444)',
                }}
              >
                <span>{error}</span>
              </div>
            )}
            {!error && result === null && (
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
                  {housePrice || commissionPercent ? t('clickCalculate') : t('enterValue')}
                </span>
              </div>
            )}
            {!error && result !== null && (
              <div className="result-display">
                <div className="result-item">
                  <div className="result-label">{t('commissionAmount')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value">{formatCurrency(result.commissionAmount)}</span>
                    <span className="result-unit">{t('currency')}</span>
                    <CopyButton text={formatCurrency(result.commissionAmount)} />
                  </div>
                </div>
                <div className="result-item">
                  <div className="result-label">{t('ownerReceives')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value">{formatCurrency(result.ownerReceives)}</span>
                    <span className="result-unit">{t('currency')}</span>
                    <CopyButton text={formatCurrency(result.ownerReceives)} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
