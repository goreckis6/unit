import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import AverageCalculator from "../../../components/average-calculator";

export default component$(() => {
  return <AverageCalculator />;
});

export const head: DocumentHead = {
  title: 'AverageCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'AverageCalculator calculator',
    },
  ],
};
