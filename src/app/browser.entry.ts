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

  let navigationAbortController = new AbortController();
  const navigationAbortControllers = new WeakMap<object, AbortController>();
  services.api.setNavigationAbortSignal(navigationAbortController.signal);

  function cancelNavigation(to: object) {
    const cancelledNavigationController = navigationAbortControllers.get(to);
    cancelledNavigationController?.abort();
    navigationAbortControllers.delete(to);
    if (cancelledNavigationController === navigationAbortController) {
      navigationAbortController = new AbortController();
      services.api.setNavigationAbortSignal(navigationAbortController.signal);
    }
  }

  router.beforeEach(async (to, from) => {
    navigationAbortController.abort();
    const routeAbortController = new AbortController();
    navigationAbortController = routeAbortController;
    navigationAbortControllers.set(to, routeAbortController);
    services.api.setNavigationAbortSignal(routeAbortController.signal);

    try {
      await execRoutePreFetch(
        to,
        {
          isSsr: false,
          logger: services.logger,
          signal: routeAbortController.signal,
          useStore,
        },
        from,
      );
      return true;
    } catch (error) {
      if (routeAbortController.signal.aborted) return true;

      routeAbortController.abort();
      services.logger.error(error);
      return false;
    }
  });

  router.afterEach((to, _, failure) => {
    if (failure) cancelNavigation(to);
    navigationAbortControllers.delete(to);
  });

  // Vue Router delivers navigation errors through a callback hook.
  router.onError((error, to) => {
    cancelNavigation(to);
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
