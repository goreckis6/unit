import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import QuadraticEquationCalculator from "../../components/quadratic-equation-calculator";

export default component$(() => {
  return <QuadraticEquationCalculator />;
});

export const head: DocumentHead = {
  title: 'QuadraticEquationCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'QuadraticEquationCalculator calculator',
    },
  ],
};
