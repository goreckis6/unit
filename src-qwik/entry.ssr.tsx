import { renderToStream, type RenderOptions } from '@builder.io/qwik/server';
import qwikCityPlan from '@qwik-city-plan';
import Root from './root';

export default function (opts: RenderOptions) {
  return renderToStream(<Root />, {
    manifest: qwikCityPlan, // ⭐ KLUCZOWE - SSR musi mieć manifest z @qwik-city-plan
    ...opts,
    containerAttributes: {
      lang: 'en',
      ...opts.containerAttributes,
    },
  });
}
