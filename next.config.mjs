import path from 'path';
import { fileURLToPath } from 'url';
import createNextIntlPlugin from 'next-intl/plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin(path.resolve(__dirname, 'i18n', 'request.ts'));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['next-intl'],
  serverExternalPackages: [
    'better-sqlite3',
    '@prisma/adapter-better-sqlite3',
    'bindings',
  ],
  // webpackMemoryOptimizations disabled - can cause __webpack_modules__[moduleId] errors
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
