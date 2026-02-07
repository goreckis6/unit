import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import AmpsToKilowattsCalculator from '../../components-qwik/AmpsToKilowattsCalculator';

export default component$(() => {
  return <AmpsToKilowattsCalculator />;
});

export const head: DocumentHead = {
  title: 'AmpsToKilowattsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'AmpsToKilowattsCalculator calculator',
    },
  ],
};
