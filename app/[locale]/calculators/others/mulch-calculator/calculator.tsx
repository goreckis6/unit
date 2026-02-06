'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

export function MulchCalculator() {
  const t = useTranslations('calculators.mulchCalculator');
  const [area, setArea] = useState<string>('200');
  const [depth, setDepth] = useState<string>('2');
  const [price, setPrice] = useState<string>('');
  const [result, setResult] = useState<{ volume: number; cost: number | null } | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const a = parseFloat(area);
    const d = parseFloat(depth);
    const p = price.trim() === '' ? null : parseFloat(price);

    if (Number.isNaN(a) || a <= 0 || Number.isNaN(d) || d <= 0) {
      setResult(null);
      return;
    }
    if (p !== null && (Number.isNaN(p) || p < 0)) {
      setResult(null);
      return;
    }

    const volume = a * (d / 100);
    const cost = p !== null ? volume * p : null;
    setResult({ volume, cost });
  };

  const handleReset = () => {
    setArea('200');
    setDepth('2');
    setPrice('');
    setResult(null);
  };

  const areaNum = parseFloat(area);
  const depthNum = parseFloat(depth);
  const valid =
    !Number.isNaN(areaNum) &&
    areaNum > 0 &&
    !Number.isNaN(depthNum) &&
    depthNum > 0 &&
    (price.trim() === '' || (!Number.isNaN(parseFloat(price)) && parseFloat(price) >= 0));

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="area" className="input-label">
                {t('areaToCover')}
              </label>
              <div className="input-with-unit">
                <input
                  id="area"
                  type="number"
                  min="0"
                  step="0.01"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="200"
                />
                <span className="input-unit">{t('squareMeters')}</span>
              </div>
            </div>
            <div className="input-card">
              <label htmlFor="depth" className="input-label">
                {t('mulchDepth')}
              </label>
              <div className="input-with-unit">
                <input
                  id="depth"
                  type="number"
                  min="0"
                  step="0.1"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="2"
                />
                <span className="input-unit">{t('cm')}</span>
              </div>
            </div>
            <div className="input-card">
              <label htmlFor="price" className="input-label">
                {t('priceOptional')}
              </label>
              <div className="input-with-unit">
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder={t('pricePlaceholder')}
                />
                <span className="input-unit">{t('perCubicMeter')}</span>
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
                        area: areaNum,
                        depth: depthNum,
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
