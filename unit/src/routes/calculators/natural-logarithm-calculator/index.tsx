import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import NaturalLogarithmCalculator from '../../components-qwik/NaturalLogarithmCalculator';

export default component$(() => {
  return <NaturalLogarithmCalculator />;
});

export const head: DocumentHead = {
  title: 'NaturalLogarithmCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'NaturalLogarithmCalculator calculator',
    },
  ],
};
