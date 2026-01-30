'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ReverseTextGeneratorCalculator() {
  const [inputText, setInputText] = useState('');
  const [reversedText, setReversedText] = useState('');
  const [copied, setCopied] = useState(false);

  const t = useTranslations('calculators.reverseTextGenerator');

  const handleReverse = () => {
    const reversed = inputText.split('').reverse().join('');
    setReversedText(reversed);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reversedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="calculator-content">
      <div className="input-group">
        <label htmlFor="inputText" className="input-label">
          {t('inputLabel')}
        </label>
        <textarea
          id="inputText"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('inputPlaceholder')}
          className="input-field textarea-field"
          rows={5}
        />
      </div>

      <button onClick={handleReverse} className="calculate-button">
        {t('reverseButton')}
      </button>

      {reversedText && (
        <div className="result-section">
          <div className="result-group">
            <label className="result-label">{t('resultLabel')}</label>
            <div className="result-box">
              <textarea
                value={reversedText}
                readOnly
                className="result-textarea"
                rows={5}
              />
              <button onClick={handleCopy} className="copy-button">
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
