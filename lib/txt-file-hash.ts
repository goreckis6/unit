import { createHash } from 'crypto';

/** Stable 64-hex id for named .txt files (same filename → same URL; content changes keep URL). */
export function hashForDisplayName(displayName: string): string {
  return createHash('sha256').update(`txt:${displayName.toLowerCase()}`, 'utf8').digest('hex');
}
