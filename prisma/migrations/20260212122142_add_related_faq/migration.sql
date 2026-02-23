/*
  Warnings:

  - You are about to drop the column `faqJson` on the `PageTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `relatedJson` on the `PageTranslation` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PageTranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "relatedCalculators" TEXT,
    "faqItems" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PageTranslation_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PageTranslation" ("content", "createdAt", "description", "id", "locale", "pageId", "title", "updatedAt") SELECT "content", "createdAt", "description", "id", "locale", "pageId", "title", "updatedAt" FROM "PageTranslation";
DROP TABLE "PageTranslation";
ALTER TABLE "new_PageTranslation" RENAME TO "PageTranslation";
CREATE INDEX "PageTranslation_locale_idx" ON "PageTranslation"("locale");
CREATE UNIQUE INDEX "PageTranslation_pageId_locale_key" ON "PageTranslation"("pageId", "locale");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
