import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import SinCalculator from '../../components/SinCalculator';

export default component$(() => {
  return <SinCalculator />;
});

export const head: DocumentHead = {
  title: 'SinCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'SinCalculator calculator',
    },
  ],
};
