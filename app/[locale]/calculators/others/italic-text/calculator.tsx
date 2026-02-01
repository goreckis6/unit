'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

type ItalicStyle = 'serif-1' | 'serif-2' | 'script-1' | 'script-2' | 'sans-serif-1' | 'sans-serif-2';

// Unicode mappings for italic styles
const italicMaps: Record<ItalicStyle, Record<string, string>> = {
  'serif-1': {
    'a': '𝑎', 'b': '𝑏', 'c': '𝑐', 'd': '𝑑', 'e': '𝑒', 'f': '𝑓', 'g': '𝑔', 'h': '𝒽',
    'i': '𝑖', 'j': '𝑗', 'k': '𝑘', 'l': '𝑙', 'm': '𝑚', 'n': '𝑛', 'o': '𝑜', 'p': '𝑝',
    'q': '𝑞', 'r': '𝑟', 's': '𝑠', 't': '𝑡', 'u': '𝑢', 'v': '𝑣', 'w': '𝑤', 'x': '𝑥',
    'y': '𝑦', 'z': '𝑧',
    'A': '𝐴', 'B': '𝐵', 'C': '𝐶', 'D': '𝐷', 'E': '𝐸', 'F': '𝐹', 'G': '𝐺', 'H': '𝐻',
    'I': '𝐼', 'J': '𝐽', 'K': '𝐾', 'L': '𝐿', 'M': '𝑀', 'N': '𝑁', 'O': '𝑂', 'P': '𝑃',
    'Q': '𝑄', 'R': '𝑅', 'S': '𝑆', 'T': '𝑇', 'U': '𝑈', 'V': '𝑉', 'W': '𝑊', 'X': '𝑋',
    'Y': '𝑌', 'Z': '𝑍'
  },
  'serif-2': {
    'a': '𝒂', 'b': '𝒃', 'c': '𝒄', 'd': '𝒅', 'e': '𝒆', 'f': '𝒇', 'g': '𝒈', 'h': '𝒉',
    'i': '𝒊', 'j': '𝒋', 'k': '𝒌', 'l': '𝒍', 'm': '𝒎', 'n': '𝒏', 'o': '𝒐', 'p': '𝒑',
    'q': '𝒒', 'r': '𝒓', 's': '𝒔', 't': '𝒕', 'u': '𝒖', 'v': '𝒗', 'w': '𝒘', 'x': '𝒙',
    'y': '𝒚', 'z': '𝒛',
    'A': '𝑨', 'B': '𝑩', 'C': '𝑪', 'D': '𝑫', 'E': '𝑬', 'F': '𝑭', 'G': '𝑮', 'H': '𝑯',
    'I': '𝑰', 'J': '𝑱', 'K': '𝑲', 'L': '𝑳', 'M': '𝑴', 'N': '𝑵', 'O': '𝑶', 'P': '𝑷',
    'Q': '𝑸', 'R': '𝑹', 'S': '𝑺', 'T': '𝑻', 'U': '𝑼', 'V': '𝑽', 'W': '𝑾', 'X': '𝑿',
    'Y': '𝒀', 'Z': '𝒁'
  },
  'script-1': {
    'a': '𝒶', 'b': '𝒷', 'c': '𝒸', 'd': '𝒹', 'e': 'ℯ', 'f': '𝒻', 'g': 'ℊ', 'h': '𝒽',
    'i': '𝒾', 'j': '𝒿', 'k': '𝓀', 'l': '𝓁', 'm': '𝓂', 'n': '𝓃', 'o': 'ℴ', 'p': '𝓅',
    'q': '𝓆', 'r': '𝓇', 's': '𝓈', 't': '𝓉', 'u': '𝓊', 'v': '𝓋', 'w': '𝓌', 'x': '𝓍',
    'y': '𝓎', 'z': '𝓏',
    'A': '𝒜', 'B': 'ℬ', 'C': '𝒞', 'D': '𝒟', 'E': 'ℰ', 'F': 'ℱ', 'G': '𝒢', 'H': 'ℋ',
    'I': 'ℐ', 'J': '𝒥', 'K': '𝒦', 'L': 'ℒ', 'M': 'ℳ', 'N': '𝒩', 'O': '𝒪', 'P': '𝒫',
    'Q': '𝒬', 'R': 'ℛ', 'S': '𝒮', 'T': '𝒯', 'U': '𝒰', 'V': '𝒱', 'W': '𝒲', 'X': '𝒳',
    'Y': '𝒴', 'Z': '𝒵'
  },
  'script-2': {
    'a': '𝓪', 'b': '𝓫', 'c': '𝓬', 'd': '𝓭', 'e': '𝓮', 'f': '𝓯', 'g': '𝓰', 'h': '𝓱',
    'i': '𝓲', 'j': '𝓳', 'k': '𝓴', 'l': '𝓵', 'm': '𝓶', 'n': '𝓷', 'o': '𝓸', 'p': '𝓹',
    'q': '𝓺', 'r': '𝓻', 's': '𝓼', 't': '𝓽', 'u': '𝓾', 'v': '𝓿', 'w': '𝔀', 'x': '𝔁',
    'y': '𝔂', 'z': '𝔃',
    'A': '𝓐', 'B': '𝓑', 'C': '𝓒', 'D': '𝓓', 'E': '𝓔', 'F': '𝓕', 'G': '𝓖', 'H': '𝓗',
    'I': '𝓘', 'J': '𝓙', 'K': '𝓚', 'L': '𝓛', 'M': '𝓜', 'N': '𝓝', 'O': '𝓞', 'P': '𝓟',
    'Q': '𝓠', 'R': '𝓡', 'S': '𝓢', 'T': '𝓣', 'U': '𝓤', 'V': '𝓥', 'W': '𝓦', 'X': '𝓧',
    'Y': '𝓨', 'Z': '𝓩'
  },
  'sans-serif-1': {
    'a': '𝘢', 'b': '𝘣', 'c': '𝘤', 'd': '𝘥', 'e': '𝘦', 'f': '𝘧', 'g': '𝘨', 'h': '𝘩',
    'i': '𝘪', 'j': '𝘫', 'k': '𝘬', 'l': '𝘭', 'm': '𝘮', 'n': '𝘯', 'o': '𝘰', 'p': '𝘱',
    'q': '𝘲', 'r': '𝘳', 's': '𝘴', 't': '𝘵', 'u': '𝘶', 'v': '𝘷', 'w': '𝘸', 'x': '𝘹',
    'y': '𝘺', 'z': '𝘻',
    'A': '𝘈', 'B': '𝘉', 'C': '𝘊', 'D': '𝘋', 'E': '𝘌', 'F': '𝘍', 'G': '𝘎', 'H': '𝘏',
    'I': '𝘐', 'J': '𝘑', 'K': '𝘒', 'L': '𝘓', 'M': '𝘔', 'N': '𝘕', 'O': '𝘖', 'P': '𝘗',
    'Q': '𝘘', 'R': '𝘙', 'S': '𝘚', 'T': '𝘛', 'U': '𝘜', 'V': '𝘝', 'W': '𝘞', 'X': '𝘟',
    'Y': '𝘠', 'Z': '𝘡'
  },
  'sans-serif-2': {
    'a': '𝙖', 'b': '𝙗', 'c': '𝙘', 'd': '𝙙', 'e': '𝙚', 'f': '𝙛', 'g': '𝙜', 'h': '𝙝',
    'i': '𝙞', 'j': '𝙟', 'k': '𝙠', 'l': '𝙡', 'm': '𝙢', 'n': '𝙣', 'o': '𝙤', 'p': '𝙥',
    'q': '𝙦', 'r': '𝙧', 's': '𝙨', 't': '𝙩', 'u': '𝙪', 'v': '𝙫', 'w': '𝙬', 'x': '𝙭',
    'y': '𝙮', 'z': '𝙯',
    'A': '𝘼', 'B': '𝘽', 'C': '𝘾', 'D': '𝘿', 'E': '𝙀', 'F': '𝙁', 'G': '𝙂', 'H': '𝙃',
    'I': '𝙄', 'J': '𝙅', 'K': '𝙆', 'L': '𝙇', 'M': '𝙈', 'N': '𝙉', 'O': '𝙊', 'P': '𝙋',
    'Q': '𝙌', 'R': '𝙍', 'S': '𝙎', 'T': '𝙏', 'U': '𝙐', 'V': '𝙑', 'W': '𝙒', 'X': '𝙓',
    'Y': '𝙔', 'Z': '𝙕'
  }
};

