import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import WattsVoltsAmpsOhmsCalculator from "../../components/watts-volts-amps-ohms-calculator";

export default component$(() => {
  return <WattsVoltsAmpsOhmsCalculator />;
});

export const head: DocumentHead = {
  title: 'WattsVoltsAmpsOhmsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'WattsVoltsAmpsOhmsCalculator calculator',
    },
  ],
};
