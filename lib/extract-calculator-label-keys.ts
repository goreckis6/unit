/**
 * Extracts translation keys from calculator code.
 * Looks for patterns like t('key') or t("key") — the convention used with useTranslations.
 * Returns unique keys sorted alphabetically for the Calculator labels section.
 */
export function extractCalculatorLabelKeys(code: string): string[] {
  if (!code || typeof code !== 'string') return [];

  // Match t('key'), t("key"), t(`key`) — variable name "t" is the convention from useTranslations
  const regex = /\bt\s*\(\s*['"`]([a-zA-Z][a-zA-Z0-9_]*)['"`]\s*\)/g;
  const keys = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = regex.exec(code)) !== null) {
    keys.add(match[1]);
  }

  return [...keys].sort();
}
