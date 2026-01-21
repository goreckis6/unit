import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import SquareRootCalculator from "../../components/square-root-calculator";

export default component$(() => {
  return <SquareRootCalculator />;
});

export const head: DocumentHead = {
  title: 'SquareRootCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'SquareRootCalculator calculator',
    },
  ],
};
