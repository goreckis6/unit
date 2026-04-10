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
const KNOWN_FALLBACKS: Record<string, { title: string; description: string }> = {};

export function createGetMessageFallback() {
  return function getMessageFallback({ namespace, key }: { namespace?: string; key?: string }) {
    const path = [namespace, key].filter(Boolean).join('.');
    if (!path) return '?';

    // Homepage hero suffix after animated count (English; override per locale in JSON)
    if (path === 'common.homePage.heroHeadlineFreeWord') {
      return '';
    }
    if (path === 'common.homePage.heroHeadlineSuffix') {
      return ' Free Calculators. One Powerful Hub.';
    }

    // Generic calculators.*.title / calculators.*.description
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
