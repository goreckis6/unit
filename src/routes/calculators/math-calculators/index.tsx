import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import MathCalculators from '../../components-qwik/MathCalculators';

export default component$(() => {
  return <MathCalculators />;
});

export const head: DocumentHead = {
  title: 'MathCalculators - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'MathCalculators calculator',
    },
  ],
};
