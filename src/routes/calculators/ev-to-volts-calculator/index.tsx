import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import EvToVoltsCalculator from "../../../components/ev-to-volts-calculator";

export default component$(() => {
  return <EvToVoltsCalculator />;
});

export const head: DocumentHead = {
  title: 'EvToVoltsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'EvToVoltsCalculator calculator',
    },
  ],
};
