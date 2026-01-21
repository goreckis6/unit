import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import ArctanCalculator from "../../components/arctan-calculator";

export default component$(() => {
  return <ArctanCalculator />;
});

export const head: DocumentHead = {
  title: 'ArctanCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'ArctanCalculator calculator',
    },
  ],
};
