import type { Context } from '@server/services';
import type { Logger } from 'pino';
import type { AsyncReturnType } from 'type-fest';

import { createHead } from '@unhead/vue/server';
import { createMemoryHistory } from 'vue-router';
import { renderToString } from 'vue/server-renderer';

import { createApp } from './create-app';
import { execRoutePreFetch } from './router';
import { execInSsrOrAbort } from './utils';

type Render = typeof render;

type RenderResult = AsyncReturnType<Render>;

async function render(
  context: Context,
  logger: Logger,
  ssrAbortSignal: AbortSignal,
) {
  const { app, head, router, store, useStore } = await execInSsrOrAbort(
    () =>
      createApp({
        head: createHead(),
        history: createMemoryHistory(context.baseUrl),
        initialState: { context },
        logger,
        ssrAbortSignal,
      }),
    ssrAbortSignal,
  );

  await execInSsrOrAbort(
    () =>
      execRoutePreFetch(router.currentRoute.value, {
        isSsr: true,
        logger,
        signal: ssrAbortSignal,
        useStore,
      }),
    ssrAbortSignal,
  );
  const ssrContext = { modules: new Set<string>() };
  const html = await execInSsrOrAbort(
    () => renderToString(app, ssrContext),
    ssrAbortSignal,
  );
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
    modules: [...ssrContext.modules],
    state: { ...store.state.value, context: useStore('context').$state },
  };
}

export { render, type Render, type RenderResult };
