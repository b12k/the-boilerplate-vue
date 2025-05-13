import type { Context } from '@server';
import type { Logger } from 'pino';

import { createHead, renderSSRHead } from '@unhead/vue/server';
import { createMemoryHistory } from 'vue-router';
import { renderToString } from 'vue/server-renderer';

import { createApp } from './create-app';
import { execRoutePreFetch } from './router';

const render = async (context: Context, logger: Logger) => {
  const { app, head, router, store } = await createApp({
    head: createHead(),
    history: createMemoryHistory(context.baseUrl),
    initialState: { context },
    logger,
  });

  await execRoutePreFetch(router.currentRoute.value, undefined, true);

  return {
    currentRoute: router.currentRoute.value,
    head: await renderSSRHead(head),
    html: await renderToString(app),
    state: store.state.value,
  };
};

export type Render = (
  context: Context,
  logger: Logger,
) => ReturnType<typeof render>;
export type RenderResult = Awaited<ReturnType<typeof render>>;
export default render;
