import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import LongMultiplicationCalculator from '../../components/LongMultiplicationCalculator';

export default component$(() => {
  return <LongMultiplicationCalculator />;
});

export const head: DocumentHead = {
  title: 'LongMultiplicationCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'LongMultiplicationCalculator calculator',
    },
  ],
};
