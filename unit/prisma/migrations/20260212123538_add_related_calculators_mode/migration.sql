-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "calculatorCode" TEXT,
    "linkedCalculatorPath" TEXT,
    "relatedCalculatorsMode" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Page" ("calculatorCode", "category", "createdAt", "id", "linkedCalculatorPath", "published", "slug", "updatedAt") SELECT "calculatorCode", "category", "createdAt", "id", "linkedCalculatorPath", "published", "slug", "updatedAt" FROM "Page";
DROP TABLE "Page";
ALTER TABLE "new_Page" RENAME TO "Page";
CREATE UNIQUE INDEX "Page_category_slug_key" ON "Page"("category", "slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
