import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import KwToKvaCalculator from "../../components/kw-to-kva-calculator";

export default component$(() => {
  return <KwToKvaCalculator />;
});

export const head: DocumentHead = {
  title: 'KwToKvaCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'KwToKvaCalculator calculator',
    },
  ],
};
