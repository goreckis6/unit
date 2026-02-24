import path from 'path';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Dev: file:./prisma/dev.db | Prod: file:/var/www/db-calculino/dev.db (set by deploy)
// Use absolute path so the adapter never receives undefined or wrong cwd
let dbUrl: string =
  process.env.DATABASE_URL ??
  (process.env.NODE_ENV === 'production'
    ? (() => {
        throw new Error('DATABASE_URL is required in production. Configure it in .env on the server.');
      })()
    : 'file:./prisma/dev.db');

// Resolve relative file: paths to absolute (adapter can receive undefined url with relative paths)
if (typeof dbUrl === 'string' && dbUrl.startsWith('file:') && dbUrl !== 'file::memory:') {
  const afterFile = dbUrl.slice(5).replace(/^\.\//, '');
  if (afterFile && !path.isAbsolute(afterFile)) {
    dbUrl = `file:${path.resolve(process.cwd(), afterFile)}`;
  }
}

const adapter = new PrismaBetterSqlite3({ url: dbUrl });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
