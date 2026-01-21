# UnitConverterHub.com

A modern, fast unit converter website built with Qwik and Server-Side Rendering (SSR).

## Features

- ⚡ **Fast & Efficient** - Built with Qwik for optimal performance
- 🔄 **SSR** - Server-Side Rendering for better SEO and initial load
- 📱 **Responsive** - Works on all devices
- 🎨 **Modern UI** - Clean and intuitive interface
- 🔢 **Multiple Converters**:
  - Length (meters, feet, inches, km, miles, etc.)
  - Weight (kg, pounds, ounces, grams, etc.)
  - Temperature (Celsius, Fahrenheit, Kelvin, Rankine)
  - Volume (liters, gallons, cups, etc.)

## Tech Stack

- [Qwik](https://qwik.builder.io/) - The HTML-first framework
- [Qwik City](https://qwik.builder.io/docs/qwikcity/) - Full-stack framework
- [Express](https://expressjs.com/) - Web server
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Docker

Build and run with Docker:

```bash
docker build -t unitconverterhub .
docker run -p 3000:3000 unitconverterhub
```

### GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:
- Builds the application
- Creates a Docker image
- Ready for deployment to your hosting provider

Configure your deployment steps in the workflow file.

## Project Structure

```
src/
  ├── components/       # Reusable components
  │   ├── layout.tsx    # Main layout with navigation
  │   └── converter-base.tsx  # Base converter component
  ├── routes/          # Page routes
  │   ├── index.tsx    # Home page
  │   ├── length/      # Length converter
  │   ├── weight/      # Weight converter
  │   ├── temperature/ # Temperature converter
  │   ├── volume/      # Volume converter
  │   └── 404.tsx      # 404 error page
  ├── entry.express.ts # Express server entry
  ├── entry.ssr.tsx    # SSR render function
  ├── root.tsx         # Root component
  └── global.css       # Global styles
```

## License

MIT
