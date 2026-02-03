'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

type LeetLevel = 'basic' | 'intermediate' | 'advanced';

function textToLeetSpeak(text: string, level: LeetLevel): string {
  if (!text) return '';

  const basicMap: Record<string, string> = {
    'a': '4', 'A': '4',
    'e': '3', 'E': '3',
    'i': '1', 'I': '1',
    'o': '0', 'O': '0',
    's': '5', 'S': '5',
    't': '7', 'T': '7',
  };

  const intermediateMap: Record<string, string> = {
    ...basicMap,
    'l': '1', 'L': '1',
    'g': '9', 'G': '9',
    'b': '8', 'B': '8',
    'z': '2', 'Z': '2',
  };

  const advancedMap: Record<string, string> = {
    ...intermediateMap,
    'a': '@', 'A': '@',
    's': '$', 'S': '$',
    'h': '#', 'H': '#',
    'c': '(', 'C': '(',
    'k': '|<', 'K': '|<',
    'x': '><', 'X': '><',
  };

  const map = level === 'basic' ? basicMap : level === 'intermediate' ? intermediateMap : advancedMap;

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += map[char] || char;
  }

  return result;
}

export function LeetSpeakTranslatorCalculator() {
  const t = useTranslations('calculators.leetSpeak');
  const [text, setText] = useState<string>('');
  const [level, setLevel] = useState<LeetLevel>('intermediate');
  const [result, setResult] = useState<string>('');

  const handleConvert = () => {
    if (text) {
      const leetText = textToLeetSpeak(text, level);
      setResult(leetText);
    } else {
      setResult('');
    }
  };

  const handleReset = () => {
    setText('');
    setLevel('intermediate');
    setResult('');
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="text" className="input-label">
                {t('textLabel')}
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="number-input"
                placeholder={t('textPlaceholder')}
                rows={8}
                style={{ 
                  resize: 'vertical', 
                  minHeight: '200px',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
              />
            </div>

            <div className="input-card numbers-to-letters-compact">
              <label htmlFor="level" className="input-label">
                {t('levelLabel')}
              </label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value as LeetLevel)}
                className="number-input select-dropdown"
                style={{ cursor: 'pointer' }}
              >
                <option value="basic">{t('levelBasic')}</option>
                <option value="intermediate">{t('levelIntermediate')}</option>
                <option value="advanced">{t('levelAdvanced')}</option>
              </select>
              <p className="input-hint" style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                {t('levelHint')}
              </p>
            </div>

            <div className="button-row" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                onClick={handleConvert}
                className="calculate-button"
                style={{ flex: 1 }}
              >
                {t('convert')}
              </button>
              <button
                onClick={handleReset}
                className="reset-button"
                style={{ flex: 1 }}
              >
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="result-section">
          <div className="result-card">
            <div className="result-header">
              <h3 className="result-title">{t('resultLabel')}</h3>
              {result && <CopyButton textToCopy={result} />}
            </div>
            
            {result ? (
              <div className="result-content" style={{ marginTop: '1rem' }}>
                <div className="result-value" style={{ 
                  padding: '1.5rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  fontSize: '1.125rem',
                  lineHeight: '1.75',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace'
                }}>
                  {result}
                </div>
              </div>
            ) : (
              <div className="result-placeholder">
                {t('resultPlaceholder')}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
