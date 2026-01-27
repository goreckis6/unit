import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const withNextIntl = createNextIntlPlugin({
  requestConfig: './i18n/request.ts'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  outputFileTracingIncludes: {
    '/': ['i18n/**/*'],
  },
};

export default withNextIntl(withMDX(nextConfig));
