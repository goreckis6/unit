'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

// KE = (1/2) * m * v^2  (mass in kg, velocity in m/s, result in joules)
function calculateKE(massKg: number, velocityMs: number): number {
  return 0.5 * massKg * velocityMs * velocityMs;
}

export function KineticEnergyCalculator() {
  const t = useTranslations('calculators.kineticEnergy');
  const [mass, setMass] = useState<string>('');
  const [velocity, setVelocity] = useState<string>('');
  const [result, setResult] = useState<{ ke: number; mass: number; velocity: number } | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = () => {
    if (!mass.trim() || !velocity.trim()) {
      setError('');
      setResult(null);
      return;
    }

    const m = parseFloat(mass.trim().replace(',', '.'));
    const v = parseFloat(velocity.trim().replace(',', '.'));

    if (isNaN(m) || isNaN(v)) {
      setError(t('errorInvalid'));
      setResult(null);
      return;
    }
    if (m < 0) {
      setError(t('errorMassPositive'));
      setResult(null);
      return;
    }

    const ke = calculateKE(m, v);
    setError('');
    setResult({ ke, mass: m, velocity: v });
  };

  const handleReset = () => {
    setMass('');
    setVelocity('');
    setResult(null);
    setError('');
  };

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="mass" className="input-label">
                {t('massLabel')}
              </label>
              <input
                id="mass"
                type="text"
                inputMode="decimal"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                className="number-input"
                placeholder={t('massPlaceholder')}
                style={{ minHeight: '44px' }}
              />
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {t('massHint')}
              </div>
            </div>

            <div className="input-card">
              <label htmlFor="velocity" className="input-label">
                {t('velocityLabel')}
              </label>
              <input
                id="velocity"
                type="text"
                inputMode="decimal"
                value={velocity}
                onChange={(e) => setVelocity(e.target.value)}
                className="number-input"
                placeholder={t('velocityPlaceholder')}
                style={{ minHeight: '44px' }}
              />
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {t('velocityHint')}
              </div>
            </div>

            {error && (
              <div
                style={{
                  color: 'var(--error)',
                  fontSize: '0.9rem',
                  padding: '0.75rem',
                  background: 'rgba(255, 0, 0, 0.05)',
                  borderRadius: '8px',
                }}
              >
                {error}
              </div>
            )}

            <div className="action-buttons" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleCalculate} className="btn btn-primary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('calculate')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card">
            <label className="input-label">{t('results')}</label>
            {result ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  background: 'var(--card-background)',
                  borderRadius: '8px',
                  minHeight: '200px',
                }}
              >
                <div className="result-item">
                  <div className="result-label" style={{ marginBottom: '0.5rem' }}>{t('massLabel')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value" style={{ fontFamily: 'monospace' }}>
                      {result.mass} kg
                    </span>
                    <CopyButton text={`${result.mass} kg`} />
                  </div>
                </div>
                <div className="result-item">
                  <div className="result-label" style={{ marginBottom: '0.5rem' }}>{t('velocityLabel')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value" style={{ fontFamily: 'monospace' }}>
                      {result.velocity} m/s
                    </span>
                    <CopyButton text={`${result.velocity} m/s`} />
                  </div>
                </div>
                <div className="result-item">
                  <div className="result-label" style={{ marginBottom: '0.5rem' }}>{t('keResult')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value" style={{ fontSize: '1.75rem', fontWeight: '600' }}>
                      {result.ke.toExponential(4)} J
                    </span>
                    <CopyButton text={`${result.ke.toExponential(4)} J`} />
                  </div>
                </div>
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{t('formula')}</div>
                  <div style={{ fontFamily: 'monospace' }}>KE = ½ × m × v² = ½ × {result.mass} × {result.velocity}² = {result.ke.toExponential(4)} J</div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px',
                  padding: '1.25rem',
                  opacity: 0.5,
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{t('enterValues')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
