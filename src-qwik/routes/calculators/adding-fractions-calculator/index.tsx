import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import AddingFractionsCalculator from "../../components/adding-fractions-calculator";

export default component$(() => {
  return <AddingFractionsCalculator />;
});

export const head: DocumentHead = {
  title: 'AddingFractionsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'AddingFractionsCalculator calculator',
    },
  ],
};
