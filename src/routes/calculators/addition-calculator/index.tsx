import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import AdditionCalculator from '../../components-qwik/AdditionCalculator';

export default component$(() => {
  return <AdditionCalculator />;
});

export const head: DocumentHead = {
  title: 'AdditionCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'AdditionCalculator calculator',
    },
  ],
};
