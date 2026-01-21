import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import VoltageDividerCalculator from "../../../components/voltage-divider-calculator";

export default component$(() => {
  return <VoltageDividerCalculator />;
});

export const head: DocumentHead = {
  title: 'VoltageDividerCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'VoltageDividerCalculator calculator',
    },
  ],
};
