import { component$, useSignal, $, useVisibleTask$ } from '@builder.io/qwik';

interface ConversionUnit {
  name: string;
  value: number; // conversion factor to base unit
  symbol: string;
}

interface ConverterBaseProps {
  title: string;
  description: string;
  units: ConversionUnit[];
  baseUnit: string;
}

export default component$<ConverterBaseProps>((props) => {
  const fromValue = useSignal<number>(1);
  const fromUnit = useSignal<string>(props.units[0].name);
  const toUnit = useSignal<string>(props.units[1]?.name || props.units[0].name);
  const convert = (value: number, from: string, to: string): number => {
    if (from === to) return value;
    
    const fromUnitData = props.units.find(u => u.name === from);
    const toUnitData = props.units.find(u => u.name === to);
    
    if (!fromUnitData || !toUnitData) return value;
    
    // Convert to base unit, then to target unit
    const baseValue = value * fromUnitData.value;
    return baseValue / toUnitData.value;
  };

  // Calculate initial value
  const initialToValue = convert(1, props.units[0].name, props.units[1]?.name || props.units[0].name);
  const toValue = useSignal<number>(initialToValue);

  const updateConversion = $(() => {
    toValue.value = convert(fromValue.value, fromUnit.value, toUnit.value);
  });

  useVisibleTask$(({ track }) => {
    track(() => fromValue.value);
    track(() => fromUnit.value);
    track(() => toUnit.value);
    updateConversion();
  });

  const handleFromChange = $((value: number) => {
    fromValue.value = value;
  });

  const handleFromUnitChange = $((unit: string) => {
    fromUnit.value = unit;
  });

  const handleToUnitChange = $((unit: string) => {
    toUnit.value = unit;
  });

  const handleSwap = $(() => {
    const tempUnit = fromUnit.value;
    const tempValue = fromValue.value;
    fromUnit.value = toUnit.value;
    fromValue.value = toValue.value;
    toUnit.value = tempUnit;
  });

  return (
    <div class="converter-card">
      <h1 class="converter-title">{props.title}</h1>
      <p class="converter-description">{props.description}</p>
      
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
              {props.units.map((unit) => (
                <option key={unit.name} value={unit.name}>
                  {unit.name} ({unit.symbol})
                </option>
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
              value={toValue.value.toFixed(6)}
              readOnly
            />
          </div>
          <div class="input-wrapper">
            <label>Unit</label>
            <select
              value={toUnit.value}
              onChange$={(e: any) => handleToUnitChange(e.target.value)}
            >
              {props.units.map((unit) => (
                <option key={unit.name} value={unit.name}>
                  {unit.name} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
});
