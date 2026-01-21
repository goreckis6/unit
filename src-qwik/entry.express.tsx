import express from 'express';
import { createQwikCity } from '@builder.io/qwik-city/middleware/node';
import qwikCityPlan from '@qwik-city-plan';
import { manifest } from '@qwik-client-manifest';
import render from './entry.ssr';
import compression from 'compression';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const distDir = join(fileURLToPath(import.meta.url), '..', '..', 'client');
const buildDir = join(distDir, 'build');

const { router, notFound } = createQwikCity({
  render,
  qwikCityPlan,
  manifest,
});

const app = express();

app.use(compression());
app.use(`/build`, express.static(buildDir, { immutable: true, maxAge: '1y' }));
app.use(express.static(distDir, { redirect: false }));

app.use(router);
app.use(notFound);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Qwik SSR Server: http://localhost:${PORT}`);
});
