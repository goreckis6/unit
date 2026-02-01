'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

type AngleUnit = 'deg' | 'rad' | 'mrad' | 'pi';

function angleToRadians(value: number, unit: AngleUnit): number {
  switch (unit) {
    case 'deg':
      return (value * Math.PI) / 180;
    case 'rad':
      return value;
    case 'mrad':
      return value / 1000;
    case 'pi':
      return value * Math.PI;
    default:
      return value;
  }
}

export function CosineCalculator() {
  const t = useTranslations('calculators.cosine');
  const locale = useLocale();
  const [angle, setAngle] = useState<string>('11');
  const [unit, setUnit] = useState<AngleUnit>('deg');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const parsed = parseFloat(angle);
    if (Number.isNaN(parsed)) {
      setResult(null);
      return;
    }
    const rad = angleToRadians(parsed, unit);
    setResult(Math.cos(rad));
  };

  const handleReset = () => {
    setAngle('11');
    setUnit('deg');
    setResult(null);
  };

  const formatResult = (value: number) => {
    return value.toLocaleString(locale, {
      minimumFractionDigits: 8,
      maximumFractionDigits: 8,
    });
  };

  const graphPath = useMemo(() => {
    const width = 400;
    const height = 200;
    const padding = { left: 45, right: 25, top: 20, bottom: 35 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const xMin = 0;
    const xMax = 2 * Math.PI;
    const yMin = -1;
    const yMax = 1;

    const toX = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
    const toY = (y: number) => padding.top + (1 - (y - yMin) / (yMax - yMin)) * plotHeight;

    const steps = 100;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = Math.cos(x);
      const px = toX(x);
      const py = toY(y);
      d += (i === 0 ? 'M' : 'L') + px.toFixed(2) + ',' + py.toFixed(2);
    }
    return { d, width, height, padding, toX, toY, xMin, xMax, yMin, yMax };
  }, []);

  const graphPoint = useMemo(() => {
    if (result === null) return null;
    const parsed = parseFloat(angle);
    if (Number.isNaN(parsed)) return null;
    const rad = angleToRadians(parsed, unit);
    const radNorm = ((rad % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (radNorm < graphPath.xMin || radNorm > graphPath.xMax) return null;
    const y = Math.cos(radNorm);
    return { x: radNorm, y, px: graphPath.toX(radNorm), py: graphPath.toY(y) };
  }, [result, angle, unit, graphPath]);

  return (
    <div>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="angle" className="input-label">
              {t('angleAlpha')}
            </label>
            <div className="input-with-unit">
              <input
                id="angle"
                type="number"
                step="any"
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="11"
              />
              <select
                aria-label={t('unit')}
                value={unit}
                onChange={(e) => setUnit(e.target.value as AngleUnit)}
                className="number-input select-dropdown unit-select"
                style={{ minWidth: '8rem', cursor: 'pointer' }}
              >
                <option value="deg">deg</option>
                <option value="rad">rad</option>
                <option value="mrad">{t('unitMrad')}</option>
                <option value="pi">{t('unitPiRad')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={handleCalculate} className="btn btn-primary">
          {t('calculate')}
        </button>
        <button onClick={handleReset} className="btn btn-secondary">
          {t('reset')}
        </button>
      </div>

      {result !== null && (
        <div ref={resultRef} className="result-section">
          <div className="result-header">
            <div className="result-badge">{t('result')}</div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">{t('cosineOfAlpha')}</div>
              <div className="number-input result-value-box">
                <span className="result-value">{formatResult(result)}</span>
                <CopyButton text={String(formatResult(result))} />
              </div>
            </div>
          </div>

          <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
            <h3 className="example-heading">{t('graphHeading')}</h3>
            <div style={{ overflow: 'auto', marginTop: '0.5rem' }}>
              <svg
                viewBox={'0 0 ' + graphPath.width + ' ' + graphPath.height}
                style={{ width: '100%', maxWidth: '400px', height: 'auto', display: 'block' }}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="cosineGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="var(--primary, #2563eb)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--primary, #2563eb)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line
                  x1={graphPath.padding.left}
                  y1={graphPath.toY(0)}
                  x2={graphPath.width - graphPath.padding.right}
                  y2={graphPath.toY(0)}
                  stroke="var(--text-secondary, #64748b)"
                  strokeWidth="1"
                  strokeDasharray="4,2"
                />
                <line
                  x1={graphPath.toX(0)}
                  y1={graphPath.padding.top}
                  x2={graphPath.toX(0)}
                  y2={graphPath.height - graphPath.padding.bottom}
                  stroke="var(--text-secondary, #64748b)"
                  strokeWidth="1"
                  strokeDasharray="4,2"
                />
                <line
                  x1={graphPath.padding.left}
                  y1={graphPath.toY(1)}
                  x2={graphPath.width - graphPath.padding.right}
                  y2={graphPath.toY(1)}
                  stroke="rgba(148, 163, 184, 0.6)"
                  strokeWidth="1"
                />
                <line
                  x1={graphPath.padding.left}
                  y1={graphPath.toY(-1)}
                  x2={graphPath.width - graphPath.padding.right}
                  y2={graphPath.toY(-1)}
                  stroke="rgba(148, 163, 184, 0.6)"
                  strokeWidth="1"
                />
                <path
                  d={graphPath.d + ' L' + graphPath.toX(graphPath.xMax) + ',' + graphPath.toY(0) + ' L' + graphPath.toX(0) + ',' + graphPath.toY(0) + ' Z'}
                  fill="url(#cosineGradient)"
                />
                <path
                  d={graphPath.d}
                  fill="none"
                  stroke="var(--primary, #2563eb)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {graphPoint && (
                  <>
                    <line
                      x1={graphPoint.px}
                      y1={graphPoint.py}
                      x2={graphPoint.px}
                      y2={graphPath.toY(0)}
                      stroke="rgba(148, 163, 184, 0.85)"
                      strokeWidth="1"
                    />
                    <line
                      x1={graphPoint.px}
                      y1={graphPoint.py}
                      x2={graphPath.width - graphPath.padding.right}
                      y2={graphPoint.py}
                      stroke="rgba(148, 163, 184, 0.85)"
                      strokeWidth="1"
                    />
                    <circle
                      cx={graphPoint.px}
                      cy={graphPoint.py}
                      r="4"
                      fill="var(--primary, #2563eb)"
                      stroke="rgba(255,255,255,0.9)"
                      strokeWidth="1.5"
                    />
                  </>
                )}
                <text
                  x={graphPath.width - graphPath.padding.right - 15}
                  y={graphPath.toY(0) - 6}
                  fontSize="11"
                  fill="var(--text-secondary, #64748b)"
                  textAnchor="end"
                >
                  0
                </text>
                <text
                  x={graphPath.toX(Math.PI / 2) - 4}
                  y={graphPath.height - 8}
                  fontSize="11"
                  fill="var(--text-secondary, #64748b)"
                  textAnchor="middle"
                >
                  pi/2
                </text>
                <text
                  x={graphPath.toX(Math.PI) - 4}
                  y={graphPath.height - 8}
                  fontSize="11"
                  fill="var(--text-secondary, #64748b)"
                  textAnchor="middle"
                >
                  pi
                </text>
                <text
                  x={graphPath.toX((3 * Math.PI) / 2) - 8}
                  y={graphPath.height - 8}
                  fontSize="11"
                  fill="var(--text-secondary, #64748b)"
                  textAnchor="middle"
                >
                  3pi/2
                </text>
                <text
                  x={graphPath.toX(2 * Math.PI) - 8}
                  y={graphPath.height - 8}
                  fontSize="11"
                  fill="var(--text-secondary, #64748b)"
                  textAnchor="middle"
                >
                  2pi
                </text>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
