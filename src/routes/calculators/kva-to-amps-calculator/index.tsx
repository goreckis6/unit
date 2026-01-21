import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import KvaToAmpsCalculator from "../../../components/kva-to-amps-calculator";

export default component$(() => {
  return <KvaToAmpsCalculator />;
});

export const head: DocumentHead = {
  title: 'KvaToAmpsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'KvaToAmpsCalculator calculator',
    },
  ],
};
