'use client';

import { useEffect, useRef } from 'react';
import { SandpackProvider, SandpackLayout, SandpackPreview } from '@codesandbox/sandpack-react';
import { transformCalculatorCodeForSandpack } from '@/lib/calculator-code-transform';
import { CALCULATOR_EMBED_CSS } from '@/lib/calculator-embed-styles';

const EMBED_HEIGHT_MSG = 'calculinohub-embed-height';

const DEFAULT_LABELS: Record<string, string> = {
  calculate: 'Calculate',
  reset: 'Reset',
  result: 'Result',
  resultFraction: 'Result (fraction)',
  resultDecimal: 'Result (decimal)',
  resultPlaceholder: 'Enter expression and click Calculate',
  title: 'Calculator',
};

function buildStubsCode(labels: Record<string, string> | null | undefined): string {
  const LABELS = { ...DEFAULT_LABELS, ...(labels || {}) };
  const labJson = JSON.stringify(LABELS);
  const defaultsJson = JSON.stringify(DEFAULT_LABELS);
  return [
    "import React, { useRef } from 'react';",
    `const LABELS = ${labJson};`,
    `const DEFAULT_LABELS = ${defaultsJson};`,
    // Prefer custom label if non-empty; else default; else key (so we never show raw key when default exists)
    "export const useTranslations = () => (key: string) => { const v = LABELS[key]; return (v != null && String(v).trim() !== '') ? String(v).trim() : (DEFAULT_LABELS[key] ?? key); };",
    "export const useScrollToResult = () => useRef(null);",
    "export const CopyButton = ({ text }: { text: string }) => (",
    "  <button",
    '    type="button"',
    '    className="copy-result-btn"',
    "    onClick={() => navigator.clipboard?.writeText(text)}",
    "  >",
    "    Copy",
    "  </button>",
    ");",
  ].join('\n');
}

type CalculatorSandpackProps = {
  code: string;
  labels?: Record<string, string> | null;
};

export function CalculatorSandpack({ code, labels }: CalculatorSandpackProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const transformedCode = transformCalculatorCodeForSandpack(code);
  const stubsCode = buildStubsCode(labels);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e?.data?.type !== EMBED_HEIGHT_MSG || typeof e.data.height !== 'number') return;
      const iframe = wrapperRef.current?.querySelector?.('iframe') as HTMLIFrameElement | null;
      if (iframe) {
        const h = `${e.data.height}px`;
        iframe.style.height = h;
        iframe.style.minHeight = h;
        /* Ensure parent chain expands so no scrollbar in preview area */
        let p: HTMLElement | null = iframe.parentElement;
        for (let i = 0; i < 4 && p; i++) {
          p.style.overflow = 'visible';
          p.style.minHeight = h;
          p = p.parentElement;
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const files = {
    '/stubs.tsx': stubsCode,
    '/Calculator.tsx': transformedCode,
    '/styles.css': { code: CALCULATOR_EMBED_CSS },
    '/App.tsx': `import React, { useEffect, useRef } from 'react';
import './styles.css';
import Calculator from './Calculator';

function CalcEmbedRoot({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el?.parentElement) return;
    const sendHeight = () => {
      const h = Math.max(420, el.scrollHeight + 48);
      try { window.parent?.postMessage({ type: '${EMBED_HEIGHT_MSG}', height: h }, '*'); } catch {}
    };
    sendHeight();
    const ro = new ResizeObserver(sendHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="calc-embed-root">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <CalcEmbedRoot>
      <Calculator />
    </CalcEmbedRoot>
  );
}`,
  };

  return (
    <div ref={wrapperRef} className="calculator-sandpack-wrapper" style={{ borderRadius: 8, overflow: 'visible', border: '1px solid var(--border-color)' }}>
      <SandpackProvider
        template="react-ts"
        files={files}
        options={{
          bundlerURL: 'https://sandpack-bundler.codesandbox.io',
          initMode: 'user-visible',
          initModeObserverOptions: { rootMargin: '200px 0px' },
        }}
        customSetup={{ dependencies: {} }}
      >
        <SandpackLayout>
          <SandpackPreview
            showNavigator={false}
            showOpenInCodeSandbox={false}
            showOpenNewtab={false}
            showRefreshButton={false}
            style={{ minHeight: 420 }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
