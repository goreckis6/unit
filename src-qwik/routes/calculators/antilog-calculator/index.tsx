import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import AntilogCalculator from "../../components/antilog-calculator";

export default component$(() => {
  return <AntilogCalculator />;
});

export const head: DocumentHead = {
  title: 'AntilogCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'AntilogCalculator calculator',
    },
  ],
};
