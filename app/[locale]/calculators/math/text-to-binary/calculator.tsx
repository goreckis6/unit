'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

type EncodingType = 'utf-8' | 'utf-16' | 'utf-16le' | 'utf-16be' | 'windows-1252';
type SeparatorType = 'space' | 'comma' | 'custom';

function textToBinary(text: string, encoding: EncodingType, separator: string): string {
  if (!text) return '';

  try {
    let bytes: number[] = [];

    // Convert text to bytes based on encoding
    if (encoding === 'utf-8') {
      const encoder = new TextEncoder();
      bytes = Array.from(encoder.encode(text));
    } else if (encoding === 'utf-16' || encoding === 'utf-16le') {
      // UTF-16 LE (Little Endian) - default for JavaScript
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        // UTF-16 uses 2 bytes per character (or 4 for surrogate pairs)
        if (code < 0x10000) {
          bytes.push(code & 0xFF); // Low byte
          bytes.push((code >> 8) & 0xFF); // High byte
        } else {
          // Surrogate pair handling
          const surrogate1 = code - 0x10000;
          const high = 0xD800 + (surrogate1 >> 10);
          const low = 0xDC00 + (surrogate1 & 0x3FF);
          bytes.push(high & 0xFF);
          bytes.push((high >> 8) & 0xFF);
          bytes.push(low & 0xFF);
          bytes.push((low >> 8) & 0xFF);
        }
      }
    } else if (encoding === 'utf-16be') {
      // UTF-16 BE (Big Endian)
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code < 0x10000) {
          bytes.push((code >> 8) & 0xFF); // High byte
          bytes.push(code & 0xFF); // Low byte
        } else {
          const surrogate1 = code - 0x10000;
          const high = 0xD800 + (surrogate1 >> 10);
          const low = 0xDC00 + (surrogate1 & 0x3FF);
          bytes.push((high >> 8) & 0xFF);
          bytes.push(high & 0xFF);
          bytes.push((low >> 8) & 0xFF);
          bytes.push(low & 0xFF);
        }
      }
    } else if (encoding === 'windows-1252') {
      // Windows-1252 encoding
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        // Map Unicode to Windows-1252
        if (code < 0x80 || (code >= 0xA0 && code <= 0xFF)) {
          bytes.push(code);
        } else {
          // Try to map common characters
          const map: Record<number, number> = {
            0x20AC: 0x80, // €
            0x201A: 0x82, // ‚
            0x0192: 0x83, // ƒ
            0x201E: 0x84, // „
            0x2026: 0x85, // …
            0x2020: 0x86, // †
            0x2021: 0x87, // ‡
            0x02C6: 0x88, // ˆ
            0x2030: 0x89, // ‰
            0x0160: 0x8A, // Š
            0x2039: 0x8B, // ‹
            0x0152: 0x8C, // Œ
            0x017D: 0x8E, // Ž
            0x2018: 0x91, // '
            0x2019: 0x92, // '
            0x201C: 0x93, // "
            0x201D: 0x94, // "
            0x2022: 0x95, // •
            0x2013: 0x96, // –
            0x2014: 0x97, // —
            0x02DC: 0x98, // ˜
            0x2122: 0x99, // ™
            0x0161: 0x9A, // š
            0x203A: 0x9B, // ›
            0x0153: 0x9C, // œ
            0x017E: 0x9E, // ž
            0x0178: 0x9F, // Ÿ
          };
          bytes.push(map[code] || 0x3F); // Use ? for unmapped characters
        }
      }
    }

    // Convert bytes to binary strings
    const binaryStrings = bytes.map(byte => byte.toString(2).padStart(8, '0'));
    
    // Join with separator
    return binaryStrings.join(separator);
  } catch (error) {
    return '';
  }
}

export function TextToBinaryCalculator() {
  const t = useTranslations('calculators.textToBinary');
  const [text, setText] = useState<string>('');
  const [encoding, setEncoding] = useState<EncodingType>('utf-8');
  const [separatorType, setSeparatorType] = useState<SeparatorType>('space');
  const [customSeparator, setCustomSeparator] = useState<string>('');
  const [result, setResult] = useState<string>('');

  // Determine separator string
  const separator = separatorType === 'space' 
    ? ' ' 
    : separatorType === 'comma' 
    ? ', ' 
    : customSeparator;

  // Auto-convert when text, encoding, or separator changes
  useEffect(() => {
    if (text) {
      const binary = textToBinary(text, encoding, separator);
      setResult(binary);
    } else {
      setResult('');
    }
  }, [text, encoding, separator]);

  const handleReset = () => {
    setText('');
    setEncoding('utf-8');
    setSeparatorType('space');
    setCustomSeparator('');
    setResult('');
  };

  return (
    <>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2rem',
        alignItems: 'start'
      }}
      className="split-view-container"
      >
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="text" className="input-label">
                {t('textInput')}
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="number-input"
                placeholder={t('textPlaceholder')}
                rows={8}
                style={{ resize: 'vertical', minHeight: '200px' }}
              />
            </div>

            <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-card">
                <label htmlFor="encoding" className="input-label">
                  {t('encoding')}
                </label>
                <select
                  id="encoding"
                  value={encoding}
                  onChange={(e) => setEncoding(e.target.value as EncodingType)}
                  className="number-input"
                >
                  <option value="utf-8">{t('encodingUtf8')}</option>
                  <option value="utf-16">{t('encodingUtf16')}</option>
                  <option value="utf-16le">{t('encodingUtf16le')}</option>
                  <option value="utf-16be">{t('encodingUtf16be')}</option>
                  <option value="windows-1252">{t('encodingWindows1252')}</option>
                </select>
              </div>

              <div className="input-card">
                <label htmlFor="separator" className="input-label">
                  {t('separator')}
                </label>
                <select
                  id="separator"
                  value={separatorType}
                  onChange={(e) => setSeparatorType(e.target.value as SeparatorType)}
                  className="number-input"
                >
                  <option value="space">{t('separatorSpace')}</option>
                  <option value="comma">{t('separatorComma')}</option>
                  <option value="custom">{t('separatorCustom')}</option>
                </select>
              </div>
            </div>

            {separatorType === 'custom' && (
              <div className="input-card">
                <label htmlFor="customSeparator" className="input-label">
                  {t('customSeparatorLabel')}
                </label>
                <input
                  id="customSeparator"
                  type="text"
                  value={customSeparator}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 10);
                    setCustomSeparator(value);
                  }}
                  className="number-input"
                  placeholder={t('customSeparatorPlaceholder')}
                  maxLength={10}
                />
              </div>
            )}

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button onClick={handleReset} className="btn btn-secondary">
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Output */}
        <div className="result-section" style={{ marginTop: 0 }}>
          <div className="result-header">
            <div className="result-badge">
              {t('result')}
            </div>
          </div>
          {result ? (
            <div className="result-display">
              <div className="result-item">
                <div className="result-label">{t('binaryOutput')}</div>
                <div className="result-value-box" style={{ 
                  wordBreak: 'break-all', 
                  whiteSpace: 'pre-wrap', 
                  minHeight: '300px',
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}>
                  <span className="result-value" style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
                    {result}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="result-display" style={{ opacity: 0.5 }}>
              <div className="result-item">
                <div className="result-label">{t('binaryOutput')}</div>
                <div className="result-value-box" style={{ 
                  wordBreak: 'break-all', 
                  whiteSpace: 'pre-wrap', 
                  minHeight: '300px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                    {t('textPlaceholder')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
