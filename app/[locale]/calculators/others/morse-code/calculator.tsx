'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

// Morse code mapping
const MORSE_CODE_MAP: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/'
};

// Reverse mapping for decoding
const MORSE_TO_TEXT_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_CODE_MAP).map(([key, value]) => [value, key])
);

function textToMorse(text: string): string {
  if (!text) return '';
  
  return text
    .toUpperCase()
    .split('')
    .map(char => MORSE_CODE_MAP[char] || char)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function morseToText(morse: string): string {
  if (!morse) return '';
  
  // Replace multiple spaces or slashes with a single space marker
  const normalized = morse
    .trim()
    .replace(/\s*\/\s*/g, ' / ')
    .replace(/\s+/g, ' ');
  
  return normalized
    .split(' ')
    .map(code => {
      if (code === '/') return ' ';
      return MORSE_TO_TEXT_MAP[code] || code;
    })
    .join('')
    .trim();
}

export function MorseCodeCalculator() {
  const t = useTranslations('calculators.morseCode');
  const [input, setInput] = useState<string>('');
  const [mode, setMode] = useState<'textToMorse' | 'morseToText'>('textToMorse');
  const [result, setResult] = useState<string>('');

  const handleCalculate = () => {
    if (!input.trim()) {
      setResult('');
      return;
    }

    if (mode === 'textToMorse') {
      setResult(textToMorse(input));
    } else {
      setResult(morseToText(input));
    }
  };

  const handleReset = () => {
    setInput('');
    setResult('');
  };

  const handleModeChange = (newMode: 'textToMorse' | 'morseToText') => {
    setMode(newMode);
    setInput('');
    setResult('');
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="mode" className="input-label">
                {t('mode')}
              </label>
              <select
                id="mode"
                value={mode}
                onChange={(e) => handleModeChange(e.target.value as 'textToMorse' | 'morseToText')}
                className="number-input select-dropdown"
                style={{ cursor: 'pointer' }}
              >
                <option value="textToMorse">{t('textToMorse')}</option>
                <option value="morseToText">{t('morseToText')}</option>
              </select>
            </div>

            <div className="input-card">
              <label htmlFor="input" className="input-label">
                {mode === 'textToMorse' ? t('textInput') : t('morseInput')}
              </label>
              <textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleCalculate();
                  }
                }}
                className="number-input"
                placeholder={mode === 'textToMorse' ? t('textPlaceholder') : t('morsePlaceholder')}
                rows={8}
                style={{ 
                  resize: 'vertical', 
                  minHeight: '200px',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  fontFamily: mode === 'morseToText' ? 'monospace' : 'inherit'
                }}
              />
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
        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card">
            <label className="input-label">
              {mode === 'textToMorse' ? t('morseOutput') : t('textOutput')}
            </label>
            {result ? (
              <div className="number-input" style={{ 
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap', 
                minHeight: '200px',
                resize: 'vertical',
                overflowY: 'auto',
                fontFamily: mode === 'textToMorse' ? 'monospace' : 'inherit',
                fontSize: mode === 'textToMorse' ? '1.1em' : '1em',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, minWidth: 0 }}>{result}</span>
                  <CopyButton text={result} />
                </div>
              </div>
            ) : (
              <div className="number-input" style={{ 
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap', 
                minHeight: '200px',
                resize: 'vertical',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '1.25rem',
                opacity: 0.5
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {input ? t('clickCalculate') : t('enterText')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
