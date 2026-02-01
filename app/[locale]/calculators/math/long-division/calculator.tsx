'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

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
  offset: number;
}

interface DiagramLayout {
  type: 'us' | 'eu';
  divisor: string;
  dividend: string;
  quotientDisplay: string;
  quotientOffset: number;
  dividendStart: number;
  baseWidth: number;
  lines: DiagramLine[];
}

function buildDiagramLines(result: LongDivisionResult, dividendStart: number): DiagramLine[] {
  const lines: DiagramLine[] = [];

  result.steps.forEach((step, index) => {
    const rightPosition = dividendStart + step.endIndex;
    const partialValue = step.partialDividend.toString();
    const productValue = step.product.toString();
    const remainderValue = step.remainder.toString();

    if (index > 0) {
      const minLength = Math.max(1, step.previousRemainder.toString().length) + 1;
      const paddedPartial = partialValue.padStart(minLength, '0');
      lines.push({
        key: `partial-${step.index}`,
        text: paddedPartial,
        tone: 'default',
        offset: rightPosition - (paddedPartial.length - 1),
      });
    }

    const productStart = rightPosition - (productValue.length - 1) - 2;
    lines.push({
      key: `product-${step.index}`,
      text: `- ${productValue}`,
      tone: 'subtract',
      offset: Math.max(0, productStart),
    });

    const separatorLength = Math.max(productValue.length, partialValue.length);
    lines.push({
      key: `rule-${step.index}`,
      text: '-'.repeat(separatorLength),
      tone: 'default',
      offset: rightPosition - (separatorLength - 1),
    });

    if (index === result.steps.length - 1) {
      lines.push({
        key: `remainder-${step.index}`,
        text: remainderValue,
        tone: 'remainder',
        offset: rightPosition - (remainderValue.length - 1),
      });
    }
  });

  return lines;
}

function buildUsDivisionDiagram(result: LongDivisionResult, quotientDisplay: string): DiagramLayout | null {
  if (!result.steps.length) return null;

  const dividend = result.dividend;
  const divisor = result.divisor;
  const bracketSideWidth = 1;
  const bracketGap = 1;
  const dividendStart = divisor.length + bracketSideWidth + bracketGap;
  const baseWidth = Math.max(dividend.length, quotientDisplay.length);
  const quotientOffset = dividendStart + Math.max(0, dividend.length - quotientDisplay.length);
  const lines = buildDiagramLines(result, dividendStart);

  return {
    type: 'us',
    divisor,
    dividend,
    quotientDisplay,
    quotientOffset,
    dividendStart,
    baseWidth,
    lines,
  };
}

function buildEuDivisionDiagram(result: LongDivisionResult, quotientDisplay: string): DiagramLayout | null {
  if (!result.steps.length) return null;

  const dividend = result.dividend;
  const divisor = result.divisor;
  const dividendStart = 2;
  const baseWidth = Math.max(dividend.length, quotientDisplay.length);
  const quotientOffset = dividendStart + Math.max(0, dividend.length - quotientDisplay.length);
  const lines = buildDiagramLines(result, dividendStart);

  return {
    type: 'eu',
    divisor,
    dividend,
    quotientDisplay,
    quotientOffset,
    dividendStart,
    baseWidth,
    lines,
  };
}

