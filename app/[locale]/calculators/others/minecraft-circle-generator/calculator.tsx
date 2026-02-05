'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

/**
 * Estimate blocks needed for a Minecraft circle (ring).
 * Uses perimeter-based estimate: outer circumference for 1-block thickness,
 * otherwise average of inner and outer circumference for rings.
 */
function countCircleBlocks(diameter: number, thickness: number): number {
  if (diameter < 1 || thickness < 1) return 0;
  const outerR = diameter / 2;
  const innerR = Math.max(0, outerR - thickness);
  if (thickness <= 1) {
    return Math.max(4, Math.round(Math.PI * diameter));
  }
  const outerPerimeter = Math.PI * diameter;
  const innerDiameter = Math.max(0, diameter - 2 * thickness);
  const innerPerimeter = innerDiameter > 0 ? Math.PI * innerDiameter : 0;
  return Math.max(4, Math.round((outerPerimeter + innerPerimeter) / 2));
}

export function MinecraftCircleGeneratorCalculator() {
  const t = useTranslations('calculators.minecraftCircleGenerator');
  const [diameter, setDiameter] = useState<string>('22');
  const [thickness, setThickness] = useState<string>('1');
  const [blockCount, setBlockCount] = useState<number | null>(null);
  const resultRef = useScrollToResult(blockCount);

  const handleCalculate = () => {
    const d = parseInt(diameter, 10);
    const th = parseInt(thickness, 10);
    if (Number.isNaN(d) || d < 1 || d > 500 || Number.isNaN(th) || th < 1 || th > 100) {
      setBlockCount(null);
      return;
    }
    if (th > d / 2) {
      setBlockCount(null);
      return;
    }
    setBlockCount(countCircleBlocks(d, th));
  };

  const handleReset = () => {
    setDiameter('22');
    setThickness('1');
    setBlockCount(null);
  };

  const dNum = parseInt(diameter, 10);
  const tNum = parseInt(thickness, 10);
  const valid = !Number.isNaN(dNum) && dNum >= 1 && dNum <= 500 && !Number.isNaN(tNum) && tNum >= 1 && tNum <= 100 && tNum <= dNum / 2;

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="diameter" className="input-label">
                {t('diameter')}
              </label>
              <div className="input-with-unit">
                <input
                  id="diameter"
                  type="number"
                  min={1}
                  max={500}
                  value={diameter}
                  onChange={(e) => setDiameter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="22"
                />
                <span className="input-unit">{t('blocks')}</span>
              </div>
            </div>
            <div className="input-card">
              <label htmlFor="thickness" className="input-label">
                {t('thickness')}
              </label>
              <div className="input-with-unit">
                <input
                  id="thickness"
                  type="number"
                  min={1}
                  max={100}
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="1"
                />
                <span className="input-unit">{t('blocks')}</span>
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
            {blockCount === null && (
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
            {blockCount !== null && (
              <>
                <p className="result-summary">{t('blocksNeeded', { count: blockCount })}</p>
                <div className="result-display">
                  <div className="result-item">
                    <div className="result-label">{t('blocksLabel')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{blockCount}</span>
                      <span className="result-unit">{t('blocks')}</span>
                      <CopyButton text={String(blockCount)} />
                    </div>
                  </div>
                </div>
                <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
                  <h3 className="example-heading">{t('calculationHeading')}</h3>
                  <div className="example-text" style={{ lineHeight: '1.8' }}>
                    <p>
                      {t('calculationSummary', {
                        diameter: dNum,
                        thickness: tNum,
                        count: blockCount,
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
