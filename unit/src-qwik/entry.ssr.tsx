import { renderToStream, type RenderOptions } from '@builder.io/qwik/server';
import { manifest } from '@qwik-city-plan';
import Root from './root';

export default function (opts: RenderOptions) {
  return renderToStream(<Root />, {
    manifest,
    ...opts,
    containerAttributes: {
      lang: 'en',
      ...opts.containerAttributes,
    },
  });
}

