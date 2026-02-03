'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

const AVG_DAYS_PER_MONTH = 365.25 / 12;
const DAYS_PER_YEAR = 365.25;

function parseMMDDYYYY(value: string): Date | null {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1 || year > 9999) return null;
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

function formatTodayMMDDYYYY(): string {
  const d = new Date();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const y = d.getFullYear();
  return `${m.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${y}`;
}

interface AgeResult {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
  weeks: number;
  months: number;
  years: number;
}

function computeAge(birth: Date, current: Date): AgeResult | null {
  if (birth.getTime() > current.getTime()) return null;
  const ms = current.getTime() - birth.getTime();
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / AVG_DAYS_PER_MONTH);
  const years = Math.floor(days / DAYS_PER_YEAR);
  return { seconds, minutes, hours, days, weeks, months, years };
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function AgeInDaysCalculator() {
  const t = useTranslations('calculators.ageInDays');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>(() => formatTodayMMDDYYYY());
  const [result, setResult] = useState<AgeResult | null>(null);
  const resultRef = useScrollToResult(result);

  const birthParsed = useMemo(() => parseMMDDYYYY(dateOfBirth), [dateOfBirth]);
  const currentParsed = useMemo(() => parseMMDDYYYY(currentDate), [currentDate]);

  const handleCalculate = () => {
    if (birthParsed && currentParsed && birthParsed.getTime() <= currentParsed.getTime()) {
      setResult(computeAge(birthParsed, currentParsed));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setDateOfBirth('');
    setCurrentDate(formatTodayMMDDYYYY());
    setResult(null);
  };

  const canCalculate = birthParsed && currentParsed && birthParsed.getTime() <= currentParsed.getTime();
  const showPlaceholder = result === null;

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="dob" className="input-label">
                {t('dateOfBirth')}
              </label>
              <div className="input-with-unit">
                <input
                  id="dob"
                  type="text"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder={t('placeholderDate')}
                />
              </div>
            </div>
            <div className="input-card">
              <label htmlFor="current" className="input-label">
                {t('currentDate')}
              </label>
              <div className="input-with-unit">
                <input
                  id="current"
                  type="text"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder={t('placeholderDate')}
                />
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
            <label className="input-label">{t('yourAge')}</label>
            {showPlaceholder && (
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
                  {dateOfBirth ? t('clickCalculate') : t('enterValue')}
                </span>
              </div>
            )}
            {result !== null && (
              <div className="result-display" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="result-item">
                  <div className="result-label">{t('seconds')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value">{formatNumber(result.seconds)}</span>
                    <span className="result-unit">{t('sec')}</span>
                    <CopyButton text={`${formatNumber(result.seconds)} ${t('sec')}`} />
                  </div>
                </div>
                <div className="result-item">
                  <div className="result-label">{t('minutes')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value">{formatNumber(result.minutes)}</span>
                    <span className="result-unit">{t('min')}</span>
                    <CopyButton text={`${formatNumber(result.minutes)} ${t('min')}`} />
                  </div>
                </div>
                <div className="result-item">
                  <div className="result-label">{t('hours')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value">{formatNumber(result.hours)}</span>
                    <span className="result-unit">{t('hrs')}</span>
                    <CopyButton text={`${formatNumber(result.hours)} ${t('hrs')}`} />
                  </div>
                </div>
                <div className="result-item">
                  <div className="result-label">{t('days')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value">{formatNumber(result.days)}</span>
                    <span className="result-unit">{t('daysUnit')}</span>
                    <CopyButton text={`${formatNumber(result.days)} ${t('daysUnit')}`} />
                  </div>
                </div>
                <div className="result-item">
                  <div className="result-label">{t('weeks')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value">{formatNumber(result.weeks)}</span>
                    <span className="result-unit">{t('wks')}</span>
                    <CopyButton text={`${formatNumber(result.weeks)} ${t('wks')}`} />
                  </div>
                </div>
                <div className="result-item">
                  <div className="result-label">{t('months')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value">{formatNumber(result.months)}</span>
                    <span className="result-unit">{t('mos')}</span>
                    <CopyButton text={`${formatNumber(result.months)} ${t('mos')}`} />
                  </div>
                </div>
                <div className="result-item">
                  <div className="result-label">{t('years')}</div>
                  <div className="number-input result-value-box">
                    <span className="result-value">{formatNumber(result.years)}</span>
                    <span className="result-unit">{t('yrs')}</span>
                    <CopyButton text={`${formatNumber(result.years)} ${t('yrs')}`} />
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
