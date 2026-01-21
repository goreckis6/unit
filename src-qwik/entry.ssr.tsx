import { renderToStream, type RenderOptions } from '@builder.io/qwik/server';
import { manifest } from '@qwik-client-manifest';
import Root from './root';

export default function (opts: RenderOptions) {
  return renderToStream(<Root />, {
    manifest,
    ...opts,
    // ✅ DISABLE PrefetchServiceWorker - prevents s_z6T0pxHsUHc symbol generation
    qwikPrefetchServiceWorker: {
      include: false,
    },
    containerAttributes: {
      lang: 'en',
      ...opts.containerAttributes,
    },
  });
}
