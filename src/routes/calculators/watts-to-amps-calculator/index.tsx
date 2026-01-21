import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import WattsToAmpsCalculator from '../../components-qwik/WattsToAmpsCalculator';

export default component$(() => {
  return <WattsToAmpsCalculator />;
});

export const head: DocumentHead = {
  title: 'WattsToAmpsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'WattsToAmpsCalculator calculator',
    },
  ],
};
