# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:5173`

## Troubleshooting

### Blank Page Issue

If you see a blank page, check:

1. **Browser Console** - Open Developer Tools (F12) and check for errors
2. **Terminal** - Check if there are any errors in the terminal where you ran `npm run dev`
3. **Dependencies** - Make sure you ran `npm install` first

### Common Issues

- **Module not found**: Run `npm install` again
- **Port already in use**: Change the port in `vite.config.js` or kill the process using port 5173
- **Blank page**: Check browser console for JavaScript errors

## Project Structure

- `src/views/Home.vue` - Main homepage
- `src/views/calculators/SubtractingFractions.vue` - Calculator page
- `src/components/Navbar.vue` - Navigation component
- `src/locales/` - Translation files (en.json, pl.json)

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

