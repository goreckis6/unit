'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

interface DaysToWeeksResult {
  weeks: number;
  years: number;
  months: number;
  hours: number;
  minutes: number;
  seconds: number;
  hmsHours: number;
  hmsMinutes: number;
  hmsSeconds: number;
}

export function DaysToWeeksCalculator() {
  const t = useTranslations('calculators.daysToWeeks');
  const [days, setDays] = useState<string>('');
  const [result, setResult] = useState<DaysToWeeksResult | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const parsed = parseFloat(days);

    if (Number.isNaN(parsed)) {
      setResult(null);
      return;
    }

    const weeks = parsed / 7;
    const years = parsed / 365;
    const months = parsed / 30;
    const hours = parsed * 24;
    const minutes = hours * 60;
    const seconds = minutes * 60;

    const totalSeconds = Math.max(0, Math.round(parsed * 24 * 60 * 60));
    const hmsHours = Math.floor(totalSeconds / 3600);
    const remainingAfterHours = totalSeconds % 3600;
    const hmsMinutes = Math.floor(remainingAfterHours / 60);
    const hmsSeconds = remainingAfterHours % 60;

    setResult({
      weeks,
      years,
      months,
      hours,
      minutes,
      seconds,
      hmsHours,
      hmsMinutes,
      hmsSeconds,
    });
  };

  const handleReset = () => {
    setDays('');
    setResult(null);
  };

  const hasValue = days.trim().length > 0;

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="days" className="input-label">
                {t('daysLabel')}
              </label>
              <div className="input-with-unit">
                <input
                  id="days"
                  type="number"
                  min="0"
                  step="0.0001"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder={t('daysPlaceholder')}
                />
              </div>
              <p className="input-help-text">{t('daysHelp')}</p>
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
                    <div className="result-label">{t('weeksLabel')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{result.weeks.toFixed(4)}</span>
                      <span className="result-unit">{t('weeksUnit')}</span>
                      <CopyButton text={`${result.weeks.toFixed(4)} ${t('weeksUnitShort')}`} />
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">{t('yearsLabel')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{result.years.toFixed(4)}</span>
                      <span className="result-unit">{t('yearsUnit')}</span>
                      <CopyButton text={`${result.years.toFixed(4)} ${t('yearsUnitShort')}`} />
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">{t('monthsLabel')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{result.months.toFixed(4)}</span>
                      <span className="result-unit">{t('monthsUnit')}</span>
                      <CopyButton text={`${result.months.toFixed(4)} ${t('monthsUnitShort')}`} />
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">{t('hoursLabel')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{result.hours.toFixed(2)}</span>
                      <span className="result-unit">{t('hoursUnit')}</span>
                      <CopyButton text={`${result.hours.toFixed(2)} ${t('hoursUnitShort')}`} />
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">{t('minutesLabel')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{result.minutes.toFixed(0)}</span>
                      <span className="result-unit">{t('minutesUnit')}</span>
                      <CopyButton text={`${result.minutes.toFixed(0)} ${t('minutesUnitShort')}`} />
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">{t('secondsLabel')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{result.seconds.toFixed(0)}</span>
                      <span className="result-unit">{t('secondsUnit')}</span>
                      <CopyButton text={`${result.seconds.toFixed(0)} ${t('secondsUnitShort')}`} />
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">{t('hmsLabel')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">
                        {result.hmsHours} {t('hoursUnitShort')} {result.hmsMinutes} {t('minutesUnitShort')}{' '}
                        {result.hmsSeconds} {t('secondsUnitShort')}
                      </span>
                      <CopyButton
                        text={`${result.hmsHours} ${t('hoursUnitShort')} ${result.hmsMinutes} ${t(
                          'minutesUnitShort',
                        )} ${result.hmsSeconds} ${t('secondsUnitShort')}`}
                      />
                    </div>
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

