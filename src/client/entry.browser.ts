import { createHead } from '@unhead/vue/client';
import { pino } from 'pino';
import { createWebHistory } from 'vue-router';

import './styles/main.css';
import { createApp, type InitialState } from './create-app';
import { execRoutePreFetch } from './router';
import { deserialize } from './utils';

declare global {
  interface Window {
    INITIAL_STATE: string;
  }
}

(async () => {
  const initialState = deserialize<InitialState>(window.INITIAL_STATE);
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

  let alreadyNavigatingTo: string | undefined;
  router.beforeEach(async (to, from) => {
    if (alreadyNavigatingTo === to.fullPath) return false;
    alreadyNavigatingTo = to.fullPath;
    try {
      await execRoutePreFetch(to, from);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  });

  app.config.errorHandler = (error, _, info) => {
    services.logger.error(error, info);
    if (!initialState.context.isProd) {
      console.error(error);
      setTimeout(() => {
        window.dispatchEvent(
          new ErrorEvent('error', {
            error,
            message: error instanceof Error ? error.message : String(error),
          }),
        );
      });
    }
  };
})();
