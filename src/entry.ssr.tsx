import { renderToStream } from '@builder.io/qwik/server';
import Root from './root';

export function render(opts: any) {
  return renderToStream(<Root />, {
    containerTagName: 'html',
    containerAttributes: {
      lang: 'en',
    },
    ...opts
  });
}
