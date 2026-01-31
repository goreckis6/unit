'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

interface LongDivisionStep {
  index: number;
  digit: string;
  partialDividend: bigint;
  quotientDigit: bigint;
  product: bigint;
  previousRemainder: bigint;
  remainder: bigint;
  endIndex: number;
  nextDigit?: string;
}

interface LongDivisionResult {
  dividend: string;
  divisor: string;
  quotient: bigint;
  remainder: bigint;
  steps: LongDivisionStep[];
}

function parseNonNegativeBigInt(input: string): bigint | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  try {
    return BigInt(trimmed);
  } catch {
    return null;
  }
}

function buildLongDivisionSteps(dividend: string, divisor: bigint): LongDivisionStep[] {
  const digits = dividend.split('');
  let remainder = 0n;
  let cursor = 0;
  let stepIndex = 1;
  const steps: LongDivisionStep[] = [];

  let partialDividend = 0n;
  let lastDigit = digits[0] ?? '0';
  while (cursor < digits.length && (partialDividend < divisor || cursor === 0)) {
    const digit = digits[cursor];
    lastDigit = digit;
    partialDividend = partialDividend * 10n + BigInt(digit);
    cursor += 1;
    if (partialDividend >= divisor) break;
  }

  const firstQuotientDigit = partialDividend / divisor;
  const firstProduct = firstQuotientDigit * divisor;
  const firstRemainder = partialDividend - firstProduct;
  steps.push({
    index: stepIndex,
    digit: lastDigit,
    partialDividend,
    quotientDigit: firstQuotientDigit,
    product: firstProduct,
    previousRemainder: remainder,
    remainder: firstRemainder,
    endIndex: Math.max(0, cursor - 1),
    nextDigit: cursor < digits.length ? digits[cursor] : undefined,
  });
  remainder = firstRemainder;
  stepIndex += 1;

  while (cursor < digits.length) {
    const digit = digits[cursor];
    const previousRemainder = remainder;
    const nextPartialDividend = remainder * 10n + BigInt(digit);
    const quotientDigit = nextPartialDividend / divisor;
    const product = quotientDigit * divisor;
    const newRemainder = nextPartialDividend - product;

    steps.push({
      index: stepIndex,
      digit,
      partialDividend: nextPartialDividend,
      quotientDigit,
      product,
      previousRemainder,
      remainder: newRemainder,
      endIndex: cursor,
      nextDigit: cursor < digits.length - 1 ? digits[cursor + 1] : undefined,
    });

    remainder = newRemainder;
    stepIndex += 1;
    cursor += 1;
  }

  return steps;
}

function padNumberAt(value: string, rightPosition: number): string {
  const start = Math.max(0, rightPosition - (value.length - 1));
  return `${' '.repeat(start)}${value}`;
}

type DiagramTone = 'default' | 'result' | 'subtract' | 'remainder';

interface DiagramLine {
  key: string;
  text: string;
  tone: DiagramTone;
}

