import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import VoltsToWattsCalculator from "../../../components/volts-to-watts-calculator";

export default component$(() => {
  return <VoltsToWattsCalculator />;
});

export const head: DocumentHead = {
  title: 'VoltsToWattsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'VoltsToWattsCalculator calculator',
    },
  ],
};
