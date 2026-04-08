/** Admin tab “Alive” — strona jest traktowana jako publiczna nawet gdy `published` w DB nie zostało zsynchronizowane. */
export const PUBLIC_MANUAL_BOOKMARK = 'completed-alive' as const;

export function isPublicCalculatorPage(page: {
  published: boolean;
  manualBookmark?: string | null;
}): boolean {
  if (page.published) return true;
  return (page.manualBookmark ?? '').trim() === PUBLIC_MANUAL_BOOKMARK;
}

/** Prisma `where` dla kalkulatorów widocznych publicznie (jak na stronie /calculators/...). */
export function prismaPublicCalculatorWhere() {
  return {
    OR: [{ published: true }, { manualBookmark: PUBLIC_MANUAL_BOOKMARK }],
  };
}
