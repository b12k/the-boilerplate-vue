import { createHead } from '@unhead/vue/client';
import { pino } from 'pino';
import { createWebHistory } from 'vue-router';

import type { InitialState } from './create-app';

import { createApp } from './create-app';
import { execRoutePreFetch } from './router';
import './styles/main.css';

declare global {
  var INITIAL_STATE: InitialState;
}

async function startClient() {
  const initialState = globalThis.INITIAL_STATE;
  const history = createWebHistory(initialState.context.baseUrl);
  const logger = pino({ browser: { asObject: true } });
  const head = createHead();
  const { app, router, services, useStore } = await createApp({
    head,
    history,
    initialState,
    logger,
  });

  app.mount('#app');

  let prefetchController = new AbortController();
  const prefetchControllers = new WeakMap<object, AbortController>();

  router.beforeEach(async (to, from) => {
    prefetchController.abort();
    const controller = new AbortController();
    prefetchController = controller;
    prefetchControllers.set(to, controller);

    try {
      await execRoutePreFetch(
        to,
        {
          isSsr: false,
          logger: services.logger,
          signal: controller.signal,
          useStore,
        },
        from,
      );
      return true;
    } catch (error) {
      if (controller.signal.aborted) return true;

      controller.abort();
      services.logger.error(error);
      return false;
    }
  });

  router.afterEach((to, _, failure) => {
    if (failure) prefetchControllers.get(to)?.abort();
    prefetchControllers.delete(to);
  });

  // Vue Router delivers navigation errors through a callback hook.
  // oxlint-disable-next-line promise/prefer-await-to-callbacks
  router.onError((error, to) => {
    prefetchControllers.get(to)?.abort();
    prefetchControllers.delete(to);
    services.logger.error(error);
  });

  app.config.errorHandler = (error, _, info) => {
    services.logger.error(error, info);
    if (initialState.context.isProd) return;

    setTimeout(
      () =>
        dispatchEvent(
          new ErrorEvent('error', {
            error,
            message: Error.isError(error) ? error.message : String(error),
          }),
        ),
      0,
    );
  };
}

try {
  await startClient();
} catch (error) {
  dispatchEvent(new ErrorEvent('error', { error }));
}
