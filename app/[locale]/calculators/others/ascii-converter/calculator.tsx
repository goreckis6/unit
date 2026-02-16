'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

type InputType = 'ascii' | 'hex' | 'binary' | 'decimal';
type SeparatorType = 'space' | 'comma' | 'custom';

function parseInputToBytes(input: string, inputType: InputType, separator: string): number[] | null {
  const raw = input.trim();
  if (!raw) return null;

  try {
    if (inputType === 'ascii') {
      const encoder = new TextEncoder();
      return Array.from(encoder.encode(raw));
    }

    const parts = separator ? raw.split(separator).map((s) => s.trim()).filter(Boolean) : [raw];

    if (inputType === 'hex') {
      const bytes: number[] = [];
      for (const p of parts) {
        const cleaned = p.replace(/^0x/i, '');
        if (cleaned.length % 2) return null;
        for (let i = 0; i < cleaned.length; i += 2) {
          const byte = parseInt(cleaned.slice(i, i + 2), 16);
          if (isNaN(byte) || byte < 0 || byte > 255) return null;
          bytes.push(byte);
        }
      }
      return bytes;
    }

    if (inputType === 'binary') {
      const bytes: number[] = [];
      for (const p of parts) {
        const cleaned = p.replace(/\s/g, '');
        if (cleaned.length !== 8 || !/^[01]+$/.test(cleaned)) return null;
        bytes.push(parseInt(cleaned, 2));
      }
      return bytes;
    }

    if (inputType === 'decimal') {
      const bytes: number[] = [];
      for (const p of parts) {
        const n = parseInt(p, 10);
        if (isNaN(n) || n < 0 || n > 255) return null;
        bytes.push(n);
      }
      return bytes;
    }

    return null;
  } catch {
    return null;
  }
}

function bytesToAscii(bytes: number[]): string {
  try {
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return bytes.map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : '.')).join('');
  }
}

export function AsciiConverterCalculator() {
  const t = useTranslations('calculators.asciiConverter');
  const [inputType, setInputType] = useState<InputType>('ascii');
  const [input, setInput] = useState<string>('');
  const [separatorType, setSeparatorType] = useState<SeparatorType>('space');
  const [customSeparator, setCustomSeparator] = useState<string>('');
  const [asciiOut, setAsciiOut] = useState<string>('');
  const [binaryOut, setBinaryOut] = useState<string>('');
  const [hexOut, setHexOut] = useState<string>('');
  const [decimalOut, setDecimalOut] = useState<string>('');

  const separator =
    separatorType === 'space' ? ' ' : separatorType === 'comma' ? ', ' : customSeparator;

  useEffect(() => {
    if (!input.trim()) {
      setAsciiOut('');
      setBinaryOut('');
      setHexOut('');
      setDecimalOut('');
      return;
    }

    const bytes = parseInputToBytes(input, inputType, separator);
    if (!bytes || bytes.length === 0) {
      setAsciiOut('');
      setBinaryOut('');
      setHexOut('');
      setDecimalOut('');
      return;
    }

    setAsciiOut(bytesToAscii(bytes));
    setBinaryOut(bytes.map((b) => b.toString(2).padStart(8, '0')).join(separator));
    setHexOut(bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(separator));
    setDecimalOut(bytes.map((b) => String(b)).join(separator));
  }, [input, inputType, separator]);

  const handleReset = () => {
    setInput('');
    setInputType('ascii');
    setSeparatorType('space');
    setCustomSeparator('');
    setAsciiOut('');
    setBinaryOut('');
    setHexOut('');
    setDecimalOut('');
  };

  const outputStyle = {
    wordWrap: 'break-word' as const,
    wordBreak: 'break-word' as const,
    overflowWrap: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const,
    minHeight: '120px',
    fontFamily: 'monospace',
    fontSize: '0.9em',
    padding: '1rem',
    overflowY: 'auto' as const,
  };
  const placeholderStyle = {
    ...outputStyle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="inputType" className="input-label">
                {t('inputTypeLabel')}
              </label>
              <select
                id="inputType"
                value={inputType}
                onChange={(e) => setInputType(e.target.value as InputType)}
                className="number-input select-dropdown"
                style={{ cursor: 'pointer' }}
              >
                <option value="ascii">{t('inputTypeAscii')}</option>
                <option value="hex">{t('inputTypeHex')}</option>
                <option value="binary">{t('inputTypeBinary')}</option>
                <option value="decimal">{t('inputTypeDecimal')}</option>
              </select>
            </div>

            <div className="input-card">
              <label htmlFor="input" className="input-label">
                {t('inputLabel')}
              </label>
              <textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="number-input"
                placeholder={t('inputPlaceholder')}
                rows={8}
                style={{
                  resize: 'vertical',
                  minHeight: '200px',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  fontFamily: inputType === 'ascii' ? 'inherit' : 'monospace',
                }}
              />
            </div>

            <div className="input-card numbers-to-letters-compact">
              <label htmlFor="separator" className="input-label">
                {t('separator')}
              </label>
              <select
                id="separator"
                value={separatorType}
                onChange={(e) => setSeparatorType(e.target.value as SeparatorType)}
                className="number-input select-dropdown"
                style={{ cursor: 'pointer' }}
              >
                <option value="space">{t('separatorSpace')}</option>
                <option value="comma">{t('separatorComma')}</option>
                <option value="custom">{t('separatorCustom')}</option>
              </select>
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
                  onChange={(e) => setCustomSeparator(e.target.value.slice(0, 10))}
                  className="number-input"
                  placeholder={t('customSeparatorPlaceholder')}
                  maxLength={10}
                  style={{ minHeight: '44px' }}
                />
              </div>
            )}

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Outputs */}
        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label className="input-label">{t('outputAscii')}</label>
              {asciiOut !== '' ? (
                <div className="number-input" style={{ ...outputStyle, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ flex: 1, minWidth: 0, wordWrap: 'break-word', wordBreak: 'break-word' }}>{asciiOut}</span>
                    <CopyButton text={asciiOut} />
                  </div>
                </div>
              ) : (
                <div className="number-input" style={placeholderStyle}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('outputPlaceholder')}</span>
                </div>
              )}
            </div>
            <div className="input-card">
              <label className="input-label">{t('outputBinary')}</label>
              {binaryOut ? (
                <div className="number-input" style={{ ...outputStyle, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ flex: 1, minWidth: 0, wordWrap: 'break-word', wordBreak: 'break-word' }}>{binaryOut}</span>
                    <CopyButton text={binaryOut} />
                  </div>
                </div>
              ) : (
                <div className="number-input" style={placeholderStyle}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('outputPlaceholder')}</span>
                </div>
              )}
            </div>
            <div className="input-card">
              <label className="input-label">{t('outputHex')}</label>
              {hexOut ? (
                <div className="number-input" style={{ ...outputStyle, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ flex: 1, minWidth: 0, wordWrap: 'break-word', wordBreak: 'break-word' }}>{hexOut}</span>
                    <CopyButton text={hexOut} />
                  </div>
                </div>
              ) : (
                <div className="number-input" style={placeholderStyle}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('outputPlaceholder')}</span>
                </div>
              )}
            </div>
            <div className="input-card">
              <label className="input-label">{t('outputDecimal')}</label>
              {decimalOut ? (
                <div className="number-input" style={{ ...outputStyle, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ flex: 1, minWidth: 0, wordWrap: 'break-word', wordBreak: 'break-word' }}>{decimalOut}</span>
                    <CopyButton text={decimalOut} />
                  </div>
                </div>
              ) : (
                <div className="number-input" style={placeholderStyle}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('outputPlaceholder')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
