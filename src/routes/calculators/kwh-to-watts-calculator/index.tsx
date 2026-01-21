import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import KwhToWattsCalculator from '../../components-qwik/KwhToWattsCalculator';

export default component$(() => {
  return <KwhToWattsCalculator />;
});

export const head: DocumentHead = {
  title: 'KwhToWattsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'KwhToWattsCalculator calculator',
    },
  ],
};
