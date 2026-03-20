-- CreateTable
CREATE TABLE "AdminSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "ollamaApiKey" TEXT,
    "anthropicApiKey" TEXT,
    "updatedAt" DATETIME NOT NULL
);
