import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import SimplifyingFractionsCalculator from '../../components/SimplifyingFractionsCalculator';

export default component$(() => {
  return <SimplifyingFractionsCalculator />;
});

export const head: DocumentHead = {
  title: 'SimplifyingFractionsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'SimplifyingFractionsCalculator calculator',
    },
  ],
};
