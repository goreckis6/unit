import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import AmpsToWattsCalculator from "../../components/amps-to-watts-calculator";

export default component$(() => {
  return <AmpsToWattsCalculator />;
});

export const head: DocumentHead = {
  title: 'AmpsToWattsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'AmpsToWattsCalculator calculator',
    },
  ],
};
