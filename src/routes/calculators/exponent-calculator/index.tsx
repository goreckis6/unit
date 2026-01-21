import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import ExponentCalculator from "../../../components/exponent-calculator";

export default component$(() => {
  return <ExponentCalculator />;
});

export const head: DocumentHead = {
  title: 'ExponentCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'ExponentCalculator calculator',
    },
  ],
};
