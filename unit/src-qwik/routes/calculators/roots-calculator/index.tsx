import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import RootsCalculator from '../../components/RootsCalculator';

export default component$(() => {
  return <RootsCalculator />;
});

export const head: DocumentHead = {
  title: 'RootsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'RootsCalculator calculator',
    },
  ],
};
