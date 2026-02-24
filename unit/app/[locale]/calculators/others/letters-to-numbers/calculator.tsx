'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

// Alphabet mappings
const alphabets: Record<string, string[]> = {
  latin: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
  arabic: ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'],
  hebrew: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'],
  greek: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'],
  cyrillic: ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я']
};

// T9 phone keypad mapping (Latin only)
const t9Keypad: Record<string, string> = {
  'a': '2', 'b': '2', 'c': '2',
  'd': '3', 'e': '3', 'f': '3',
  'g': '4', 'h': '4', 'i': '4',
  'j': '5', 'k': '5', 'l': '5',
  'm': '6', 'n': '6', 'o': '6',
  'p': '7', 'q': '7', 'r': '7', 's': '7',
  't': '8', 'u': '8', 'v': '8',
  'w': '9', 'x': '9', 'y': '9', 'z': '9',
  'A': '2', 'B': '2', 'C': '2',
  'D': '3', 'E': '3', 'F': '3',
  'G': '4', 'H': '4', 'I': '4',
  'J': '5', 'K': '5', 'L': '5',
  'M': '6', 'N': '6', 'O': '6',
  'P': '7', 'Q': '7', 'R': '7', 'S': '7',
  'T': '8', 'U': '8', 'V': '8',
  'W': '9', 'X': '9', 'Y': '9', 'Z': '9'
};

type EncodingMethod = 'a0' | 'a1' | 'reversed' | 't9' | 'ascii' | 'hex' | 'binary';

function lettersToNumbers(
  input: string,
  alphabet: string,
  method: EncodingMethod
): string {
  if (!input.trim()) return '';

  const alphabetArray = alphabets[alphabet] || alphabets.latin || [];
  const result: string[] = [];

  for (const char of input) {
    if (method === 'ascii' || method === 'hex' || method === 'binary') {
      // ASCII/Unicode methods work with any character
      const code = char.charCodeAt(0);
      if (method === 'ascii') {
        result.push(code.toString());
      } else if (method === 'hex') {
        result.push(code.toString(16).toUpperCase().padStart(2, '0'));
      } else if (method === 'binary') {
        result.push(code.toString(2).padStart(8, '0'));
      }
    } else if (method === 't9') {
      // T9 keypad (Latin only)
      if (t9Keypad[char]) {
        result.push(t9Keypad[char]);
      } else if (char === ' ') {
        result.push('0'); // Space = 0 in T9
      } else {
        result.push(char); // Keep other non-letter characters as-is
      }
    } else {
      // Alphabet-based methods (A0Z25, A1Z26, Reversed)
      const lowerChar = char.toLowerCase();
      const index = (alphabetArray ?? []).indexOf(lowerChar);
      
      if (index === -1) {
        // Character not in alphabet
        if (char === ' ') {
          // Space is always 0 for alphabet-based methods
          result.push('0');
        } else {
          // Keep other non-alphabet characters as-is (punctuation, numbers, etc.)
          result.push(char);
        }
      } else {
        let num: number;
        
        if (method === 'a0') {
          // A=0, B=1, C=2, ... (A0Z25)
          num = index;
        } else if (method === 'a1') {
          // A=1, B=2, C=3, ... (A1Z26)
          num = index + 1;
        } else if (method === 'reversed') {
          // Reversed alphabet
          num = alphabetArray.length - 1 - index;
        } else {
          num = index;
        }
        
        result.push(num.toString());
      }
    }
  }

  return result.join(' ');
}

export function LettersToNumbersConverter() {
  const t = useTranslations('calculators.lettersToNumbers');
  const [input, setInput] = useState<string>('Hello world');
  const [alphabet, setAlphabet] = useState<string>('latin');
  const [method, setMethod] = useState<EncodingMethod>('a0');
  const [result, setResult] = useState<string>('');

  // Auto-convert when input, alphabet, or method changes
  useEffect(() => {
    if (input.trim()) {
      const converted = lettersToNumbers(input, alphabet, method);
      setResult(converted);
    } else {
      setResult('');
    }
  }, [input, alphabet, method]);

  const handleReset = () => {
    setInput('');
    setResult('');
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Input */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="text" className="input-label">
                {t('textInput')}
              </label>
              <textarea
                id="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="number-input"
                placeholder={t('textPlaceholder')}
                rows={6}
                style={{ 
                  resize: 'vertical', 
                  minHeight: '150px',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div className="input-card numbers-to-letters-compact">
              <label htmlFor="method" className="input-label">
                {t('encodingMethod')}
              </label>
              <select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value as EncodingMethod)}
                className="number-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="a0">{t('methodA0')}</option>
                <option value="a1">{t('methodA1')}</option>
                <option value="reversed">{t('methodReversed')}</option>
                <option value="t9">{t('methodT9')}</option>
                <option value="ascii">{t('methodAscii')}</option>
                <option value="hex">{t('methodHex')}</option>
                <option value="binary">{t('methodBinary')}</option>
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
                fontFamily: 'monospace',
                fontSize: '1.1em',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, minWidth: 0, color: 'var(--text-primary)' }}>{result}</span>
                  <CopyButton text={result} className="btn btn-primary" />
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
                fontFamily: 'monospace',
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
