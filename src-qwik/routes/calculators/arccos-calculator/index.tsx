import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import ArccosCalculator from '../../components/ArccosCalculator';

export default component$(() => {
  return <ArccosCalculator />;
});

export const head: DocumentHead = {
  title: 'ArccosCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'ArccosCalculator calculator',
    },
  ],
};
