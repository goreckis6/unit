import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import WhToMahCalculator from "../../components/wh-to-mah-calculator";

export default component$(() => {
  return <WhToMahCalculator />;
});

export const head: DocumentHead = {
  title: 'WhToMahCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'WhToMahCalculator calculator',
    },
  ],
};
