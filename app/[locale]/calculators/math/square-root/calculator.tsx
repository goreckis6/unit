'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

const DECIMAL_PLACES = 5;

function formatResult(value: number, locale: string): string {
  return value.toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: DECIMAL_PLACES,
  });
}

export function SquareRootCalculator() {
  const t = useTranslations('calculators.squareRoot');
  const locale = useLocale();
  const [input, setInput] = useState<string>('');
  const [positiveRoot, setPositiveRoot] = useState<string | null>(null);
  const [negativeRoot, setNegativeRoot] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setPositiveRoot(null);
      setNegativeRoot(null);
      setSummary(null);
      setError(null);
      return;
    }
    const num = parseFloat(trimmed.replace(/,/g, '.'));
    if (Number.isNaN(num)) {
      setPositiveRoot(null);
      setNegativeRoot(null);
      setSummary(null);
      setError(t('errorInvalid'));
      return;
    }
    if (num < 0) {
      setPositiveRoot(null);
      setNegativeRoot(null);
      setSummary(null);
      setError(t('errorNegative'));
      return;
    }
    setError(null);
    const root = Math.sqrt(num);
    setPositiveRoot(formatResult(root, locale));
    setNegativeRoot(formatResult(-root, locale));
    setSummary(`√${trimmed} ≈ ${formatResult(root, locale)}`);
  }, [input, locale, t]);

  const handleReset = () => {
    setInput('');
    setPositiveRoot(null);
    setNegativeRoot(null);
    setSummary(null);
    setError(null);
  };

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="number" className="input-label">
                {t('enterNumber')}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }} aria-hidden>√</span>
                <input
                  id="number"
                  type="text"
                  inputMode="decimal"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="number-input"
                  placeholder={t('placeholder')}
                  style={{ flex: '1', minWidth: '120px', minHeight: '44px' }}
                />
              </div>
              {error && (
                <p className="seo-paragraph" style={{ color: 'var(--error)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  {error}
                </p>
              )}
            </div>

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card" style={{ marginBottom: '1rem' }}>
            <label className="input-label">{t('answer1')}</label>
            <div className="number-input" style={{ minHeight: '52px', display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '1.1rem' }}>
              {positiveRoot ?? '—'}
            </div>
          </div>

          <div className="input-card" style={{ marginBottom: '1rem' }}>
            <label className="input-label">{t('answer2')}</label>
            <div className="number-input" style={{ minHeight: '52px', display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '1.1rem' }}>
              {negativeRoot ?? '—'}
            </div>
          </div>

          <div className="input-card">
            <label className="input-label">{t('summary')}</label>
            <div className="number-input" style={{ minHeight: '52px', display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '1rem' }}>
              {summary ?? '—'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
