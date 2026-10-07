import type { Context } from '@server/services';
import type { Logger } from 'pino';
import type { AsyncReturnType } from 'type-fest';

import { createHead } from '@unhead/vue/server';
import { createMemoryHistory } from 'vue-router';
import { renderToString } from 'vue/server-renderer';

import { createApp } from './create-app';
import { execRoutePreFetch } from './router';

type Render = typeof render;

type RenderResult = AsyncReturnType<Render>;

async function render(context: Context, logger: Logger) {
  const { app, head, router, store, useStore } = await createApp({
    head: createHead(),
    history: createMemoryHistory(context.baseUrl),
    initialState: { context },
    logger,
  });

  await execRoutePreFetch(router.currentRoute.value, {
    isSsr: true,
    logger,
    useStore,
  });
  const html = await renderToString(app);
  return {
    currentRoute: {
      meta: router.currentRoute.value.meta,
      name:
        router.currentRoute.value.name?.toString() ??
        router.currentRoute.value.path,
      path: router.currentRoute.value.path,
    },
    head: head.render(),
    html,
    state: { ...store.state.value, context: useStore('context').$state },
  };
}

export { render, type Render, type RenderResult };
