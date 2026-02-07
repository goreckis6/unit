import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import VaToWattsCalculator from '../../components/VaToWattsCalculator';

export default component$(() => {
  return <VaToWattsCalculator />;
});

export const head: DocumentHead = {
  title: 'VaToWattsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'VaToWattsCalculator calculator',
    },
  ],
};
