'use client';

import dynamic from 'next/dynamic';

const CalculatorSandpack = dynamic(
  () => import('@/components/CalculatorSandpack').then((m) => ({ default: m.CalculatorSandpack })),
  { ssr: false, loading: () => <div className="calculator-sandpack-loading" style={{ minHeight: 420 }} /> }
);

type Props = {
  code: string;
  labels?: Record<string, string> | null;
};

export function CalculatorSandpackClient({ code, labels }: Props) {
  return <CalculatorSandpack code={code} labels={labels} />;
}
