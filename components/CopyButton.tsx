'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

type CopyButtonProps = {
  text: string;
  className?: string;
};

export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const t = useTranslations('common');
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!text) return;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  if (!text) return null;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className || 'copy-result-btn'}
      disabled={copied}
      title={t('copy')}
      aria-label={t('copy')}
    >
      {copied ? t('copied') : t('copy')}
    </button>
  );
}
