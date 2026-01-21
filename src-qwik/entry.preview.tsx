import { createQwikCity } from '@builder.io/qwik-city/middleware/node';
import qwikCityPlan from '@qwik-city-plan';
import render from './entry.ssr';

/**
 * The default export is the QwikCity adapter used for production previews.
 */
export default createQwikCity({ render, qwikCityPlan });