export function LongDivisionCalculator() {
  const t = useTranslations('calculators.longDivision');

  const [dividend, setDividend] = useState('487');
  const [divisor, setDivisor] = useState('32');
  const [result, setResult] = useState<LongDivisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagramStyle, setDiagramStyle] = useState<'us' | 'eu'>('us');
  const [showFractionRemainder, setShowFractionRemainder] = useState(false);
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

  const quotientDisplay = useMemo(() => {
    if (!result) return '';
    const quotientValue = result.quotient.toString();
    if (result.remainder === 0n) return quotientValue;
    if (showFractionRemainder) {
      return `${quotientValue} ${result.remainder.toString()}/${result.divisor}`;
    }
    return `${quotientValue} ${t('remainderShort')} ${result.remainder.toString()}`;
  }, [result, showFractionRemainder, t]);

  const diagramLayout = useMemo(() => {
    if (!result) return null;
    if (diagramStyle === 'eu') return buildEuDivisionDiagram(result, quotientDisplay);
    return buildUsDivisionDiagram(result, quotientDisplay);
  }, [diagramStyle, quotientDisplay, result]);
  const diagramStyles: Record<DiagramTone, React.CSSProperties> = {
    default: { color: '#1e293b' },
    result: { color: '#4f46e5', fontWeight: 700 },
    subtract: { color: '#e11d48' },
    remainder: { color: '#16a34a', fontWeight: 700 },
  };
  const diagramSecondaryColor = '#64748b';
  const diagramRuleColor = '#334155';

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
                  <div style={{ marginTop: '0.75rem' }}>
                    <CopyButton text={`${display.quotient} R ${display.remainder}`} className="btn btn-secondary" />
                  </div>
                  {diagramLayout && (
                    <div
                      style={{
                        fontFamily: '"Courier New", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                        marginTop: '0.75rem',
                        fontSize: '28px',
                        lineHeight: 1.1,
                        display: 'inline-block',
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{t('diagramStyleLabel')}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className={diagramStyle === 'us' ? 'btn btn-primary' : 'btn btn-secondary'}
                            onClick={() => setDiagramStyle('us')}
                            style={{ minHeight: '36px', padding: '0 14px' }}
                          >
                            {t('diagramStyleUs')}
                          </button>
                          <button
                            type="button"
                            className={diagramStyle === 'eu' ? 'btn btn-primary' : 'btn btn-secondary'}
                            onClick={() => setDiagramStyle('eu')}
                            style={{ minHeight: '36px', padding: '0 14px' }}
                          >
                            {t('diagramStyleEu')}
                          </button>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                          <input
                            type="checkbox"
                            checked={showFractionRemainder}
                            onChange={(event) => setShowFractionRemainder(event.target.checked)}
                            disabled={!result || result.remainder === 0n}
                          />
                          {t('showFractionToggle')}
                        </label>
                      </div>
                      <div style={{ marginLeft: `${diagramLayout.quotientOffset}ch` }}>
                        <span style={diagramStyles.result}>{diagramLayout.quotientDisplay}</span>
                      </div>
                      <div
                        style={{
                          marginLeft: `${diagramLayout.dividendStart}ch`,
                          borderTop: `2px solid ${diagramRuleColor}`,
                          width: `${diagramLayout.baseWidth}ch`,
                          marginTop: '2px',
                        }}
                      />
                      {diagramLayout.type === 'us' ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                          <div style={{ width: `${diagramLayout.divisor.length}ch`, textAlign: 'right', color: diagramSecondaryColor }}>
                            {diagramLayout.divisor}
                          </div>
                          <div
                            style={{
                              borderRight: `2px solid ${diagramRuleColor}`,
                              width: '1ch',
                              marginRight: '1ch',
                              borderRadius: '0 50% 50% 0',
                              height: '1.2em',
                            }}
                          />
                          <div style={{ color: diagramStyles.default.color }}>{diagramLayout.dividend}</div>
                        </div>
                      ) : (
                        <div style={{ marginLeft: `${diagramLayout.dividendStart}ch`, color: diagramStyles.default.color }}>
                          {diagramLayout.dividend} : {diagramLayout.divisor}
                        </div>
                      )}
                      <div style={{ marginTop: '0.2rem' }}>
                        {diagramLayout.lines.map((line) => (
                          <div key={line.key} style={{ marginLeft: `${Math.max(0, line.offset)}ch` }}>
                            <span style={diagramStyles[line.tone]}>{line.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <span style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>—</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
