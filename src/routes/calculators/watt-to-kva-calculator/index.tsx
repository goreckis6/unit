import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import WattToKvaCalculator from '../../components-qwik/WattToKvaCalculator';

export default component$(() => {
  return <WattToKvaCalculator />;
});

export const head: DocumentHead = {
  title: 'WattToKvaCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'WattToKvaCalculator calculator',
    },
  ],
};
