import { renderToStream, type RenderOptions } from '@builder.io/qwik/server';
import qwikCityPlan from '@qwik-city-plan';
import Root from './root';

export default function (opts: RenderOptions) {
  return renderToStream(<Root />, {
    manifest: qwikCityPlan, // ✅ JEDYNY POPRAWNY MANIFEST DLA SSR
    ...opts,
    containerAttributes: {
      lang: 'en',
      ...opts.containerAttributes,
    },
  } as any);
}
