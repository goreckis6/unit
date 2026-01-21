import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import KwToAmpsCalculator from "../../../components/kw-to-amps-calculator";

export default component$(() => {
  return <KwToAmpsCalculator />;
});

export const head: DocumentHead = {
  title: 'KwToAmpsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'KwToAmpsCalculator calculator',
    },
  ],
};
