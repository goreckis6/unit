'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

type AlphabetId = 'latin' | 'cyrillic' | 'greek' | 'hebrew' | 'arabic';
type Mode = 'encode' | 'decode';

// Lowercase and uppercase for case-preserving alphabets
const alphabets: Record<AlphabetId, { lower: string[]; upper?: string[] }> = {
  latin: {
    lower: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    upper: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  },
  cyrillic: {
    lower: ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'],
    upper: ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'],
  },
  greek: {
    lower: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'],
    upper: ['Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'],
  },
  hebrew: {
    lower: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'],
  },
  arabic: {
    lower: ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'],
  },
};

function caesarShift(
  text: string,
  alphabetId: AlphabetId,
  shift: number,
  mode: Mode
): string {
  if (!text.trim()) return '';
  const set = alphabets[alphabetId];
  if (!set) return text;
  const lower = set.lower;
  const upper = set.upper;
  const len = lower.length;
  const s = ((mode === 'decode' ? -shift : shift) % len + len) % len;

  let result = '';
  for (const char of text) {
    const lowerIndex = lower.indexOf(char);
    const upperIndex = upper ? upper.indexOf(char) : -1;
    if (lowerIndex !== -1) {
      const newIndex = (lowerIndex + s) % len;
      result += lower[newIndex];
    } else if (upperIndex !== -1 && upper) {
      const newIndex = (upperIndex + s) % len;
      result += upper[newIndex];
    } else {
      result += char;
    }
  }
  return result;
}

export function CaesarCipherCalculator() {
  const t = useTranslations('calculators.caesarCipher');
  const [text, setText] = useState<string>('');
  const [alphabet, setAlphabet] = useState<AlphabetId>('latin');
  const [shift, setShift] = useState<number>(2);
  const [mode, setMode] = useState<Mode>('encode');
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    if (text) {
      const shifted = caesarShift(text, alphabet, shift, mode);
      setResult(shifted);
    } else {
      setResult('');
    }
  }, [text, alphabet, shift, mode]);

  const handleReset = () => {
    setText('');
    setShift(2);
    setResult('');
  };

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs caesar-cipher-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="caesar-text" className="input-label">
                {t('textInput')}
              </label>
              <textarea
                id="caesar-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="number-input"
                placeholder={t('textPlaceholder')}
                rows={6}
                style={{
                  resize: 'vertical',
                  minHeight: '160px',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              />
            </div>

            <div className="input-card caesar-alphabet-field">
              <label htmlFor="alphabet" className="input-label">
                {t('alphabet')}
              </label>
              <select
                id="alphabet"
                value={alphabet}
                onChange={(e) => setAlphabet(e.target.value as AlphabetId)}
                className="number-input select-dropdown"
                style={{ cursor: 'pointer' }}
              >
                <option value="latin">{t('alphabetLatin')}</option>
                <option value="cyrillic">{t('alphabetCyrillic')}</option>
                <option value="greek">{t('alphabetGreek')}</option>
                <option value="hebrew">{t('alphabetHebrew')}</option>
                <option value="arabic">{t('alphabetArabic')}</option>
              </select>
            </div>

            <div className="input-card caesar-shift-field">
              <label htmlFor="shift" className="input-label">
                {t('shiftLabel')}
              </label>
              <input
                id="shift"
                type="number"
                min={0}
                max={100}
                value={shift}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 0 && v <= 100) setShift(v);
                }}
                className="number-input"
                style={{ minHeight: '44px' }}
              />
            </div>

            <div className="input-card">
              <span className="input-label">{t('mode')}</span>
              <div className="options-grid options-grid-dropdowns" style={{ marginTop: '0.5rem' }}>
                <label className="radio-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="caesar-mode"
                    checked={mode === 'encode'}
                    onChange={() => setMode('encode')}
                  />
                  {t('modeEncode')}
                </label>
                <label className="radio-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="caesar-mode"
                    checked={mode === 'decode'}
                    onChange={() => setMode('decode')}
                  />
                  {t('modeDecode')}
                </label>
              </div>
            </div>

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card">
            <label className="input-label">{t('result')}</label>
            {result ? (
              <div
                className="number-input"
                style={{
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  minHeight: '160px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, minWidth: 0 }}>{result}</span>
                  <CopyButton text={result} />
                </div>
              </div>
            ) : (
              <div
                className="number-input"
                style={{
                  minHeight: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.25rem',
                  opacity: 0.5,
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{t('resultPlaceholder')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
