# Vue to Qwik Migration Template Guide

This guide helps you manually complete the migration after using the automated script.

## Conversion Patterns

### 1. Component Structure

**Vue:**
```vue
<script>
export default {
  data() {
    return {
      value: null,
      items: []
    }
  },
  computed: {
    canCalculate() {
      return this.value !== null
    }
  },
  methods: {
    calculate() {
      this.result = this.value * 2
    }
  },
  mounted() {
    this.init()
  }
}
</script>
```

**Qwik:**
```tsx
import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';

export default component$(() => {
  // Data → useSignal
  const value = useSignal<number | null>(null);
  const items = useSignal<any[]>([]);
  
  // Computed → useTask$ or useComputed$
  const canCalculate = useSignal(false);
  useTask$(({ track }) => {
    track(() => value.value);
    canCalculate.value = value.value !== null;
  });
  
  // Methods → $ functions
  const calculate = $(() => {
    result.value = value.value * 2;
  });
  
  // Lifecycle → useTask$ / useVisibleTask$
  useTask$(() => {
    init();
  });
  
  return (/* JSX */);
});
```

### 2. Template Syntax

| Vue | Qwik |
|-----|------|
| `v-model="value"` | `value={value.value ?? ''} onInput$={(e) => value.value = e.target.value}` |
| `@click="method"` | `onClick$={method}` |
| `@keyup.enter="method"` | `onKeyUp$={(e) => e.key === 'Enter' && method()}` |
| `:class="{ active: condition }"` | `class={condition ? 'active' : ''}` |
| `:disabled="condition"` | `disabled={condition}` |
| `v-if="condition"` | `{condition && <div>...</div>}` |
| `v-for="item in items"` | `{items.value.map((item, idx) => <div key={idx}>...</div>)}` |
| `{{ $t('key') }}` | `{t('key')}` |
| `{{ value }}` | `{value.value}` |
| `router-link :to="path"` | `<Link href={path}>` (import from '@builder.io/qwik-city') |
| `$route.path` | `loc.url.pathname` (from useLocation()) |
| `$i18n.locale` | Extract from useLocation() or useTranslate() |

### 3. Event Handlers

**Vue:**
```vue
<input @input="validate" @keyup.enter="calculate" />
<button @click="calculate" :disabled="!canCalculate">Calculate</button>
```

**Qwik:**
```tsx
<input 
  onInput$={(e) => {
    validate();
  }}
  onKeyUp$={(e) => {
    if (e.key === 'Enter') {
      calculate();
    }
  }}
/>
<button onClick$={calculate} disabled={!canCalculate.value}>
  Calculate
</button>
```

### 4. Reactive State

**Vue:**
```vue
<template>
  <div>{{ result }}</div>
  <input v-model.number="value" />
</template>
<script>
export default {
  data() {
    return {
      value: null,
      result: null
    }
  }
}
</script>
```

**Qwik:**
```tsx
export default component$(() => {
  const value = useSignal<number | null>(null);
  const result = useSignal<number | null>(null);
  
  return (
    <>
      <div>{result.value}</div>
      <input 
        type="number"
        value={value.value ?? ''}
        onInput$={(e) => {
          const target = e.target as HTMLInputElement;
          value.value = target.value ? parseFloat(target.value) : null;
        }}
      />
    </>
  );
});
```

### 5. Computed Properties

**Vue:**
```vue
<script>
export default {
  computed: {
    canCalculate() {
      return this.value1 !== null && this.value2 !== null
    }
  }
}
</script>
```

**Qwik:**
```tsx
export default component$(() => {
  const value1 = useSignal<number | null>(null);
  const value2 = useSignal<number | null>(null);
  const canCalculate = useSignal(false);
  
  useTask$(({ track }) => {
    track(() => value1.value);
    track(() => value2.value);
    canCalculate.value = value1.value !== null && value2.value !== null;
  });
  
  // Or use useComputed$ for read-only computed
  // const canCalculate = useComputed$(() => {
  //   return value1.value !== null && value2.value !== null;
  // });
});
```

