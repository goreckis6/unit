'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

function generateCirclePoints(diameter: number, thickness: number): Set<string> {
  const points = new Set<string>();
  if (diameter < 1 || thickness < 1) return points;

  const r = diameter / 2;
  const offset = diameter / 2 - 0.5;
  const layers = Math.max(1, Math.floor(thickness));

  for (let layer = 0; layer < layers; layer++) {
    const radius = r - layer;
    if (radius <= 0) break;
    const maxY = Math.max(0, Math.ceil(radius) - 1);

    for (let y = 0; y <= maxY; y++) {
      const yy = y + 0.5;
      const x = Math.round(Math.sqrt(Math.max(0, radius * radius - yy * yy)) - 0.5);
      const octants: Array<[number, number]> = [
        [x, y],
        [x, -y],
        [-x, y],
        [-x, -y],
        [y, x],
        [y, -x],
        [-y, x],
        [-y, -x],
      ];

      for (const [px, py] of octants) {
        const gx = Math.round(px + offset);
        const gy = Math.round(py + offset);
        if (gx >= 0 && gx < diameter && gy >= 0 && gy < diameter) {
          points.add(`${gx},${gy}`);
        }
      }
    }
  }

  return points;
}

function countCircleBlocks(diameter: number, thickness: number): number {
  return generateCirclePoints(diameter, thickness).size;
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
  const valid =
    !Number.isNaN(dNum) &&
    dNum >= 1 &&
    dNum <= 500 &&
    !Number.isNaN(tNum) &&
    tNum >= 1 &&
    tNum <= 100 &&
    tNum <= dNum / 2;

  const previewDiameter = valid ? Math.min(dNum, 41) : 0;
  const previewThickness = valid ? Math.max(1, Math.min(tNum, Math.ceil(previewDiameter / 2))) : 1;
  const previewPoints = previewDiameter > 0 ? generateCirclePoints(previewDiameter, previewThickness) : new Set<string>();
  const centerIndex = Math.floor(previewDiameter / 2);
  const cellSize = previewDiameter > 30 ? 8 : previewDiameter > 24 ? 10 : 12;

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
                {previewDiameter > 0 && (
                  <div
                    className="minecraft-preview"
                    style={{
                      ['--cell-size' as string]: `${cellSize}px`,
                      gridTemplateColumns: `repeat(${previewDiameter}, var(--cell-size))`,
                    }}
                  >
                    {Array.from({ length: previewDiameter * previewDiameter }, (_, index) => {
                      const x = index % previewDiameter;
                      const y = Math.floor(index / previewDiameter);
                      const key = `${x},${y}`;
                      const isCircle = previewPoints.has(key);
                      const isCenter = x === centerIndex && y === centerIndex;
                      const isAxis = !isCircle && (x === centerIndex || y === centerIndex);
                      let className = 'minecraft-preview-cell';
                      if (isCircle) className += ' minecraft-preview-cell--filled';
                      if (isAxis) className += ' minecraft-preview-cell--axis';
                      if (isCenter) className += ' minecraft-preview-cell--center';
                      return <div key={key} className={className} />;
                    })}
                  </div>
                )}
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
