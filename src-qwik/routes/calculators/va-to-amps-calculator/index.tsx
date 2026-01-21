import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import VaToAmpsCalculator from "../../components/va-to-amps-calculator";

export default component$(() => {
  return <VaToAmpsCalculator />;
});

export const head: DocumentHead = {
  title: 'VaToAmpsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'VaToAmpsCalculator calculator',
    },
  ],
};
