# Szablon dla Nowych Stron Kalkulatorów

## Globalne Style CSS

Wszystkie nowe strony kalkulatorów automatycznie otrzymują zoptymalizowane style dzięki globalnym regułom CSS w `src/style.css`.

### Automatycznie dostępne klasy:

#### Nagłówek strony:
1. **`.calculator-header`** - Kontener nagłówka strony (centrowany, z paddingami)
2. **`.page-title`** - Główny tytuł strony (h1) - automatycznie responsywny
3. **`.page-description`** - Opis strony - automatycznie responsywny
4. **`.title-badge`** - Badge kategorii nad tytułem - automatycznie responsywny

#### Kontener i karta:
5. **`.calculator-container`** - Kontener główny kalkulatora (max-width: 1100px)
6. **`.calculator-card`** - Karta kalkulatora z tłem i cieniami

#### Inputy i formularze:
7. **`.input-section`** - Sekcja z inputami
8. **`.inputs-grid`** - Grid dla inputów (2 kolumny na desktop, 1 na mobile)
9. **`.input-card`** - Karta pojedynczego inputa
10. **`.input-label`** - Label dla inputa
11. **`.input-with-unit`** - Kontener dla inputa + select jednostki
12. **`.number-input`** - Pole input liczby (automatycznie responsywne)
13. **`.unit-select`** - Select jednostki (automatycznie responsywny)

#### Wyniki:
14. **`.result-section`** - Sekcja z wynikami
15. **`.result-header`** - Nagłówek sekcji wyników
16. **`.result-badge`** - Badge dla wyników
17. **`.result-display`** - Grid dla wyników (2 kolumny na desktop, 1 na mobile)
18. **`.result-item`** - Pojedynczy element wyniku
19. **`.result-label`** - Label wyniku
20. **`.result-value-box`** - Kontener dla wartości i jednostki
21. **`.result-value`** - Wartość wyniku
22. **`.result-unit`** - Jednostka wyniku

#### Informacje:
23. **`.info-section`** - Sekcja z dodatkowymi informacjami
24. **`.info-card`** - Karta z informacjami
25. **`.info-item`** - Pojedynczy element informacji
26. **`.info-label`** - Label informacji
27. **`.info-value`** - Wartość informacji

#### Przyciski:
28. **`.action-buttons`** - Kontener dla przycisków akcji

### Responsywne Breakpointy (automatyczne):

- **Desktop (≥1200px):** `3.5rem` - optymalizacje dla dużych ekranów
- **Desktop (domyślnie):** `3.5rem`
- **Tablet (1024px):** `2.75rem` - letter-spacing: -1.5px
- **Mobile (768px):** `2.25rem` - letter-spacing: -1px, line-height: 1.15
- **Małe Mobile (480px):** `1.875rem` - letter-spacing: -0.5px, line-height: 1.2
- **Bardzo małe (360px):** `1.75rem` - letter-spacing: -0.5px

### Hamburger Menu

Hamburger menu jest już zaimplementowane w komponencie `Navbar.vue` i automatycznie pojawia się na ekranach ≤1024px. Zawiera:
- Linki nawigacyjne (Home, Math Calculators, Electrical Calculator)
- Pełny selektor języków (16 języków)
- Animacje i overlay

## Przykładowy Szablon

```vue
<template>
  <div class="calculator-page">
    <Navbar />
    
    <div class="container">
      <div class="calculator-header">
        <router-link :to="$i18n.locale === 'en' ? '/' : `/${$i18n.locale}/`" class="back-button">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2.5"/>
          </svg>
          <span>{{ $t('common.back') }}</span>
        </router-link>
        <div class="header-content">
          <div class="title-badge">{{ $t('calculators.yourCalculator.badge') }}</div>
          <h1 class="page-title">{{ $t('calculators.yourCalculator.title') }}</h1>
          <p class="page-description">{{ $t('calculators.yourCalculator.description') }}</p>
        </div>
      </div>

      <div class="calculator-container">
        <!-- Twój kod kalkulatora tutaj -->
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue'

export default {
  name: 'YourCalculator',
  components: {
    Navbar
  },
  // ... reszta logiki
}
</script>

<style scoped>
/* Lokalne style specyficzne dla tego kalkulatora */
/* Globalne style dla .page-title, .page-description itp. są już dostępne */
</style>
```

## Najlepsze Praktyki dla Inputów i Formularzy

### Responsywne Pola Input na Mobile/Tablet

**Wszystkie style są już globalne!** Nie musisz dodawać CSS - wystarczy użyć klas:

```vue
<div class="input-card">
  <label class="input-label">Voltage</label>
  <div class="input-with-unit">
    <input
      v-model.number="value"
      type="number"
      class="number-input"
      placeholder="Enter value"
    />
    <select v-model="unit" class="unit-select">
      <option value="V">V</option>
      <option value="mV">mV</option>
    </select>
  </div>
</div>
```

