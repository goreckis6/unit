import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import SquareCalculator from '../../components/SquareCalculator';

export default component$(() => {
  return <SquareCalculator />;
});

export const head: DocumentHead = {
  title: 'SquareCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'SquareCalculator calculator',
    },
  ],
};
