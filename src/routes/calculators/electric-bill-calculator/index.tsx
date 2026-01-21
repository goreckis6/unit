import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import ElectricBillCalculator from '../../components-qwik/ElectricBillCalculator';

export default component$(() => {
  return <ElectricBillCalculator />;
});

export const head: DocumentHead = {
  title: 'ElectricBillCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'ElectricBillCalculator calculator',
    },
  ],
};