function buildStyledDivisionDiagram(result: LongDivisionResult): DiagramLine[] {
  if (!result.steps.length) return [];

  const dividend = result.dividend;
  const divisor = result.divisor;
  const quotient = result.quotient.toString();
  const remainder = result.remainder.toString();
  const quotientDisplay = result.remainder === 0n ? quotient : `${quotient} r ${remainder}`;
  const indent = 2;
  const baseWidth = Math.max(dividend.length, quotientDisplay.length);
  const quotientStart = Math.max(indent, indent + dividend.length - quotientDisplay.length);
  const lines: DiagramLine[] = [
    { key: 'result', text: `${' '.repeat(quotientStart)}${quotientDisplay}`, tone: 'result' },
    { key: 'header-rule', text: `${' '.repeat(indent)}${'-'.repeat(baseWidth)}`, tone: 'default' },
    { key: 'header', text: `${' '.repeat(indent)}${dividend} : ${divisor}`, tone: 'default' },
  ];

  result.steps.forEach((step, index) => {
    const rightPosition = indent + step.endIndex;
    const partialValue = step.partialDividend.toString();
    const productValue = step.product.toString();
    const remainderValue = step.remainder.toString();

    if (index > 0) {
      const minLength = Math.max(1, step.previousRemainder.toString().length) + 1;
      const paddedPartial = partialValue.padStart(minLength, '0');
      lines.push({
        key: `partial-${step.index}`,
        text: padNumberAt(paddedPartial, rightPosition),
        tone: 'default',
      });
    }

    const productStart = rightPosition - (productValue.length - 1);
    lines.push({
      key: `product-${step.index}`,
      text: `${' '.repeat(Math.max(0, productStart - 2))}- ${productValue}`,
      tone: 'subtract',
    });

    const separatorLength = Math.max(productValue.length, partialValue.length);
    lines.push({
      key: `rule-${step.index}`,
      text: padNumberAt('-'.repeat(separatorLength), rightPosition),
      tone: 'default',
    });

    if (index === result.steps.length - 1) {
      lines.push({
        key: `remainder-${step.index}`,
        text: padNumberAt(remainderValue, rightPosition),
        tone: 'remainder',
      });
    }
  });

  return lines;
}

