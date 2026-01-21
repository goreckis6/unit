import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import KineticEnergyCalculator from "../../../components/kinetic-energy-calculator";

export default component$(() => {
  return <KineticEnergyCalculator />;
});

export const head: DocumentHead = {
  title: 'KineticEnergyCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'KineticEnergyCalculator calculator',
    },
  ],
};
