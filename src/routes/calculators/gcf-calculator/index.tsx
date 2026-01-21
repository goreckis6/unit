import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import GcfCalculator from "../../../components/gcf-calculator";

export default component$(() => {
  return <GcfCalculator />;
});

export const head: DocumentHead = {
  title: 'GcfCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'GcfCalculator calculator',
    },
  ],
};
