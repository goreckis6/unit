import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import WattToVaCalculator from "../../components/watt-to-va-calculator";

export default component$(() => {
  return <WattToVaCalculator />;
});

export const head: DocumentHead = {
  title: 'WattToVaCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'WattToVaCalculator calculator',
    },
  ],
};
