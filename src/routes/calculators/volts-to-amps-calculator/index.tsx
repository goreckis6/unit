import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import VoltsToAmpsCalculator from '../../components-qwik/VoltsToAmpsCalculator';

export default component$(() => {
  return <VoltsToAmpsCalculator />;
});

export const head: DocumentHead = {
  title: 'VoltsToAmpsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'VoltsToAmpsCalculator calculator',
    },
  ],
};
