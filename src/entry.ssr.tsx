import { renderToStream, type RenderOptions } from '@builder.io/qwik/server';
import Root from './root';

export default function (opts: RenderOptions) {
  return renderToStream(<Root />, {
    ...opts,
    containerAttributes: {
      lang: 'en',
      ...opts.containerAttributes,
    },
  });
}

