import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import WireGaugeCalculator from "../../components/wire-gauge-calculator";

export default component$(() => {
  return <WireGaugeCalculator />;
});

export const head: DocumentHead = {
  title: 'WireGaugeCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'WireGaugeCalculator calculator',
    },
  ],
};