function convertToItalic(text: string, style: ItalicStyle): string {
  if (!text) return '';
  
  const map = italicMaps[style];
  return text
    .split('')
    .map(char => map[char] || char)
    .join('');
}

export function ItalicTextGenerator() {
  const t = useTranslations('calculators.italicText');
  const [text, setText] = useState<string>('hello');
  const [results, setResults] = useState<Record<ItalicStyle, string>>({
    'serif-1': '',
    'serif-2': '',
    'script-1': '',
    'script-2': '',
    'sans-serif-1': '',
    'sans-serif-2': ''
  });

  // Auto-convert when text changes
  useEffect(() => {
    if (text) {
      setResults({
        'serif-1': convertToItalic(text, 'serif-1'),
        'serif-2': convertToItalic(text, 'serif-2'),
        'script-1': convertToItalic(text, 'script-1'),
        'script-2': convertToItalic(text, 'script-2'),
        'sans-serif-1': convertToItalic(text, 'sans-serif-1'),
        'sans-serif-2': convertToItalic(text, 'sans-serif-2')
      });
    } else {
      setResults({
        'serif-1': '',
        'serif-2': '',
        'script-1': '',
        'script-2': '',
        'sans-serif-1': '',
        'sans-serif-2': ''
      });
    }
  }, [text]);

  const handleReset = () => {
    setText('');
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Input */}
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

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Output */}
        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Italic (serif) */}
            <div className="input-card">
              <label className="input-label">{t('serif1')}</label>
              <div className="number-input" style={{ 
                minHeight: '60px',
                resize: 'vertical',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '1.2em',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}>
                <span style={{ wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1', minWidth: '0' }}>{results['serif-1'] || t('textPlaceholder')}</span>
                <CopyButton text={results['serif-1']} className="btn btn-secondary" />
              </div>
            </div>

            <div className="input-card">
              <label className="input-label">{t('serif2')}</label>
              <div className="number-input" style={{ 
                minHeight: '60px',
                resize: 'vertical',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '1.2em',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}>
                <span style={{ wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1', minWidth: '0' }}>{results['serif-2'] || t('textPlaceholder')}</span>
                <CopyButton text={results['serif-2']} className="btn btn-secondary" />
              </div>
            </div>

            {/* Cursive / Script */}
            <div className="input-card">
              <label className="input-label">{t('script1')}</label>
              <div className="number-input" style={{ 
                minHeight: '60px',
                resize: 'vertical',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '1.2em',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}>
                <span style={{ wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1', minWidth: '0' }}>{results['script-1'] || t('textPlaceholder')}</span>
                <CopyButton text={results['script-1']} className="btn btn-secondary" />
              </div>
            </div>

            <div className="input-card">
              <label className="input-label">{t('script2')}</label>
              <div className="number-input" style={{ 
                minHeight: '60px',
                resize: 'vertical',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '1.2em',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}>
                <span style={{ wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1', minWidth: '0' }}>{results['script-2'] || t('textPlaceholder')}</span>
                <CopyButton text={results['script-2']} className="btn btn-secondary" />
              </div>
            </div>

            {/* Italic (sans-serif) */}
            <div className="input-card">
              <label className="input-label">{t('sansSerif1')}</label>
              <div className="number-input" style={{ 
                minHeight: '60px',
                resize: 'vertical',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '1.2em',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}>
                <span style={{ wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1', minWidth: '0' }}>{results['sans-serif-1'] || t('textPlaceholder')}</span>
                <CopyButton text={results['sans-serif-1']} className="btn btn-secondary" />
              </div>
            </div>

            <div className="input-card">
              <label className="input-label">{t('sansSerif2')}</label>
              <div className="number-input" style={{ 
                minHeight: '60px',
                resize: 'vertical',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '1.2em',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}>
                <span style={{ wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1', minWidth: '0' }}>{results['sans-serif-2'] || t('textPlaceholder')}</span>
                <CopyButton text={results['sans-serif-2']} className="btn btn-secondary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
