import { component$, useSignal, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import Layout from '../../components/layout';

export const head: DocumentHead = {
  title: 'Temperature Converter - UnitConverterHub',
  meta: [
    {
      name: 'description',
      content: 'Convert between Celsius, Fahrenheit, Kelvin and more temperature units.',
    },
  ],
};

export default component$(() => {
  const fromValue = useSignal<number>(0);
  const fromUnit = useSignal<string>('Celsius');
  const toUnit = useSignal<string>('Fahrenheit');

  const convertTemperature = $((value: number, from: string, to: string): number => {
    if (from === to) return value;

    // Convert to Celsius first
    let celsius = value;
    if (from === 'Fahrenheit') {
      celsius = (value - 32) * 5 / 9;
    } else if (from === 'Kelvin') {
      celsius = value - 273.15;
    } else if (from === 'Rankine') {
      celsius = (value - 491.67) * 5 / 9;
    }

    // Convert from Celsius to target
    if (to === 'Fahrenheit') {
      return celsius * 9 / 5 + 32;
    } else if (to === 'Kelvin') {
      return celsius + 273.15;
    } else if (to === 'Rankine') {
      return (celsius + 273.15) * 9 / 5;
    }
    return celsius;
  });

  const toValue = useSignal<number>(32);

  const handleFromChange = $((value: number) => {
    fromValue.value = value;
    toValue.value = convertTemperature(value, fromUnit.value, toUnit.value);
  });

  const handleFromUnitChange = $((unit: string) => {
    fromUnit.value = unit;
    toValue.value = convertTemperature(fromValue.value, unit, toUnit.value);
  });

  const handleToUnitChange = $((unit: string) => {
    toUnit.value = unit;
    toValue.value = convertTemperature(fromValue.value, fromUnit.value, unit);
  });

  const handleSwap = $(() => {
    const tempUnit = fromUnit.value;
    const tempValue = fromValue.value;
    fromUnit.value = toUnit.value;
    fromValue.value = toValue.value;
    toUnit.value = tempUnit;
    toValue.value = convertTemperature(fromValue.value, fromUnit.value, toUnit.value);
  });

  const units = ['Celsius', 'Fahrenheit', 'Kelvin', 'Rankine'];

  return (
    <Layout>
      <div class="container">
        <div class="converter-card">
          <h1 class="converter-title">Temperature Converter</h1>
          <p class="converter-description">
            Convert between different units of temperature including Celsius, Fahrenheit, Kelvin, and Rankine.
          </p>
          
          <div class="converter-form">
            <div class="input-group">
              <div class="input-wrapper">
                <label>From</label>
                <input
                  type="number"
                  value={fromValue.value}
                  onInput$={(e: any) => handleFromChange(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div class="input-wrapper">
                <label>Unit</label>
                <select
                  value={fromUnit.value}
                  onChange$={(e: any) => handleFromUnitChange(e.target.value)}
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <button class="swap-button" onClick$={handleSwap}>
              ↕ Swap Units
            </button>

            <div class="input-group">
              <div class="input-wrapper">
                <label>To</label>
                <input
                  type="number"
                  value={toValue.value.toFixed(2)}
                  readOnly
                />
              </div>
              <div class="input-wrapper">
                <label>Unit</label>
                <select
                  value={toUnit.value}
                  onChange$={(e: any) => handleToUnitChange(e.target.value)}
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
});
