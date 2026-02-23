/**
 * Transforms calculator code for Sandpack - replaces app-specific imports with stubs.
 * Uses react-ts template so TypeScript is preserved (no stripping needed).
 */
export function transformCalculatorCodeForSandpack(code: string): string {
  let transformed = code
    .replace(/^'use client';\s*\n?/, '')
    .replace(/import\s*\{\s*useTranslations\s*\}\s*from\s*['"]next-intl['"]\s*;?/g, "import { useTranslations } from './stubs';")
    .replace(/import\s*\{\s*useScrollToResult\s*\}\s*from\s*['"]@\/hooks\/useScrollToResult['"]\s*;?/g, "import { useScrollToResult } from './stubs';")
    .replace(/import\s*\{\s*CopyButton\s*\}\s*from\s*['"]@\/components\/CopyButton['"]\s*;?/g, "import { CopyButton } from './stubs';");

  // Ensure default export for Sandpack entry (App imports "Calculator" as default)
  const defaultExportMatch = transformed.match(/export\s+function\s+(\w+)\s*\(/);
  if (defaultExportMatch && !transformed.includes('export default')) {
    const name = defaultExportMatch[1];
    transformed = transformed.replace(`export function ${name}(`, `export function ${name}(`);
    transformed = transformed.trimEnd();
    if (!transformed.endsWith(';') && !transformed.endsWith('}')) transformed += '\n';
    transformed += `\nexport default ${name};`;
  }

  return transformed;
}