export function LongDivisionCalculator() {
  const t = useTranslations('calculators.longDivision');

  const [dividend, setDividend] = useState('487');
  const [divisor, setDivisor] = useState('32');
  const [result, setResult] = useState<LongDivisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const parsedDividend = useMemo(() => parseNonNegativeBigInt(dividend), [dividend]);
  const parsedDivisor = useMemo(() => parseNonNegativeBigInt(divisor), [divisor]);
  const hasDividend = dividend.trim().length > 0;
  const hasDivisor = divisor.trim().length > 0;
  const isDividendValid = parsedDividend !== null;
  const isDivisorValid = parsedDivisor !== null && parsedDivisor > 0n;
  const inlineError =
    (hasDivisor && parsedDivisor === 0n && t('errorDivisionByZero')) ||
    (hasDivisor && parsedDivisor === null && t('errorInvalidDivisor')) ||
    (hasDividend && parsedDividend === null && t('errorInvalidDividend')) ||
    null;
  const displayError = error || inlineError;

  const computeResult = useCallback(
    (showErrors: boolean) => {
      const parsedDividend = parseNonNegativeBigInt(dividend);
      if (parsedDividend === null) {
        setResult(null);
        setError(showErrors ? t('errorInvalidDividend') : null);
        return;
      }

      const parsedDivisor = parseNonNegativeBigInt(divisor);
      if (parsedDivisor === null) {
        setResult(null);
        setError(showErrors ? t('errorInvalidDivisor') : null);
        return;
      }

      if (parsedDivisor === 0n) {
        setResult(null);
        setError(showErrors ? t('errorDivisionByZero') : null);
        return;
      }

      const normalizedDividend = parsedDividend.toString();
      const normalizedDivisor = parsedDivisor.toString();
      const quotient = parsedDividend / parsedDivisor;
      const remainder = parsedDividend % parsedDivisor;
      const steps = buildLongDivisionSteps(normalizedDividend, parsedDivisor);

      setError(null);
      setResult({
        dividend: normalizedDividend,
        divisor: normalizedDivisor,
        quotient,
        remainder,
        steps,
      });
    },
    [dividend, divisor, t]
  );

  useEffect(() => {
    if (!dividend.trim() || !divisor.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    computeResult(false);
  }, [dividend, divisor, computeResult]);

  const display = useMemo(() => {
    if (!result) return null;
    return {
      dividend: result.dividend,
      divisor: result.divisor,
      quotient: result.quotient.toString(),
      remainder: result.remainder.toString(),
      steps: result.steps,
    };
  }, [result]);

  const handleReset = useCallback(() => {
    setDividend('487');
    setDivisor('32');
    setResult(null);
    setError(null);
  }, []);

  const diagramLines = useMemo(() => (result ? buildStyledDivisionDiagram(result) : []), [result]);
  const diagramStyles: Record<DiagramTone, React.CSSProperties> = {
    default: { color: '#1e293b' },
    result: { color: '#4f46e5', fontWeight: 700 },
    subtract: { color: '#e11d48' },
    remainder: { color: '#16a34a', fontWeight: 700 },
  };

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card numbers-to-letters-compact">
              <label htmlFor="dividend" className="input-label">
                {t('dividendLabel')}
              </label>
              <input
                id="dividend"
                type="text"
                inputMode="numeric"
                value={dividend}
                onChange={(event) => setDividend(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && computeResult(true)}
                className="number-input"
                placeholder={t('dividendPlaceholder')}
                style={{ minHeight: '44px' }}
              />
              <p className="seo-paragraph" style={{ marginTop: '0.75rem' }}>
                {t('dividendHelp')}
              </p>
            </div>

            <div className="input-card numbers-to-letters-compact">
              <label htmlFor="divisor" className="input-label">
                {t('divisorLabel')}
              </label>
              <input
                id="divisor"
                type="text"
                inputMode="numeric"
                value={divisor}
                onChange={(event) => setDivisor(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && computeResult(true)}
                className="number-input"
                placeholder={t('divisorPlaceholder')}
                style={{ minHeight: '44px' }}
              />
              <p className="seo-paragraph" style={{ marginTop: '0.75rem' }}>
                {t('divisorHelp')}
              </p>
            </div>

            {displayError && (
              <p className="seo-paragraph" style={{ color: 'var(--error)', marginBottom: 0 }}>
                {displayError}
              </p>
            )}

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button
                onClick={() => computeResult(true)}
                className="btn btn-primary"
                style={{ minHeight: '44px' }}
                disabled={!isDividendValid || !isDivisorValid}
              >
                {t('calculate')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card">
            <label className="input-label">{t('resultLabel')}</label>
            <div className="number-input" style={{ minHeight: '160px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {display ? (
                <>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{t('quotientValue', { value: display.quotient })}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{t('remainderValue', { value: display.remainder })}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {t('equation', { a: display.dividend, b: display.divisor, q: display.quotient, r: display.remainder })}
                  </div>
                  <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t('diagramLabel')} </span>
                    {t('divisionDiagram', {
                      divisor: display.divisor,
                      dividend: display.dividend,
                      quotient: display.quotient,
                      remainder: display.remainder,
                    })}
                  </div>
                  <div
                    style={{
                      fontFamily: '"Courier New", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                      marginTop: '0.75rem',
                      whiteSpace: 'pre',
                      fontSize: '28px',
                      lineHeight: 1.1,
                    }}
                  >
                    {diagramLines.map((line) => (
                      <div key={line.key}>
                        <span style={diagramStyles[line.tone]}>{line.text}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <span style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>—</span>
              )}
            </div>
          </div>

          {display && (
            <div className="input-card" style={{ marginTop: '1.25rem' }}>
              <label className="input-label">{t('stepsHeading')}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
                {display.steps.map((step) => (
                  <div key={step.index} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>
                      {t('stepLabel', { step: step.index })}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {t('bringDown', { digit: step.digit, value: step.partialDividend.toString() })}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {t('divide', { partial: step.partialDividend.toString(), divisor: display.divisor, quotientDigit: step.quotientDigit.toString() })}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {t('multiply', { quotientDigit: step.quotientDigit.toString(), divisor: display.divisor, product: step.product.toString() })}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {t('subtract', { partial: step.partialDividend.toString(), product: step.product.toString(), remainder: step.remainder.toString() })}
                    </div>
                    {step.nextDigit && (
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {t('nextDigit', { digit: step.nextDigit })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
