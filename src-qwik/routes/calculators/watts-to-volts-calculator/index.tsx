import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import WattsToVoltsCalculator from "../../components/watts-to-volts-calculator";

export default component$(() => {
  return <WattsToVoltsCalculator />;
});

export const head: DocumentHead = {
  title: 'WattsToVoltsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'WattsToVoltsCalculator calculator',
    },
  ],
};
