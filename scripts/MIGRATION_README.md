# Qwik Migration Tools

## Automated Migration Script

The `migrate-to-qwik.js` script helps automate the initial migration of Vue components to Qwik.

### Usage

#### Migrate All Components
```bash
npm run migrate:qwik
```

This will:
- Read all Vue components from `src/views/calculators/`
- Generate Qwik component templates in `src-qwik/components/`
- Generate route files in `src-qwik/routes/calculators/`
- Create basic structure for manual completion

#### Migrate Single Component
```bash
npm run migrate:qwik:single ComponentName
# Example:
npm run migrate:qwik:single AdditionCalculator
```

### What the Script Does

1. **Reads Vue component files**
   - Extracts template, script, and style sections
   - Analyzes component structure

2. **Generates Qwik component template**
   - Creates TypeScript component file
   - Adds basic imports and structure
   - Includes TODO comments for manual conversion

3. **Generates route files**
   - Creates route structure in `src-qwik/routes/calculators/`
   - Sets up basic routing

### What You Need to Do Manually

After running the script, you need to manually complete:

1. **Convert Vue template to Qwik JSX**
   - `v-model` → `useSignal` + `onInput$`
   - `@click` → `onClick$`
   - `v-if` → conditional rendering
   - `v-for` → `.map()`
   - etc.

2. **Convert Vue script logic**
   - `data()` → `useSignal`
   - `computed` → `useTask$` / `useComputed$`
   - `methods` → `$` functions
   - `mounted()` → `useTask$` / `useVisibleTask$`

3. **Update i18n calls**
   - `{{ $t('key') }}` → `{t('key')}`
   - Update translation keys if needed

4. **Add proper TypeScript types**
   - Define interfaces for props
   - Add types for signals

5. **Test the component**
   - Verify functionality
   - Check translations
   - Test routing

### Migration Template Guide

See `vue-to-qwik-template.md` for detailed conversion patterns and examples.

### Example Workflow

```bash
# 1. Generate templates for all components
npm run migrate:qwik

# 2. Start with one component (e.g., AdditionCalculator)
# 3. Open src-qwik/components/AdditionCalculator.tsx
# 4. Follow the TODO comments to complete the conversion
# 5. Reference vue-to-qwik-template.md for conversion patterns
# 6. Test the component
npm run dev:qwik

# 7. Repeat for next component
```

### File Structure

After migration:
```
src-qwik/
├── components/
│   ├── AdditionCalculator.tsx    # Generated (needs manual completion)
│   ├── SubtractionCalculator.tsx # Generated (needs manual completion)
│   └── ...
└── routes/
    └── calculators/
        ├── addition-calculator/
        │   └── index.tsx         # Generated route
        ├── subtraction-calculator/
        │   └── index.tsx         # Generated route
        └── ...
```

### Tips

1. **Start with simple components**: Basic calculators are easier to migrate
2. **Use the template guide**: Reference `vue-to-qwik-template.md` for patterns
3. **Test incrementally**: Test each component after migration
4. **Compare side-by-side**: Keep Vue component open for reference
5. **Check examples**: Look at already migrated components

### Troubleshooting

**Script fails to find components:**
- Check that `src/views/calculators/` exists
- Verify component files have `.vue` extension

**Generated component has errors:**
- This is expected - the script generates templates that need manual completion
- Follow TODO comments to fix issues

**Route doesn't work:**
- Verify route path matches expected URL structure
- Check that component is properly exported
- Ensure route directory structure is correct

