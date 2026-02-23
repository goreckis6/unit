'use client';

import { SandpackProvider, SandpackLayout, SandpackPreview } from '@codesandbox/sandpack-react';
import { transformCalculatorCodeForSandpack } from '@/lib/calculator-code-transform';

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
  return [
    "import React, { useRef } from 'react';",
    `const LABELS = ${labJson};`,
    "export const useTranslations = () => (key: string) => LABELS[key] || key;",
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
  const transformedCode = transformCalculatorCodeForSandpack(code);
  const stubsCode = buildStubsCode(labels);

  const files = {
    '/stubs.tsx': stubsCode,
    '/Calculator.tsx': transformedCode,
    '/App.tsx': `import Calculator from './Calculator';

export default function App() {
  return (
    <div style={{ padding: '1rem', minHeight: 400 }}>
      <Calculator />
    </div>
  );
}`,
  };

  const cssUrl = typeof window !== 'undefined' ? `${window.location.origin}/calculator-embed.css` : '/calculator-embed.css';

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
      <SandpackProvider
        template="react-ts"
        files={files}
        options={{
          externalResources: [cssUrl],
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
