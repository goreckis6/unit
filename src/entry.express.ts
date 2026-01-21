import express from 'express';
import { createQwikCity } from '@builder.io/qwik-city/middleware/node';
import { render } from './entry.ssr';

const app = express();

app.use(
  '/',
  createQwikCity({
    render
  })
);

app.listen(3000, '0.0.0.0', () => {
  console.log('✅ Qwik SSR running on http://0.0.0.0:3000');
});
