'use client';

import { useTranslate } from '../TranslateContext';
import { useGenerate } from '../GenerateContext';

export function AdminProgressBar() {
  const { translateProgress } = useTranslate();
  const { generateProgress } = useGenerate();

  const progress = translateProgress || generateProgress;
  const label = translateProgress ? 'Tłumaczenie…' : generateProgress ? 'Generowanie…' : null;

  if (!progress || !label) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 2000,
        background: 'var(--bg-primary, #1a1a2e)',
        border: '1px solid var(--border-color, #334155)',
        borderRadius: 8,
        padding: '0.75rem 1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        minWidth: 200,
      }}
    >
      <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        {progress.current}/{progress.total}
        {'title' in progress && progress.title ? ` — ${progress.title}` : ''}
      </span>
      <div
        style={{
          height: 4,
          background: 'var(--border-color, #334155)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(progress.current / progress.total) * 100}%`,
            background: 'var(--primary-color, #6366f1)',
            transition: 'width 0.2s',
          }}
        />
      </div>
    </div>
  );
}
