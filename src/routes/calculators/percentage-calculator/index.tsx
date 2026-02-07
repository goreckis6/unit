import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import PercentageCalculator from '../../components-qwik/PercentageCalculator';

export default component$(() => {
  return <PercentageCalculator />;
});

export const head: DocumentHead = {
  title: 'PercentageCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'PercentageCalculator calculator',
    },
  ],
};
