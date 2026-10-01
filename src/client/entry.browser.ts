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
  const { app, router, services } = await createApp({
    head,
    history,
    initialState,
    logger,
  });

  app.mount('#app');

  let alreadyNavigatingTo = router.currentRoute.value.fullPath;
  router.beforeEach(async (to, from) => {
    if (alreadyNavigatingTo === to.fullPath) return false;
    alreadyNavigatingTo = to.fullPath;
    try {
      await execRoutePreFetch(to, from);
      return true;
    } catch (error) {
      services.logger.error(error);
      return false;
    }
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
