import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import FactorialCalculator from '../../components-qwik/FactorialCalculator';

export default component$(() => {
  return <FactorialCalculator />;
});

// DocumentHead is defined in FactorialCalculator component
// This is kept for compatibility but will be overridden by component's head
export const head: DocumentHead = {
  title: 'Factorial Calculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'Free online factorial calculator',
    },
  ],
};
