import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import AmpsToKvaCalculator from "../../components/amps-to-kva-calculator";

export default component$(() => {
  return <AmpsToKvaCalculator />;
});

export const head: DocumentHead = {
  title: 'AmpsToKvaCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'AmpsToKvaCalculator calculator',
    },
  ],
};
