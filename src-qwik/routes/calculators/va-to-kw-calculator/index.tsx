import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import VaToKwCalculator from "../../components/va-to-kw-calculator";

export default component$(() => {
  return <VaToKwCalculator />;
});

export const head: DocumentHead = {
  title: 'VaToKwCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'VaToKwCalculator calculator',
    },
  ],
};
