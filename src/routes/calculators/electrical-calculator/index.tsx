import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import ElectricalCalculator from "../../../components/electrical-calculator";

export default component$(() => {
  return <ElectricalCalculator />;
});

export const head: DocumentHead = {
  title: 'ElectricalCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'ElectricalCalculator calculator',
    },
  ],
};
