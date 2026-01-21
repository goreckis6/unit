import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import WattsToJoulesCalculator from '../../components/WattsToJoulesCalculator';

export default component$(() => {
  return <WattsToJoulesCalculator />;
});

export const head: DocumentHead = {
  title: 'WattsToJoulesCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'WattsToJoulesCalculator calculator',
    },
  ],
};
