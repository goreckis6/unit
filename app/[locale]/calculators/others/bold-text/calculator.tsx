'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

type BoldStyle = 'serif' | 'sans-serif' | 'italic-serif' | 'italic-sans-serif' | 'script' | 'fraktur' | 'double-struck' | 'monospace';

// Unicode mappings for bold styles
const boldMaps: Record<BoldStyle, Record<string, string>> = {
  'serif': {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡',
    'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩',
    'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱',
    'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇',
    'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏',
    'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗',
    'Y': '𝐘', 'Z': '𝐙'
  },
  'sans-serif': {
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵',
    'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽',
    'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅',
    'y': '𝘆', 'z': '𝘇',
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛',
    'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣',
    'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫',
    'Y': '𝗬', 'Z': '𝗭'
  },
  'italic-serif': {
    'a': '𝒂', 'b': '𝒃', 'c': '𝒄', 'd': '𝒅', 'e': '𝒆', 'f': '𝒇', 'g': '𝒈', 'h': '𝒉',
    'i': '𝒊', 'j': '𝒋', 'k': '𝒌', 'l': '𝒍', 'm': '𝒎', 'n': '𝒏', 'o': '𝒐', 'p': '𝒑',
    'q': '𝒒', 'r': '𝒓', 's': '𝒔', 't': '𝒕', 'u': '𝒖', 'v': '𝒗', 'w': '𝒘', 'x': '𝒙',
    'y': '𝒚', 'z': '𝒛',
    'A': '𝑨', 'B': '𝑩', 'C': '𝑪', 'D': '𝑫', 'E': '𝑬', 'F': '𝑭', 'G': '𝑮', 'H': '𝑯',
    'I': '𝑰', 'J': '𝑱', 'K': '𝑲', 'L': '𝑳', 'M': '𝑴', 'N': '𝑵', 'O': '𝑶', 'P': '𝑷',
    'Q': '𝑸', 'R': '𝑹', 'S': '𝑺', 'T': '𝑻', 'U': '𝑼', 'V': '𝑽', 'W': '𝑾', 'X': '𝑿',
    'Y': '𝒀', 'Z': '𝒁'
  },
  'italic-sans-serif': {
    'a': '𝙖', 'b': '𝙗', 'c': '𝙘', 'd': '𝙙', 'e': '𝙚', 'f': '𝙛', 'g': '𝙜', 'h': '𝙝',
    'i': '𝙞', 'j': '𝙟', 'k': '𝙠', 'l': '𝙡', 'm': '𝙢', 'n': '𝙣', 'o': '𝙤', 'p': '𝙥',
    'q': '𝙦', 'r': '𝙧', 's': '𝙨', 't': '𝙩', 'u': '𝙪', 'v': '𝙫', 'w': '𝙬', 'x': '𝙭',
    'y': '𝙮', 'z': '𝙯',
    'A': '𝘼', 'B': '𝘽', 'C': '𝘾', 'D': '𝘿', 'E': '𝙀', 'F': '𝙁', 'G': '𝙂', 'H': '𝙃',
    'I': '𝙄', 'J': '𝙅', 'K': '𝙆', 'L': '𝙇', 'M': '𝙈', 'N': '𝙉', 'O': '𝙊', 'P': '𝙋',
    'Q': '𝙌', 'R': '𝙍', 'S': '𝙎', 'T': '𝙏', 'U': '𝙐', 'V': '𝙑', 'W': '𝙒', 'X': '𝙓',
    'Y': '𝙔', 'Z': '𝙕'
  },
  'script': {
    'a': '𝓪', 'b': '𝓫', 'c': '𝓬', 'd': '𝓭', 'e': '𝓮', 'f': '𝓯', 'g': '𝓰', 'h': '𝓱',
    'i': '𝓲', 'j': '𝓳', 'k': '𝓴', 'l': '𝓵', 'm': '𝓶', 'n': '𝓷', 'o': '𝓸', 'p': '𝓹',
    'q': '𝓺', 'r': '𝓻', 's': '𝓼', 't': '𝓽', 'u': '𝓾', 'v': '𝓿', 'w': '𝔀', 'x': '𝔁',
    'y': '𝔂', 'z': '𝔃',
    'A': '𝓐', 'B': '𝓑', 'C': '𝓒', 'D': '𝓓', 'E': '𝓔', 'F': '𝓕', 'G': '𝓖', 'H': '𝓗',
    'I': '𝓘', 'J': '𝓙', 'K': '𝓚', 'L': '𝓛', 'M': '𝓜', 'N': '𝓝', 'O': '𝓞', 'P': '𝓟',
    'Q': '𝓠', 'R': '𝓡', 'S': '𝓢', 'T': '𝓣', 'U': '𝓤', 'V': '𝓥', 'W': '𝓦', 'X': '𝓧',
    'Y': '𝓨', 'Z': '𝓩'
  },
  'fraktur': {
    'a': '𝖆', 'b': '𝖇', 'c': '𝖈', 'd': '𝖉', 'e': '𝖊', 'f': '𝖋', 'g': '𝖌', 'h': '𝖍',
    'i': '𝖎', 'j': '𝖏', 'k': '𝖐', 'l': '𝖑', 'm': '𝖒', 'n': '𝖓', 'o': '𝖔', 'p': '𝖕',
    'q': '𝖖', 'r': '𝖗', 's': '𝖘', 't': '𝖙', 'u': '𝖚', 'v': '𝖛', 'w': '𝖜', 'x': '𝖝',
    'y': '𝖞', 'z': '𝖟',
    'A': '𝕬', 'B': '𝕭', 'C': '𝕮', 'D': '𝕯', 'E': '𝕰', 'F': '𝕱', 'G': '𝕲', 'H': '𝕳',
    'I': '𝕴', 'J': '𝕵', 'K': '𝕶', 'L': '𝕷', 'M': '𝕸', 'N': '𝕹', 'O': '𝕺', 'P': '𝕻',
    'Q': '𝕼', 'R': '𝕽', 'S': '𝕾', 'T': '𝕿', 'U': '𝖀', 'V': '𝖁', 'W': '𝖂', 'X': '𝖃',
    'Y': '𝖄', 'Z': '𝖅'
  },
  'double-struck': {
    'a': '𝕒', 'b': '𝕓', 'c': '𝕔', 'd': '𝕕', 'e': '𝕖', 'f': '𝕗', 'g': '𝕘', 'h': '𝕙',
    'i': '𝕚', 'j': '𝕛', 'k': '𝕜', 'l': '𝕝', 'm': '𝕞', 'n': '𝕟', 'o': '𝕠', 'p': '𝕡',
    'q': '𝕢', 'r': '𝕣', 's': '𝕤', 't': '𝕥', 'u': '𝕦', 'v': '𝕧', 'w': '𝕨', 'x': '𝕩',
    'y': '𝕪', 'z': '𝕫',
    'A': '𝔸', 'B': '𝔹', 'C': 'ℂ', 'D': '𝔻', 'E': '𝔼', 'F': '𝔽', 'G': '𝔾', 'H': 'ℍ',
    'I': '𝕀', 'J': '𝕁', 'K': '𝕂', 'L': '𝕃', 'M': '𝕄', 'N': 'ℕ', 'O': '𝕆', 'P': 'ℙ',
    'Q': 'ℚ', 'R': 'ℝ', 'S': '𝕊', 'T': '𝕋', 'U': '𝕌', 'V': '𝕍', 'W': '𝕎', 'X': '𝕏',
    'Y': '𝕐', 'Z': 'ℤ'
  },
  'monospace': {
    'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏', 'g': '𝚐', 'h': '𝚑',
    'i': '𝚒', 'j': '𝚓', 'k': '𝚔', 'l': '𝚕', 'm': '𝚖', 'n': '𝚗', 'o': '𝚘', 'p': '𝚙',
    'q': '𝚚', 'r': '𝚛', 's': '𝚜', 't': '𝚝', 'u': '𝚞', 'v': '𝚟', 'w': '𝚠', 'x': '𝚡',
    'y': '𝚢', 'z': '𝚣',
    'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶', 'H': '𝙷',
    'I': '𝙸', 'J': '𝙹', 'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽', 'O': '𝙾', 'P': '𝙿',
    'Q': '𝚀', 'R': '𝚁', 'S': '𝚂', 'T': '𝚃', 'U': '𝚄', 'V': '𝚅', 'W': '𝚆', 'X': '𝚇',
    'Y': '𝚈', 'Z': '𝚉'
  }
};

