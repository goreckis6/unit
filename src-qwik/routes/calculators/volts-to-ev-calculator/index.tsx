import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import VoltsToEvCalculator from "../../../components/volts-to-ev-calculator";

export default component$(() => {
  return <VoltsToEvCalculator />;
});

export const head: DocumentHead = {
  title: 'VoltsToEvCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'VoltsToEvCalculator calculator',
    },
  ],
};
