'use client';

import { useEffect, useRef, useState } from 'react';

const DURATION_MS = 1400;

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function HeroAnimatedCountLine({
  targetCount,
  locale,
  freeWord,
  suffix,
}: {
  targetCount: number;
  locale: string;
  freeWord: string;
  suffix: string;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(0);
  const nf = new Intl.NumberFormat(locale);
  const finalText = `${nf.format(targetCount)}${freeWord}${suffix}`;

  useEffect(() => {
    setDisplay(0);
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / DURATION_MS);
      const eased = easeOutCubic(t);
      const next = Math.round(eased * targetCount);
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(targetCount);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetCount]);

  return (
    <p className="hero-count-line">
      <span aria-hidden="true" className="hero-count-run">
        <span className="hero-count-value-wrap">
          <span className="hero-count-sizer">{nf.format(targetCount)}</span>
          <span className="hero-count-value">{nf.format(display)}</span>
        </span>
        {freeWord}
        {suffix}
      </span>
      <span className="sr-only">{finalText}</span>
    </p>
  );
}
