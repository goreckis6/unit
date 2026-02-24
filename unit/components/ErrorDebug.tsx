'use client';

import { useEffect } from 'react';

export function ErrorDebug() {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      console.error('[ErrorDebug] Uncaught error:', event.message);
      console.error('[ErrorDebug] Stack:', event.error?.stack);
      console.error('[ErrorDebug] Filename:', event.filename, 'Line:', event.lineno, 'Col:', event.colno);
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);
  return null;
}
