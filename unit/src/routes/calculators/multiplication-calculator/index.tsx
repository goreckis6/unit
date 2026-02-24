import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import MultiplicationCalculator from '../../components-qwik/MultiplicationCalculator';

export default component$(() => {
  return <MultiplicationCalculator />;
});

export const head: DocumentHead = {
  title: 'MultiplicationCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'MultiplicationCalculator calculator',
    },
  ],
};
