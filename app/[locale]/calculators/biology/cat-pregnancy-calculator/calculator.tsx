'use client';

import { useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

const GESTATION_DAYS = 64;
const EARLIEST_DAYS = 58;
const LATEST_DAYS = 70;

function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

function getDayOfWeek(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { weekday: 'long' });
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export function CatPregnancyCalculator() {
  const t = useTranslations('calculators.catPregnancy');
  const locale = useLocale();
  const [matingDate, setMatingDate] = useState<string>('');

  const dueDate = matingDate
    ? addDays(new Date(matingDate), GESTATION_DAYS)
    : null;
  const earliestDate = matingDate
    ? addDays(new Date(matingDate), EARLIEST_DAYS)
    : null;
  const latestDate = matingDate
    ? addDays(new Date(matingDate), LATEST_DAYS)
    : null;
  const daysUntilDue =
    dueDate && dueDate >= new Date(new Date().setHours(0, 0, 0, 0))
      ? daysBetween(new Date(new Date().setHours(0, 0, 0, 0)), dueDate)
      : null;

  const handleReset = useCallback(() => {
    setMatingDate('');
  }, []);

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div
            className="numbers-to-letters-inputs"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div className="input-card">
              <label htmlFor="matingDate" className="input-label">
                {t('matingDate')}
              </label>
              <input
                id="matingDate"
                type="date"
                value={matingDate}
                onChange={(e) => setMatingDate(e.target.value)}
                className="number-input"
                style={{ minHeight: '44px' }}
              />
            </div>

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button
                onClick={handleReset}
                className="btn btn-secondary"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        <div
          className="result-section"
          style={{
            marginTop: 0,
            paddingTop: 0,
            borderTop: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {dueDate && earliestDate && latestDate && (
            <>
              <div className="input-card">
                <label className="input-label">{t('dueDate')}</label>
                <div
                  className="number-input"
                  style={{
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 1.25rem',
                  }}
                >
                  {formatDate(dueDate, locale)}
                  <CopyButton text={formatDate(dueDate, locale)} />
                </div>
              </div>

              <div className="input-card">
                <label className="input-label">{t('dueDayMessage')}</label>
                <div
                  className="number-input"
                  style={{
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                  }}
                >
                  {t('dueDayOn', {
                    day: getDayOfWeek(dueDate, locale),
                  })}
                </div>
              </div>

              {daysUntilDue !== null && (
                <div className="input-card">
                  <label className="input-label">{t('daysUntilBirth')}</label>
                  <div
                    className="number-input"
                    style={{
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem 1.25rem',
                    }}
                  >
                    {t('daysUntilBirthValue', { count: daysUntilDue })}
                  </div>
                </div>
              )}

              <div className="input-card">
                <label className="input-label">{t('earliestDelivery')}</label>
                <div
                  className="number-input"
                  style={{
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                  }}
                >
                  {formatDate(earliestDate, locale)}
                </div>
              </div>

              <div className="input-card">
                <label className="input-label">{t('latestDelivery')}</label>
                <div
                  className="number-input"
                  style={{
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                  }}
                >
                  {formatDate(latestDate, locale)}
                </div>
              </div>
            </>
          )}

          {!matingDate && (
            <div
              className="number-input"
              style={{
                minHeight: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.6,
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>
                {t('enterMatingDate')}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
