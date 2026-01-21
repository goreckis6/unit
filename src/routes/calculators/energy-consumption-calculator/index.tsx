import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import EnergyConsumptionCalculator from '../../components-qwik/EnergyConsumptionCalculator';

export default component$(() => {
  return <EnergyConsumptionCalculator />;
});

export const head: DocumentHead = {
  title: 'EnergyConsumptionCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'EnergyConsumptionCalculator calculator',
    },
  ],
};
