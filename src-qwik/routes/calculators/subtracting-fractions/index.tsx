import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import SubtractingFractions from "../../components/subtracting-fractions";

export default component$(() => {
  return <SubtractingFractions />;
});

export const head: DocumentHead = {
  title: 'SubtractingFractions - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'SubtractingFractions calculator',
    },
  ],
};
