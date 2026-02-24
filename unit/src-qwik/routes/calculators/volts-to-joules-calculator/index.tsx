import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import VoltsToJoulesCalculator from '../../components/VoltsToJoulesCalculator';

export default component$(() => {
  return <VoltsToJoulesCalculator />;
});

export const head: DocumentHead = {
  title: 'VoltsToJoulesCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'VoltsToJoulesCalculator calculator',
    },
  ],
};
