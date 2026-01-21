import express from 'express';
import { createQwikCity } from '@builder.io/qwik-city/middleware/node';
import qwikCityPlan from '@qwik-city-plan';
import { manifest } from '@qwik-client-manifest';
import render from './entry.ssr';
import compression from 'compression';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// ✅ FIX: entry.express.js is in dist/server/, so we go up ONE level to dist/, then to client/
const distDir = join(fileURLToPath(import.meta.url), '..', 'client');
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

// ✅ SSR-safe router with error handling
app.use((req, res, next) => {
  try {
    router(req, res, next);
  } catch (err) {
    // If headers already sent, just end the response
    if (res.headersSent) {
      res.end();
      return;
    }
    next(err);
  }
});

app.use(notFound);

// ✅ Error handler - prevent double response
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // If headers already sent, don't try to send error response
  if (res.headersSent) {
    res.end();
    return;
  }
  
  console.error('SSR Error:', err);
  res.status(500).send('Internal Server Error');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Qwik SSR Server: http://localhost:${PORT}`);
});