**Automatyczne zachowanie:**
- **Desktop**: Input i select obok siebie, select ma max-width: 180px
- **Tablet (≤1024px)**: Input i select w kolumnie, oba na pełną szerokość
- **Mobile (≤768px)**: Zmniejszone fonty i paddingi
- **Małe mobile (≤480px)**: Jeszcze mniejsze fonty i paddingi

**Nie musisz dodawać żadnych stylów CSS** - wszystko jest już globalne!

## Uwagi

### Co jest już globalne (NIE DODAWAJ tych stylów):
- ✅ `.page-title`, `.page-description`, `.calculator-header`, `.title-badge`
- ✅ `.calculator-container`, `.calculator-card`
- ✅ `.input-section`, `.inputs-grid`, `.input-card`, `.input-label`
- ✅ `.input-with-unit`, `.number-input`, `.unit-select`
- ✅ `.result-section`, `.result-display`, `.result-item`, `.result-value`, `.result-unit`
- ✅ `.info-section`, `.info-card`, `.info-item`, `.info-label`, `.info-value`
- ✅ `.action-buttons`
- ✅ Wszystkie breakpointy responsywne (360px, 480px, 768px, 1024px, 1200px+)

### Co możesz zrobić:
- **Możesz** nadpisać globalne style w lokalnym `<style scoped>` jeśli potrzebujesz specjalnych zmian
- **Możesz** dodać dodatkowe klasy specyficzne dla danego kalkulatora
- Wszystkie breakpointy są automatycznie obsługiwane
- Style są responsywne i zoptymalizowane dla wszystkich urządzeń
- **Na mobile/tablet**: Pola input i select automatycznie mają `width: 100%` - nie musisz tego dodawać!
- **Na desktop**: Inputy i selecty są automatycznie zoptymalizowane

## Przykład nadpisania (jeśli potrzebne)

```css
<style scoped>
/* Nadpisanie tylko dla tego kalkulatora */
.page-title {
  font-size: 4rem; /* Większy tytuł tylko tutaj */
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem; /* Większy na mobile */
  }
}
</style>
```

## Optymalizacje dla Desktop (≥1200px)

**Już zaimplementowane globalnie!** Wszystkie optymalizacje dla desktop są już w `style.css`:
- Większe fonty dla inputów (1.625rem) i wyników (2.25rem)
- Większe paddingi (3.5rem dla calculator-card)
- Większe odstępy w gridach (2.5rem)
- Max-width: 1200px dla kontenera

**Nie musisz dodawać tych stylów** - są już globalne! Jeśli potrzebujesz specjalnych zmian, możesz nadpisać w lokalnych stylach.

## Struktura Grid dla Inputów

**Już zaimplementowane globalnie!** Klasa `.inputs-grid` automatycznie:
- **Desktop**: 2 kolumny (`repeat(2, 1fr)`) z gap: 2rem
- **Tablet/Mobile (≤1024px)**: 1 kolumna (`1fr`) z gap: 1.5rem

**Użyj po prostu:**
```vue
<div class="inputs-grid">
  <div class="input-card">
    <label class="input-label">Label 1</label>
    <div class="input-with-unit">
      <input class="number-input" />
      <select class="unit-select">...</select>
    </div>
  </div>
  <div class="input-card">
    <label class="input-label">Label 2</label>
    <div class="input-with-unit">
      <input class="number-input" />
      <select class="unit-select">...</select>
    </div>
  </div>
</div>
```

**Nie musisz dodawać CSS** - wszystko działa automatycznie!

## Checklist dla Nowej Strony

- [x] Użyj klas `.page-title`, `.page-description`, `.calculator-header` (już globalne)
- [ ] Dodaj `.title-badge` jeśli potrzebny (już globalny)
- [x] Użyj `.inputs-grid` dla grid z inputami (już globalny, automatycznie responsywny)
- [x] Użyj `.input-with-unit` dla inputów z jednostkami (już globalny, automatycznie responsywny)
- [x] Użyj `.number-input` i `.unit-select` (już globalne, automatycznie responsywne)
- [x] Użyj `.result-display` dla wyników (już globalny, automatycznie responsywny)
- [x] Inputy automatycznie mają `width: 100%` na mobile/tablet (już globalne)
- [x] Wszystkie breakpointy są automatycznie obsługiwane (360px, 480px, 768px, 1024px, 1200px+)
- [x] Hamburger menu działa automatycznie na tablet/mobile (≤1024px)
- [x] Wszystkie pola mają jednakową szerokość na mobile/tablet (już globalne)

**Wszystko jest już zaimplementowane globalnie!** Po prostu używaj klas HTML - nie musisz dodawać CSS.


