import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import WattsToVoltsCalculator from '../../components/WattsToVoltsCalculator';

export default component$(() => {
  return <WattsToVoltsCalculator />;
});

export const head: DocumentHead = {
  title: 'WattsToVoltsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'WattsToVoltsCalculator calculator',
    },
  ],
};
