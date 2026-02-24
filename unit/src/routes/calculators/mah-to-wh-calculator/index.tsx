import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import MahToWhCalculator from '../../components-qwik/MahToWhCalculator';

export default component$(() => {
  return <MahToWhCalculator />;
});

export const head: DocumentHead = {
  title: 'MahToWhCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'MahToWhCalculator calculator',
    },
  ],
};
