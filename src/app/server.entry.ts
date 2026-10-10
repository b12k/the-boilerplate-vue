import type { Context } from '@server/services';
import type { Logger } from 'pino';
import type { AsyncReturnType } from 'type-fest';

import { checkIsRedirectResponseCode } from '@server/utils/check-is-redirect-response-code';
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

  const currentRoute = router.currentRoute.value;
  const responseCode = currentRoute.redirectedFrom
    ? (currentRoute.redirectedFrom.meta.responseCode ?? 302)
    : currentRoute.meta.responseCode;
  const routeResponse = {
    meta: { ...currentRoute.meta, responseCode },
    name: currentRoute.name?.toString() ?? currentRoute.path,
    path: currentRoute.path,
  };
  const ssrContext = { modules: new Set<string>() };
  let html = '';

  if (checkIsRedirectResponseCode(responseCode)) {
    routeResponse.path = router.resolve(currentRoute.fullPath).href;
  } else {
    await execInSsrOrAbort(
      () =>
        execRoutePreFetch(currentRoute, {
          isSsr: true,
          logger,
          signal: ssrAbortSignal,
          useStore,
        }),
      ssrAbortSignal,
    );
    html = await execInSsrOrAbort(
      () => renderToString(app, ssrContext),
      ssrAbortSignal,
    );
  }
  return {
    currentRoute: routeResponse,
    head: head.render(),
    html,
    modules: [...ssrContext.modules],
    state: { ...store.state.value, context: useStore('context').$state },
  };
}

export { render, type Render, type RenderResult };
