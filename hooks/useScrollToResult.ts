import { useEffect, useRef } from 'react';

/**
 * Custom hook that automatically scrolls to the result section when a result is calculated
 * @param result - The result value to watch for changes
 * @param enabled - Whether to enable auto-scroll (default: true)
 * @param offset - Offset in pixels from the top (default: 20)
 */
export function useScrollToResult<T>(
  result: T,
  enabled: boolean = true,
  offset: number = 20
) {
  const resultRef = useRef<HTMLDivElement>(null);
  const previousResult = useRef<T>(result);

  useEffect(() => {
    // Only scroll if:
    // 1. Scroll is enabled
    // 2. There is a result (not null/undefined)
    // 3. The result has changed from the previous value
    if (
      enabled &&
      result !== null &&
      result !== undefined &&
      result !== previousResult.current &&
      resultRef.current
    ) {
      // Small delay to ensure the result section is rendered
      setTimeout(() => {
        if (resultRef.current) {
          const elementPosition = resultRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }, 100);
    }

    // Update previous result
    previousResult.current = result;
  }, [result, enabled, offset]);

  return resultRef;
}
