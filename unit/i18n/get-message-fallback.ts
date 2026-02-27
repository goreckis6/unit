/**
 * Shared getMessageFallback for next-intl.
 * Prevents MISSING_MESSAGE throws by returning safe fallbacks for any calculator key.
 */

function humanizeCalcId(id: string): string {
  return id
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
    || id;
}

/** Known calculator fallbacks when translation is missing (English defaults) */
const KNOWN_FALLBACKS: Record<string, { title: string; description: string }> = {
  armyBodyFat: {
    title: 'Army Body Fat Calculator',
    description: 'Calculate your body fat percentage using the official US Army tape test method per AR 600-9. Supports 2026 ACFT exemption for soldiers scoring 540+.',
  },
};

export function createGetMessageFallback() {
  return function getMessageFallback({ namespace, key }: { namespace?: string; key?: string }) {
    const path = [namespace, key].filter(Boolean).join('.');
    if (!path) return '?';

    if (namespace === 'calculators' && key) {
      const match = key.match(/^([^.]+)\.(title|description)$/);
      if (match) {
        const [, calcId, suffix] = match;
        const known = calcId ? KNOWN_FALLBACKS[calcId] : undefined;
        if (suffix === 'title') {
          return known?.title ?? `${humanizeCalcId(calcId || '')} Calculator`;
        }
        if (suffix === 'description') {
          return known?.description ?? `${humanizeCalcId(calcId || '')} - Calculator`;
        }
      }
    }

    return path || '?';
  };
}
