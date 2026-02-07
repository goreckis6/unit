import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import KvaToWattsCalculator from '../../components-qwik/KvaToWattsCalculator';

export default component$(() => {
  return <KvaToWattsCalculator />;
});

export const head: DocumentHead = {
  title: 'KvaToWattsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'KvaToWattsCalculator calculator',
    },
  ],
};
