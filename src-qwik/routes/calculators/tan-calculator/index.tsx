import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import TanCalculator from "../../components/tan-calculator";

export default component$(() => {
  return <TanCalculator />;
});

export const head: DocumentHead = {
  title: 'TanCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'TanCalculator calculator',
    },
  ],
};
