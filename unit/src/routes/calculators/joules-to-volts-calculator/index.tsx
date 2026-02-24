import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import JoulesToVoltsCalculator from '../../components-qwik/JoulesToVoltsCalculator';

export default component$(() => {
  return <JoulesToVoltsCalculator />;
});

export const head: DocumentHead = {
  title: 'JoulesToVoltsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'JoulesToVoltsCalculator calculator',
    },
  ],
};
