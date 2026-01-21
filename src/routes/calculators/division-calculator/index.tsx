import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import DivisionCalculator from '../../components-qwik/DivisionCalculator';

export default component$(() => {
  return <DivisionCalculator />;
});

export const head: DocumentHead = {
  title: 'DivisionCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'DivisionCalculator calculator',
    },
  ],
};
