import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import RatioCalculator from "../../../components/ratio-calculator";

export default component$(() => {
  return <RatioCalculator />;
});

export const head: DocumentHead = {
  title: 'RatioCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'RatioCalculator calculator',
    },
  ],
};
