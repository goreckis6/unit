'use client';

import { useRouter } from '@/i18n/routing';

export function BackButton({ label }: { label: string }) {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      className="btn-secondary"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5"/>
        <polyline points="12 19 5 12 12 5"/>
      </svg>
      {label}
    </button>
  );
}