function convertToBold(text: string, style: BoldStyle): string {
  if (!text) return '';
  
  const map = boldMaps[style];
  return text
    .split('')
    .map(char => map[char] || char)
    .join('');
}

export function BoldTextGenerator() {
  const t = useTranslations('calculators.boldText');
  const [text, setText] = useState<string>('hello');
  const [results, setResults] = useState<Record<BoldStyle, string>>({
    'serif': '',
    'sans-serif': '',
    'italic-serif': '',
    'italic-sans-serif': '',
    'script': '',
    'fraktur': '',
    'double-struck': '',
    'monospace': ''
  });

  // Auto-convert when text changes
  useEffect(() => {
    if (text) {
      setResults({
        'serif': convertToBold(text, 'serif'),
        'sans-serif': convertToBold(text, 'sans-serif'),
        'italic-serif': convertToBold(text, 'italic-serif'),
        'italic-sans-serif': convertToBold(text, 'italic-sans-serif'),
        'script': convertToBold(text, 'script'),
        'fraktur': convertToBold(text, 'fraktur'),
        'double-struck': convertToBold(text, 'double-struck'),
        'monospace': convertToBold(text, 'monospace')
      });
    } else {
      setResults({
        'serif': '',
        'sans-serif': '',
        'italic-serif': '',
        'italic-sans-serif': '',
        'script': '',
        'fraktur': '',
        'double-struck': '',
        'monospace': ''
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
            {/* Serif */}
            <div className="input-card">
              <label className="input-label">{t('serif')}</label>
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
                <span style={{ wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1', minWidth: '0' }}>{results['serif'] || t('textPlaceholder')}</span>
                <CopyButton text={results['serif']} className="btn btn-secondary" />
              </div>
            </div>

            {/* Sans-serif */}
            <div className="input-card">
              <label className="input-label">{t('sansSerif')}</label>
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
                <span style={{ wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1', minWidth: '0' }}>{results['sans-serif'] || t('textPlaceholder')}</span>
                <CopyButton text={results['sans-serif']} className="btn btn-secondary" />
              </div>
            </div>

            {/* Italic (serif) */}
            <div className="input-card">
              <label className="input-label">{t('italicSerif')}</label>
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
                <span style={{ wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1', minWidth: '0' }}>{results['italic-serif'] || t('textPlaceholder')}</span>
                <CopyButton text={results['italic-serif']} className="btn btn-secondary" />
              </div>
            </div>

            {/* Italic (sans-serif) */}
            <div className="input-card">
              <label className="input-label">{t('italicSansSerif')}</label>
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
                <span style={{ wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1', minWidth: '0' }}>{results['italic-sans-serif'] || t('textPlaceholder')}</span>
                <CopyButton text={results['italic-sans-serif']} className="btn btn-secondary" />
              </div>
            </div>

            {/* Script */}
            <div className="input-card">
              <label className="input-label">{t('script')}</label>
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
                <span style={{ wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1', minWidth: '0' }}>{results['script'] || t('textPlaceholder')}</span>
                <CopyButton text={results['script']} className="btn btn-secondary" />
              </div>
            </div>

            {/* Fraktur */}
            <div className="input-card">
              <label className="input-label">{t('fraktur')}</label>
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
                <span style={{ wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1', minWidth: '0' }}>{results['fraktur'] || t('textPlaceholder')}</span>
                <CopyButton text={results['fraktur']} className="btn btn-secondary" />
              </div>
            </div>

            {/* Double-struck */}
            <div className="input-card">
              <label className="input-label">{t('doubleStruck')}</label>
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
                <span style={{ wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1', minWidth: '0' }}>{results['double-struck'] || t('textPlaceholder')}</span>
                <CopyButton text={results['double-struck']} className="btn btn-secondary" />
              </div>
            </div>

            {/* Monospace */}
            <div className="input-card">
              <label className="input-label">{t('monospace')}</label>
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
                <span style={{ wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1', minWidth: '0' }}>{results['monospace'] || t('textPlaceholder')}</span>
                <CopyButton text={results['monospace']} className="btn btn-secondary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
