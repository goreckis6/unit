# Qwik Migration Example

## Comparison: Vue vs Qwik

### Vue Component (AdditionCalculator.vue)
```vue
<template>
  <div class="calculator-page">
    <input v-model.number="firstNumber" @keyup.enter="calculate" />
    <button @click="calculate">Calculate</button>
  </div>
</template>

<script>
export default {
  data() {
    return { firstNumber: null, secondNumber: null, result: null }
  },
  methods: {
    calculate() { this.result = this.firstNumber + this.secondNumber }
  }
}
</script>
```

### Qwik Component (AdditionCalculator.tsx)
```tsx
import { component$, useSignal, $ } from '@builder.io/qwik';

export default component$(() => {
  const firstNumber = useSignal<number | null>(null);
  const result = useSignal<number | null>(null);
  
  const calculate = $(() => {
    result.value = firstNumber.value + secondNumber.value;
  });
  
  return (
    <div class="calculator-page">
      <input 
        value={firstNumber.value ?? ''}
        onInput$={(e) => firstNumber.value = parseFloat(e.target.value)}
        onKeyUp$={(e) => e.key === 'Enter' && calculate()}
      />
      <button onClick$={calculate}>Calculate</button>
    </div>
  );
});
```

## Key Differences

1. **Reactivity**: Vue uses `v-model`, Qwik uses `useSignal` + `onInput$`
2. **Event Handlers**: Vue uses `@click`, Qwik uses `onClick$` (with $)
3. **Computed**: Vue uses `computed`, Qwik uses `useTask$` or `useComputed$`
4. **Lifecycle**: Vue uses `mounted()`, Qwik uses `useTask$` or `useVisibleTask$`
5. **TypeScript**: Qwik is TypeScript-first, Vue can use TS but it's optional

## Migration Complexity

- **Simple components**: 1-2 hours each
- **Complex components**: 3-5 hours each
- **Total**: 87 components × ~2-3 hours = **174-261 hours** (~4-6 weeks full-time)

## Benefits After Migration

✅ **SSG/Prerendering**: All pages pre-rendered as static HTML
✅ **Better SEO**: Google sees full content immediately
✅ **Faster Load**: No hydration needed (resumability)
✅ **Better Performance**: Only loads JS when needed

