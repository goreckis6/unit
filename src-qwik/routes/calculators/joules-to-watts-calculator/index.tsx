import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import JoulesToWattsCalculator from '../../components/JoulesToWattsCalculator';

export default component$(() => {
  return <JoulesToWattsCalculator />;
});

export const head: DocumentHead = {
  title: 'JoulesToWattsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'JoulesToWattsCalculator calculator',
    },
  ],
};
