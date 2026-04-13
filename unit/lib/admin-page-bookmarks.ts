/** Allowed values for `Page.manualBookmark` (admin pipeline tabs + reset to NEW). */
export const ADMIN_MANUAL_BOOKMARK_VALUES = [
  'new',
  'content-en-done',
  'translation-done',
  'calculator-done',
  'done',
  'completed-alive',
] as const;

export type AdminManualBookmarkValue = (typeof ADMIN_MANUAL_BOOKMARK_VALUES)[number];

export function isValidAdminManualBookmark(v: unknown): v is AdminManualBookmarkValue {
  return typeof v === 'string' && (ADMIN_MANUAL_BOOKMARK_VALUES as readonly string[]).includes(v.trim());
}
