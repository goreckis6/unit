/**
 * Optional “anchor” checks for admin “Check translations”: terms from EN that
 * often stay in localized copy (numbers, units, slug tokens, acronyms).
 * Script locales (zh, ja, …) only use digit/acronym anchors to limit false positives.
 */

const SCRIPT_GATED_LOCALES = new Set(['zh', 'ja', 'ko', 'ar', 'fa', 'hi', 'th', 'ru']);

export function localeUsesScriptGate(locale: string): boolean {
  return SCRIPT_GATED_LOCALES.has(locale);
}

function isDigitOrUnitAnchor(a: string): boolean {
  return /\d/.test(a) || /^[A-Z]{2,8}$/.test(a);
}

/** Split slug into lowercase tokens (hyphens). */
function slugTokens(slug: string): string[] {
  return slug
    .toLowerCase()
    .split(/-+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 3);
}

/**
 * Collect reference strings from English (and slug) to look for in translations.
 */
export function extractEnReferenceAnchors(
  slug: string,
  enTitle: string,
  enDescription: string,
  enContent: string
): string[] {
  const anchors = new Set<string>();
  for (const t of slugTokens(slug)) {
    anchors.add(t);
  }

  const blob = `${enTitle ?? ''}\n${enDescription ?? ''}\n${(enContent ?? '').slice(0, 2800)}`;
  const blobLower = blob.toLowerCase();
  // Numbers with optional common unit suffixes (often kept across locales)
  for (const m of blobLower.match(/\b\d+(?:[.,]\d+)?(?:\s*(?:%|kwh?|mwh?|kw|mw|v|a|w|ma|hz|mhz|ghz|ohm|db|nm|mm|cm|m|km|kg|g|lb|ft|in))\b/gi) ?? []) {
    const s = m.replace(/\s+/g, '').toLowerCase();
    if (s.length >= 2) anchors.add(s);
  }
  // Standalone digit groups (years, counts)
  for (const m of blobLower.match(/\b\d{3,5}\b/g) ?? []) {
    anchors.add(m);
  }
  // Acronyms (ASCII caps in original text) — often preserved (DNA, LED, USB…)
  for (const m of blob.match(/\b[A-Z]{2,8}\b/g) ?? []) {
    anchors.add(m);
  }

  return [...anchors].slice(0, 36);
}

/** For CJK / Arabic / Cyrillic pages, only check anchors unlikely to be “fully translated away”. */
export function filterAnchorsForLocale(anchors: string[], locale: string): string[] {
  if (!localeUsesScriptGate(locale)) return anchors;
  return anchors.filter((a) => isDigitOrUnitAnchor(a));
}

function haystack(title: string, desc: string, content: string | null | undefined): string {
  return `${title ?? ''}\n${desc ?? ''}\n${content ?? ''}`.toLowerCase();
}

export type TranslationAnchorWarning = {
  locale: string;
  /** Anchors that were required for this locale but not found in target text */
  missingStrict: string[];
  /** Soft anchors: slug / long tokens — share that was not met */
  missingSoft: string[];
  anchorsCheckedStrict: string[];
  anchorsCheckedSoft: string[];
};

/**
 * After basic “has content” checks, verify that important EN anchors appear in the target locale.
 * Returns one entry per locale that has non-empty content but fails anchor rules.
 */
export function getTranslationAnchorWarnings(page: {
  slug: string;
  translations: Array<{
    locale: string;
    title?: string;
    displayTitle?: string | null;
    description?: string | null;
    content?: string | null;
  }>;
}): TranslationAnchorWarning[] {
  const en = page.translations.find((t) => t.locale === 'en');
  const enContent = (en?.content ?? '').trim();
  if (!enContent) return [];

  const enTitle = (en?.title ?? '').trim();
  const enDesc = (en?.description ?? '').trim();
  const allAnchors = extractEnReferenceAnchors(page.slug, enTitle, enDesc, enContent);

  const warnings: TranslationAnchorWarning[] = [];

  for (const t of page.translations) {
    if (t.locale === 'en') continue;
    const content = (t.content ?? '').trim();
    if (!content) continue;

    const locAnchors = filterAnchorsForLocale(allAnchors, t.locale);
    if (locAnchors.length === 0) continue;

    const hay = haystack(
      (t.title ?? '').trim(),
      (t.displayTitle ?? t.title ?? '').trim(),
      (t.description ?? '').trim() + '\n' + content
    );

    const strict: string[] = [];
    const soft: string[] = [];
    for (const a of locAnchors) {
      if (isDigitOrUnitAnchor(a)) strict.push(a);
      else soft.push(a);
    }

    const missingStrict = strict.filter((a) => !hay.includes(a.toLowerCase()));
    const missingSoft = soft.filter((a) => !hay.includes(a.toLowerCase()));

    const needSoft = soft.length;
    const maxSoftMissing =
      needSoft === 0 ? 0 : Math.floor(needSoft / 2); // require > half of soft anchors present

    const softFail = missingSoft.length > maxSoftMissing;
    const strictFail = missingStrict.length > 0;

    if (strictFail || softFail) {
      warnings.push({
        locale: t.locale,
        missingStrict,
        missingSoft: softFail ? missingSoft : [],
        anchorsCheckedStrict: strict,
        anchorsCheckedSoft: soft,
      });
    }
  }

  return warnings;
}
