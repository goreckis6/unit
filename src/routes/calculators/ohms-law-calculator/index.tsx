import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import OhmsLawCalculator from '../../components-qwik/OhmsLawCalculator';

export default component$(() => {
  return <OhmsLawCalculator />;
});

export const head: DocumentHead = {
  title: 'OhmsLawCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'OhmsLawCalculator calculator',
    },
  ],
};
