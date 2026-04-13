import path from 'path';
import { fileURLToPath } from 'url';
import createNextIntlPlugin from 'next-intl/plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/:hash([a-f0-9]{64}).txt', destination: '/api/txt/:hash' },
      { source: '/sitemap:number(\\d+).xml', destination: '/api/sitemap-chunk/:number' },
    ];
  },
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
    /** Server Actions + large admin payloads; reverse proxy may still need client_max_body_size (e.g. nginx). */
    serverActions: { bodySizeLimit: '12mb' },
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
    const root = path.resolve(__dirname);
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': root,
      // One physical copy — avoids "react" / "react-dom" version string mismatch when deps pull different builds
      react: path.join(root, 'node_modules/react'),
      'react-dom': path.join(root, 'node_modules/react-dom'),
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
