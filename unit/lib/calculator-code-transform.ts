/**
 * Transforms calculator code for Sandpack - replaces app-specific imports with stubs.
 * Uses react-ts template so TypeScript is preserved (no stripping needed).
 * Handles various import formats (LLM output, different quote styles, default vs named).
 */
export function transformCalculatorCodeForSandpack(code: string): string {
  let transformed = code.replace(/^['"]use client['"]\s*;\s*\n?/, '');

  // useTranslations - named or default from next-intl
  transformed = transformed
    .replace(/import\s*\{\s*useTranslations\s*\}\s*from\s*['"]next-intl['"]\s*;?\s*/g, "import { useTranslations } from './stubs';\n")
    .replace(/import\s+useTranslations\s+from\s*['"]next-intl['"]\s*;?\s*/g, "import { useTranslations } from './stubs';\n");

  // useScrollToResult - @/hooks or any path
  transformed = transformed
    .replace(/import\s*\{\s*useScrollToResult\s*\}\s*from\s*['"`][^'"`]*useScrollToResult[^'"`]*['"`]\s*;?\s*/g, "import { useScrollToResult } from './stubs';\n")
    .replace(/import\s+useScrollToResult\s+from\s*['"`][^'"`]+['"`]\s*;?\s*/g, "import { useScrollToResult } from './stubs';\n");

  // CopyButton - @/components/CopyButton or any path containing CopyButton
  transformed = transformed
    .replace(/import\s*\{\s*CopyButton\s*\}\s*from\s*['"`][^'"`]*CopyButton[^'"`]*['"`]\s*;?\s*/g, "import { CopyButton } from './stubs';\n")
    .replace(/import\s+CopyButton\s+from\s*['"`][^'"`]*CopyButton[^'"`]*['"`]\s*;?\s*/g, "import { CopyButton } from './stubs';\n");

  // Ensure default export for Sandpack entry (App imports "Calculator" as default)
  const defaultExportMatch = transformed.match(/export\s+function\s+(\w+)\s*\(/);
  if (defaultExportMatch && !transformed.includes('export default')) {
    const name = defaultExportMatch[1];
    transformed = transformed.trimEnd();
    if (!transformed.endsWith(';') && !transformed.endsWith('}')) transformed += '\n';
    transformed += `\nexport default ${name};\n`;
  }

  return transformed;
}
