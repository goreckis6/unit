import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import VaToKvaCalculator from '../../components-qwik/VaToKvaCalculator';

export default component$(() => {
  return <VaToKvaCalculator />;
});

export const head: DocumentHead = {
  title: 'VaToKvaCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'VaToKvaCalculator calculator',
    },
  ],
};
