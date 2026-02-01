'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

type RatioKey = 'a' | 'b' | 'c' | 'd';

interface RatioResult {
  missingKey: RatioKey;
  value: number;
  ratio: Record<RatioKey, number>;
}

function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number): string {
  const rounded = Math.round(value * 1_000_000) / 1_000_000;
  return rounded.toFixed(6).replace(/\.?0+$/, '');
}

export function RatioCalculator() {
  const t = useTranslations('calculators.ratio');

  const [a, setA] = useState('1');
  const [b, setB] = useState('2');
  const [c, setC] = useState('');
  const [d, setD] = useState('4');
  const [showErrors, setShowErrors] = useState(false);

  const [scaleLeft, setScaleLeft] = useState('250');
  const [scaleRight, setScaleRight] = useState('280');
  const [scaleFactor, setScaleFactor] = useState('2.5');

  const ratioResult = useMemo(() => {
    const values: Record<RatioKey, number | null> = {
      a: parseNumber(a),
      b: parseNumber(b),
      c: parseNumber(c),
      d: parseNumber(d),
    };

    const missing = (Object.keys(values) as RatioKey[]).filter((key) => values[key] === null);
    if (missing.length !== 1) {
      return { error: t('errorNeedThree') };
    }

    const missingKey = missing[0];
    const aVal = values.a;
    const bVal = values.b;
    const cVal = values.c;
    const dVal = values.d;

    const invalid = [aVal, bVal, cVal, dVal].some((value) => value !== null && !Number.isFinite(value));
    if (invalid) {
      return { error: t('errorInvalidNumber') };
    }

    if ((missingKey === 'a' && dVal === 0) || (missingKey === 'b' && cVal === 0) || (missingKey === 'c' && bVal === 0) || (missingKey === 'd' && aVal === 0)) {
      return { error: t('errorDivisionByZero') };
    }

    let computed = 0;
    if (missingKey === 'a') {
      computed = (bVal as number) * (cVal as number) / (dVal as number);
    } else if (missingKey === 'b') {
      computed = (aVal as number) * (dVal as number) / (cVal as number);
    } else if (missingKey === 'c') {
      computed = (aVal as number) * (dVal as number) / (bVal as number);
    } else {
      computed = (bVal as number) * (cVal as number) / (aVal as number);
    }

    return {
      missingKey,
      value: computed,
      ratio: {
        a: missingKey === 'a' ? computed : (aVal as number),
        b: missingKey === 'b' ? computed : (bVal as number),
        c: missingKey === 'c' ? computed : (cVal as number),
        d: missingKey === 'd' ? computed : (dVal as number),
      },
    } satisfies RatioResult;
  }, [a, b, c, d, t]);

  const scalePreview = useMemo(() => {
    const left = parseNumber(scaleLeft);
    const right = parseNumber(scaleRight);
    const factor = parseNumber(scaleFactor);
    if (left === null || right === null || factor === null) return null;
    return {
      left: left * factor,
      right: right * factor,
      factor,
    };
  }, [scaleLeft, scaleRight, scaleFactor]);

  const scalePreviewBars = useMemo(() => {
    if (!scalePreview) return null;
    const leftAbs = Math.abs(scalePreview.left);
    const rightAbs = Math.abs(scalePreview.right);
    const maxAbs = Math.max(leftAbs, rightAbs, 1);
    const widthFor = (value: number) => Math.max(28, Math.round((Math.abs(value) / maxAbs) * 180));
    return {
      leftWidth: widthFor(scalePreview.left),
      rightWidth: widthFor(scalePreview.right),
    };
  }, [scalePreview]);

  const handleClear = () => {
    setA('');
    setB('');
    setC('');
    setD('');
    setShowErrors(false);
  };

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>{t('ratioSectionHeading')}</div>
              <p className="seo-paragraph" style={{ marginTop: 0 }}>
                {t('ratioSectionDescription')}
              </p>
              <div className="options-grid" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <div className="input-card numbers-to-letters-compact">
                  <label htmlFor="ratio-a" className="input-label">{t('aLabel')}</label>
                  <input
                    id="ratio-a"
                    type="text"
                    inputMode="decimal"
                    value={a}
                    onChange={(event) => setA(event.target.value)}
                    className="number-input"
                    placeholder={t('aPlaceholder')}
                    style={{ minHeight: '44px' }}
                  />
                </div>
                <div className="input-card numbers-to-letters-compact">
                  <label htmlFor="ratio-b" className="input-label">{t('bLabel')}</label>
                  <input
                    id="ratio-b"
                    type="text"
                    inputMode="decimal"
                    value={b}
                    onChange={(event) => setB(event.target.value)}
                    className="number-input"
                    placeholder={t('bPlaceholder')}
                    style={{ minHeight: '44px' }}
                  />
                </div>
                <div className="input-card numbers-to-letters-compact">
                  <label htmlFor="ratio-c" className="input-label">{t('cLabel')}</label>
                  <input
                    id="ratio-c"
                    type="text"
                    inputMode="decimal"
                    value={c}
                    onChange={(event) => setC(event.target.value)}
                    className="number-input"
                    placeholder={t('cPlaceholder')}
                    style={{ minHeight: '44px' }}
                  />
                </div>
                <div className="input-card numbers-to-letters-compact">
                  <label htmlFor="ratio-d" className="input-label">{t('dLabel')}</label>
                  <input
                    id="ratio-d"
                    type="text"
                    inputMode="decimal"
                    value={d}
                    onChange={(event) => setD(event.target.value)}
                    className="number-input"
                    placeholder={t('dPlaceholder')}
                    style={{ minHeight: '44px' }}
                  />
                </div>
              </div>

              {showErrors && 'error' in ratioResult && (
                <p className="seo-paragraph" style={{ color: 'var(--error)', marginTop: '0.75rem' }}>
                  {ratioResult.error}
                </p>
              )}

              <div className="action-buttons" style={{ marginTop: '0.75rem' }}>
                <button
                  onClick={() => setShowErrors(true)}
                  className="btn btn-primary"
                  style={{ minHeight: '44px' }}
                >
                  {t('calculate')}
                </button>
                <button
                  onClick={handleClear}
                  className="btn btn-secondary"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  {t('clear')}
                </button>
              </div>
            </div>

            <div className="input-card">
              <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>{t('scaleSectionHeading')}</div>
              <p className="seo-paragraph" style={{ marginTop: 0 }}>
                {t('scaleSectionDescription')}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.75rem' }}>
                <div className="input-card numbers-to-letters-compact" style={{ flex: 1, minWidth: '120px' }}>
                  <label htmlFor="scale-left" className="input-label">{t('scaleLeftLabel')}</label>
                  <input
                    id="scale-left"
                    type="text"
                    inputMode="decimal"
                    value={scaleLeft}
                    onChange={(event) => setScaleLeft(event.target.value)}
                    className="number-input"
                    placeholder={t('scaleLeftPlaceholder')}
                    style={{ minHeight: '44px' }}
                  />
                </div>
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>:</span>
                <div className="input-card numbers-to-letters-compact" style={{ flex: 1, minWidth: '120px' }}>
                  <label htmlFor="scale-right" className="input-label">{t('scaleRightLabel')}</label>
                  <input
                    id="scale-right"
                    type="text"
                    inputMode="decimal"
                    value={scaleRight}
                    onChange={(event) => setScaleRight(event.target.value)}
                    className="number-input"
                    placeholder={t('scaleRightPlaceholder')}
                    style={{ minHeight: '44px' }}
                  />
                </div>
              </div>
              <div className="input-card numbers-to-letters-compact" style={{ marginTop: '0.75rem' }}>
                <label htmlFor="scale-factor" className="input-label">{t('scaleFactorLabel')}</label>
                <input
                  id="scale-factor"
                  type="text"
                  inputMode="decimal"
                  value={scaleFactor}
                  onChange={(event) => setScaleFactor(event.target.value)}
                  className="number-input"
                  placeholder={t('scaleFactorPlaceholder')}
                  style={{ minHeight: '44px' }}
                />
                <p className="seo-paragraph" style={{ marginTop: '0.5rem' }}>
                  {t('scaleHint')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card">
            <label className="input-label">{t('resultHeading')}</label>
            <div className="number-input" style={{ minHeight: '160px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {'error' in ratioResult ? (
                <div style={{ color: 'var(--text-secondary)' }}>
                  {showErrors ? ratioResult.error : t('previewHint')}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    {t('missingValueLabel', {
                      key: ratioResult.missingKey.toUpperCase(),
                      value: formatNumber(ratioResult.value),
                    })}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {t('ratioEquationLabel', {
                      a: formatNumber(ratioResult.ratio.a),
                      b: formatNumber(ratioResult.ratio.b),
                      c: formatNumber(ratioResult.ratio.c),
                      d: formatNumber(ratioResult.ratio.d),
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="input-card" style={{ marginTop: '1.25rem' }}>
            <label className="input-label">{t('scalePreviewHeading')}</label>
            <div className="number-input" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {scalePreview ? (
                <>
                  <div style={{ fontWeight: 700 }}>
                    {t('scalePreviewLabel', {
                      left: formatNumber(parseNumber(scaleLeft) || 0),
                      right: formatNumber(parseNumber(scaleRight) || 0),
                      factor: formatNumber(scalePreview.factor),
                    })}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {t('scalePreviewResult', {
                      left: formatNumber(scalePreview.left),
                      right: formatNumber(scalePreview.right),
                    })}
                  </div>
                  {scalePreviewBars && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.75rem',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        background: 'rgba(148, 163, 184, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            height: '30px',
                            width: `${scalePreviewBars.leftWidth}px`,
                            minWidth: '28px',
                            background: '#4f46e5',
                            borderRadius: '6px',
                          }}
                        />
                        <span style={{ fontWeight: 700 }}>{formatNumber(scalePreview.left)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            height: '30px',
                            width: `${scalePreviewBars.rightWidth}px`,
                            minWidth: '28px',
                            background: '#16a34a',
                            borderRadius: '6px',
                          }}
                        />
                        <span style={{ fontWeight: 700 }}>{formatNumber(scalePreview.right)}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: 'var(--text-secondary)' }}>{t('scalePreviewPlaceholder')}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
