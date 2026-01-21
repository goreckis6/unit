import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import DividingFractionsCalculator from "../../components/dividing-fractions-calculator";

export default component$(() => {
  return <DividingFractionsCalculator />;
});

export const head: DocumentHead = {
  title: 'DividingFractionsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'DividingFractionsCalculator calculator',
    },
  ],
};
