import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import KwToVoltsCalculator from "../../components/kw-to-volts-calculator";

export default component$(() => {
  return <KwToVoltsCalculator />;
});

export const head: DocumentHead = {
  title: 'KwToVoltsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'KwToVoltsCalculator calculator',
    },
  ],
};
