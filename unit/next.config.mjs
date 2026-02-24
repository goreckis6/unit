import path from 'path';
import { fileURLToPath } from 'url';
import createNextIntlPlugin from 'next-intl/plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    'better-sqlite3',
    '@prisma/adapter-better-sqlite3',
    'bindings',
    '@formatjs/icu-messageformat-parser',
    '@formatjs/icu-messageformat',
  ],
  experimental: {
    webpackMemoryOptimizations: false, // avoids __webpack_modules__[moduleId] errors
  },
  outputFileTracingRoot: __dirname,
  outputFileTracingIncludes: {
    '/*': [
      'node_modules/better-sqlite3/**/*',
      'node_modules/@prisma/adapter-better-sqlite3/**/*',
      'node_modules/.pnpm/**/node_modules/better-sqlite3/**/*',
    ],
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  webpack: (config, { isServer }) => {
    config.resolve.alias = { ...config.resolve.alias, '@': path.resolve(__dirname) };
    return config;
  },
};

export default withNextIntl(nextConfig);
