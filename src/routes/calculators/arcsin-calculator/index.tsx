import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import ArcsinCalculator from "../../../components/arcsin-calculator";

export default component$(() => {
  return <ArcsinCalculator />;
});

export const head: DocumentHead = {
  title: 'ArcsinCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'ArcsinCalculator calculator',
    },
  ],
};