### 6. Lifecycle Hooks

**Vue:**
```vue
<script>
export default {
  mounted() {
    this.init();
  },
  beforeUnmount() {
    this.cleanup();
  }
}
</script>
```

**Qwik:**
```tsx
import { useVisibleTask$ } from '@builder.io/qwik';

export default component$(() => {
  useVisibleTask$(() => {
    // Runs when component becomes visible (similar to mounted)
    init();
    
    // Cleanup function
    return () => {
      cleanup();
    };
  });
});
```

### 7. Navigation

**Vue:**
```vue
<template>
  <router-link :to="path">Link</router-link>
</template>
<script>
export default {
  methods: {
    navigate() {
      this.$router.push('/path')
    }
  }
}
</script>
```

**Qwik:**
```tsx
import { Link, useNavigate } from '@builder.io/qwik-city';

export default component$(() => {
  const nav = useNavigate();
  
  const navigate = $(() => {
    nav('/path');
  });
  
  return (
    <>
      <Link href="/path">Link</Link>
      <button onClick$={navigate}>Navigate</button>
    </>
  );
});
```

### 8. i18n

**Vue:**
```vue
<template>
  <div>{{ $t('key') }}</div>
  <div>{{ $t('nested.key') }}</div>
</template>
<script>
export default {
  mounted() {
    console.log(this.$i18n.locale)
  }
}
</script>
```

**Qwik:**
```tsx
import { useTranslate } from '../i18n/useTranslate';
import { useLocation } from '@builder.io/qwik-city';

export default component$(() => {
  const t = useTranslate();
  const loc = useLocation();
  
  // Extract locale from URL path
  const locale = loc.url.pathname.split('/')[1] || 'en';
  
  return (
    <div>{t('key')}</div>
    <div>{t('nested.key')}</div>
  );
});
```

### 9. SEO / Meta Tags

**Vue:**
```vue
<script>
export default {
  mounted() {
    document.title = this.$t('seo.title');
    // Update meta tags manually
  }
}
</script>
```

**Qwik:**
```tsx
import type { DocumentHead } from '@builder.io/qwik-city';

export const head: DocumentHead = {
  title: 'Page Title',
  meta: [
    {
      name: 'description',
      content: 'Page description',
    },
  ],
};
```

### 10. Component Props

**Vue:**
```vue
<script>
export default {
  props: {
    title: String,
    value: Number
  }
}
</script>
```

**Qwik:**
```tsx
interface Props {
  title: string;
  value: number;
}

export default component$<Props>(({ title, value }) => {
  return <div>{title}: {value}</div>;
});
```

## Common Patterns Checklist

- [ ] Convert `data()` → `useSignal`
- [ ] Convert `computed` → `useTask$` or `useComputed$`
- [ ] Convert `methods` → `$` functions
- [ ] Convert `mounted()` → `useTask$` or `useVisibleTask$`
- [ ] Convert `v-model` → `value` + `onInput$`
- [ ] Convert `@click` → `onClick$`
- [ ] Convert `v-if` → conditional rendering
- [ ] Convert `v-for` → `.map()`
- [ ] Convert `$t()` → `t()` from `useTranslate()`
- [ ] Convert `router-link` → `Link` from '@builder.io/qwik-city'
- [ ] Convert `$route` → `useLocation()`
- [ ] Add `DocumentHead` export for SEO
- [ ] Update imports (Vue → Qwik)
- [ ] Remove `<style scoped>` (move to global CSS or use class names)

## Tips

1. **Start simple**: Convert data and methods first, then template
2. **Test incrementally**: Test after each major conversion
3. **Use TypeScript**: Qwik is TypeScript-first, add types
4. **Check console**: Qwik will warn about incorrect usage
5. **Reference examples**: Look at migrated components as reference


