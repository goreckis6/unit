'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

// Alphabet mappings
const alphabets: Record<string, string[]> = {
  latin: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
  arabic: ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'],
  hebrew: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'],
  greek: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'],
  cyrillic: ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я']
};

type DecodingMethod = 'a1' | 'a0';

function numbersToLetters(
  input: string,
  alphabet: string,
  method: DecodingMethod
): string {
  if (!input.trim()) return '';

  // Parse numbers (support spaces, commas, or both)
  const numbers = input
    .split(/[\s,]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => {
      // Replace comma with dot for decimal separator
      const normalized = s.replace(',', '.');
      const num = parseFloat(normalized);
      return isNaN(num) ? null : num;
    })
    .filter((n): n is number => n !== null);

  if (numbers.length === 0) return '';

  const alphabetArray = alphabets[alphabet] || alphabets.latin;
  const result: string[] = [];

  for (const num of numbers) {
    let index: number;
    
    if (method === 'a1') {
      // A=1, B=2, C=3, ...
      index = Math.round(num) - 1;
    } else {
      // A=0, B=1, C=2, ...
      index = Math.round(num);
    }

    // Handle negative numbers and out-of-range
    if (index < 0 || index >= alphabetArray.length) {
      result.push('?');
    } else {
      result.push(alphabetArray[index]);
    }
  }

  return result.join(' ');
}

export function NumbersToLettersConverter() {
  const t = useTranslations('calculators.numbersToLetters');
  const [input, setInput] = useState<string>('');
  const [alphabet, setAlphabet] = useState<string>('latin');
  const [method, setMethod] = useState<DecodingMethod>('a1');
  const [result, setResult] = useState<string>('');

  // Auto-convert when input, alphabet, or method changes
  useEffect(() => {
    if (input.trim()) {
      const converted = numbersToLetters(input, alphabet, method);
      setResult(converted);
    } else {
      setResult('');
    }
  }, [input, alphabet, method]);

  const handleReset = () => {
    setInput('');
    setResult('');
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Only allow numbers, spaces, commas, and dots
    if (/^[\d\s,.\-]*$/.test(value) || value === '') {
      setInput(value);
    }
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Input */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="numbers" className="input-label">
                {t('numbersInput')}
              </label>
              <textarea
                id="numbers"
                value={input}
                onChange={handleInputChange}
                className="number-input"
                placeholder={t('numbersPlaceholder')}
                rows={6}
                style={{ 
                  resize: 'vertical', 
                  minHeight: '150px',
                  fontFamily: 'monospace'
                }}
              />
              <p style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.875rem', 
                color: 'var(--text-secondary)',
                fontStyle: 'italic'
              }}>
                {t('decimalSeparatorNote')}
              </p>
            </div>

            <div className="input-card numbers-to-letters-compact">
              <label htmlFor="method" className="input-label">
                {t('decodingMethod')}
              </label>
              <select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value as DecodingMethod)}
                className="number-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="a1">{t('methodA1')}</option>
                <option value="a0">{t('methodA0')}</option>
              </select>
            </div>

            <div className="input-card numbers-to-letters-compact">
              <label htmlFor="alphabet" className="input-label">
                {t('chooseAlphabet')}
              </label>
              <select
                id="alphabet"
                value={alphabet}
                onChange={(e) => setAlphabet(e.target.value)}
                className="number-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="latin">{t('alphabetLatin')}</option>
                <option value="arabic">{t('alphabetArabic')}</option>
                <option value="hebrew">{t('alphabetHebrew')}</option>
                <option value="greek">{t('alphabetGreek')}</option>
                <option value="cyrillic">{t('alphabetCyrillic')}</option>
              </select>
            </div>

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Output */}
        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card">
            <label className="input-label">
              {t('results')}
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
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: '1.5em',
                fontWeight: '500',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                letterSpacing: '0.05em',
                lineHeight: '1.6'
              }}>
                <div style={{ flex: 1, color: 'var(--text-primary)' }}>{result}</div>
                <button 
                  onClick={handleCopy} 
                  className="btn btn-primary" 
                  style={{ minHeight: '44px', minWidth: '44px', alignSelf: 'flex-start' }}
                >
                  {t('copy')}
                </button>
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
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: '1.1em',
                padding: '1.25rem',
                opacity: 0.5
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {t('resultsPlaceholder')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
