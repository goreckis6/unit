import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import KvaToVaCalculator from "../../components/kva-to-va-calculator";

export default component$(() => {
  return <KvaToVaCalculator />;
});

export const head: DocumentHead = {
  title: 'KvaToVaCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'KvaToVaCalculator calculator',
    },
  ],
};
