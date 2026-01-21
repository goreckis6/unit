import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import PercentErrorCalculator from "../../../components/percent-error-calculator";

export default component$(() => {
  return <PercentErrorCalculator />;
});

export const head: DocumentHead = {
  title: 'PercentErrorCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'PercentErrorCalculator calculator',
    },
  ],
};
