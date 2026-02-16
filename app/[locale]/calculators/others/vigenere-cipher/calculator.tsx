'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

function vigenereCipher(text: string, key: string, mode: 'encode' | 'decode'): string {
  if (!text || !key) return '';
  
  const normalizedKey = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (normalizedKey.length === 0) return text;
  
  let result = '';
  let keyIndex = 0;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (/[a-z]/i.test(char)) {
      const isUpperCase = char === char.toUpperCase();
      const charCode = char.toUpperCase().charCodeAt(0) - 65;
      const keyChar = normalizedKey[keyIndex % normalizedKey.length];
      const keyShift = keyChar.charCodeAt(0) - 65;
      
      let newCharCode;
      if (mode === 'encode') {
        newCharCode = (charCode + keyShift) % 26;
      } else {
        newCharCode = (charCode - keyShift + 26) % 26;
      }
      
      const newChar = String.fromCharCode(newCharCode + 65);
      result += isUpperCase ? newChar : newChar.toLowerCase();
      keyIndex++;
    } else {
      result += char;
    }
  }
  
  return result;
}

export function VigenereCipherCalculator() {
  const t = useTranslations('calculators.vigenereCipher');
  const [inputText, setInputText] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [result, setResult] = useState<string>('');
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    if (!inputText || !key) {
      setResult('');
      return;
    }
    
    const output = vigenereCipher(inputText, key, mode);
    setResult(output);
  };

  const handleReset = () => {
    setInputText('');
    setKey('');
    setMode('encode');
    setResult('');
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="inputText" className="input-label">
                {t('inputLabel')}
              </label>
              <textarea
                id="inputText"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="number-input"
                placeholder={t('inputPlaceholder')}
                rows={4}
                style={{ resize: 'vertical', fontFamily: 'monospace' }}
              />
            </div>

            <div className="input-card">
              <label htmlFor="key" className="input-label">
                {t('keyLabel')}
              </label>
              <input
                id="key"
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder={t('keyPlaceholder')}
              />
            </div>

            <div className="input-card">
              <label htmlFor="mode" className="input-label">
                {t('modeLabel')}
              </label>
              <select
                id="mode"
                value={mode}
                onChange={(e) => setMode(e.target.value as 'encode' | 'decode')}
                className="number-input select-dropdown"
                style={{ cursor: 'pointer' }}
              >
                <option value="encode">{t('encode')}</option>
                <option value="decode">{t('decode')}</option>
              </select>
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
            <div className="result-header">
              <label className="input-label">{t('resultLabel')}</label>
              {result && <CopyButton text={result} />}
            </div>
            
            {!result && (
              <div
                className="number-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '120px',
                  padding: '1rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {inputText && key ? t('clickCalculate') : t('enterTextAndKey')}
                </span>
              </div>
            )}
            
            {result && (
              <textarea
                value={result}
                readOnly
                className="number-input"
                rows={6}
                style={{ 
                  resize: 'vertical', 
                  fontFamily: 'monospace',
                  backgroundColor: 'var(--input-bg)',
                  cursor: 'text'
                }}
              />
            )}
          </div>

          {result && (
            <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
              <h3 className="example-heading">{t('howItWorks')}</h3>
              <div className="example-text" style={{ lineHeight: '1.8' }}>
                <p>
                  <strong>{t('mode')}:</strong> {mode === 'encode' ? t('encode') : t('decode')}
                </p>
                <p>
                  <strong>{t('keyLabel')}:</strong> {key}
                </p>
                <p>
                  <strong>{t('inputLabel')}:</strong> {inputText.substring(0, 50)}{inputText.length > 50 ? '...' : ''}
                </p>
                <p>
                  <strong>{t('resultLabel')}:</strong> {result.substring(0, 50)}{result.length > 50 ? '...' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
