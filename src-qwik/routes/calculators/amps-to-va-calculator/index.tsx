import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import AmpsToVaCalculator from "../../../components/amps-to-va-calculator";

export default component$(() => {
  return <AmpsToVaCalculator />;
});

export const head: DocumentHead = {
  title: 'AmpsToVaCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'AmpsToVaCalculator calculator',
    },
  ],
};
