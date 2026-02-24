import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import SubtractionCalculator from '../../components-qwik/SubtractionCalculator';

export default component$(() => {
  return <SubtractionCalculator />;
});

export const head: DocumentHead = {
  title: 'SubtractionCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'SubtractionCalculator calculator',
    },
  ],
};
