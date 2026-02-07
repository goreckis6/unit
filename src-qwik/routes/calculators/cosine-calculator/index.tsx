import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import CosineCalculator from '../../components/CosineCalculator';

export default component$(() => {
  return <CosineCalculator />;
});

export const head: DocumentHead = {
  title: 'CosineCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'CosineCalculator calculator',
    },
  ],
};
