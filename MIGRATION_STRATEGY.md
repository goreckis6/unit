# Qwik Migration Strategy

## Scope
- **87 calculator components** → Qwik components
- **Navbar component** → Qwik component  
- **Home page** → Qwik route
- **100+ routes** → Qwik file-based routing
- **15 languages** → Qwik i18n system

## Migration Approach

### Phase 1: Core Infrastructure ✅
- [x] Qwik setup and configuration
- [x] Routing structure
- [x] i18n system

### Phase 2: Core Components (In Progress)
- [ ] Navbar component
- [ ] Home page
- [ ] Layout component

### Phase 3: Calculator Components (Systematic)
Given the large number (87), we'll migrate in batches:
1. Simple calculators first (Addition, Subtraction, etc.)
2. Medium complexity (Fractions, Percentages, etc.)
3. Complex calculators (Electrical, Advanced Math)

### Phase 4: Routing & Localization
- [ ] Create routes for all calculators
- [ ] Setup locale-based routing
- [ ] Test all language versions

### Phase 5: SSG/Prerendering
- [ ] Configure static site generation
- [ ] Test SEO

## Migration Pattern

### Vue Component Pattern:
```vue
<template>
  <div>
    <input v-model="value" @click="calculate" />
  </div>
</template>
<script>
export default {
  data() { return { value: null } },
  methods: { calculate() { } }
}
</script>
```

### Qwik Component Pattern:
```tsx
import { component$, useSignal, $ } from '@builder.io/qwik';

export default component$(() => {
  const value = useSignal(null);
  const calculate = $(() => { });
  
  return (
    <div>
      <input value={value.value ?? ''} onInput$={(e) => value.value = e.target.value} onClick$={calculate} />
    </div>
  );
});
```

## Key Differences
- `v-model` → `useSignal` + `onInput$`
- `@click` → `onClick$`
- `computed` → `useTask$` / `useComputed$`
- `mounted()` → `useTask$` / `useVisibleTask$`
- `watch` → `useTask$` with tracking

## Estimated Time
- Core components: 1-2 days
- Calculator migration: 3-4 weeks (87 components)
- Testing & polish: 3-5 days
- **Total: ~4-5 weeks**

