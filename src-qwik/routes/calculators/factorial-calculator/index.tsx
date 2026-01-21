import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import FactorialCalculator from "../../../components/factorial-calculator";

export default component$(() => {
  return <FactorialCalculator />;
});

export const head: DocumentHead = {
  title: 'FactorialCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'FactorialCalculator calculator',
    },
  ],
};
