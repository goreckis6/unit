# Unit Converter Hub

A modern, multilingual calculator website built with Vue.js 3, featuring various unit converters and calculators.

## Features

- 🎨 Modern, responsive design
- 🌍 Internationalization (i18n) support (English, Polish)
- 🧮 Subtracting Fractions Calculator
- ⚡ Fast and lightweight
- 📱 Mobile-friendly

## Tech Stack

- Vue.js 3
- Vue Router
- Vue I18n
- Vite

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
unit/
├── src/
│   ├── components/      # Reusable components
│   │   └── Navbar.vue
│   ├── views/          # Page components
│   │   ├── Home.vue
│   │   └── calculators/
│   │       └── SubtractingFractions.vue
│   ├── locales/        # Translation files
│   │   ├── en.json
│   │   └── pl.json
│   ├── router/         # Vue Router configuration
│   │   └── index.js
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── index.html
├── package.json
└── vite.config.js
```

## Adding New Calculators

1. Create a new component in `src/views/calculators/`
2. Add the route in `src/router/index.js`
3. Add translations in `src/locales/en.json` and `src/locales/pl.json`
4. Add a card on the homepage in `src/views/Home.vue`

## Adding New Languages

1. Create a new JSON file in `src/locales/` (e.g., `de.json`)
2. Copy the structure from `en.json` and translate
3. Import and add to the i18n configuration in `src/main.js`
4. Add language option to the language selector in `Navbar.vue`

## License

MIT

