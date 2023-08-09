import { renderSSRHead } from '@unhead/ssr';
import { renderToString } from 'vue/server-renderer';
import { createMemoryHistory } from 'vue-router';

import { Context } from '@server';

import { createApp } from './create-app';
import { replaceLogger, Logger } from './services';
import { execRoutePreFetch } from './router';

const render = async (context: Context, logger: Logger) => {
  replaceLogger(logger);

  const history = createMemoryHistory(context.baseUrl);
  const { app, store, router, head } = await createApp(history, { context });

  await execRoutePreFetch(router.currentRoute.value, undefined, true);

  return {
    html: await renderToString(app),
    head: await renderSSRHead(head),
    state: store.state.value,
    currentRoute: router.currentRoute.value,
  };
};

export type Render = (
  context: Context,
  logger: Logger,
) => ReturnType<typeof render>;
export type RenderResult = Awaited<ReturnType<typeof render>>;
export default render;
