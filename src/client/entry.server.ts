import type { Context } from '@server';
import type { Logger } from 'pino';

import { createHead } from '@unhead/vue/server';
import { createMemoryHistory } from 'vue-router';
import { renderToString } from 'vue/server-renderer';

import { createApp } from './create-app';
import { execRoutePreFetch } from './router';
import { useContextStore } from './store';

type Render = typeof render;

type RenderResult = Awaited<ReturnType<Render>>;

async function render(context: Context, logger: Logger) {
  const { app, head, router, store } = await createApp({
    head: createHead(),
    history: createMemoryHistory(context.baseUrl),
    initialState: { context },
    logger,
  });

  await execRoutePreFetch(router.currentRoute.value, undefined, true);

  return {
    currentRoute: {
      meta: router.currentRoute.value.meta,
      name:
        router.currentRoute.value.name?.toString() ??
        router.currentRoute.value.path,
      path: router.currentRoute.value.path,
    },
    head: head.render(),
    html: await renderToString(app),
    state: { ...store.state.value, context: useContextStore(store).$state },
  };
}

export { render, type Render, type RenderResult };
