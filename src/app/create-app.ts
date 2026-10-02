import type { Context } from '@server/services';
import type { VueHeadClient } from '@unhead/vue';
import type { StateTree } from 'pinia';
import type { Logger } from 'pino';
import type { RouterHistory } from 'vue-router';

import { createPinia } from 'pinia';
import { createSSRApp } from 'vue';
import { createRouter } from 'vue-router';

import App from './app.vue';
import { routes } from './router';
import {
  createServices,
  createServicesPiniaPlugin,
  createServicesVuePlugin,
} from './services';
import { initialContextKey } from './store';

interface CreateAppConfig {
  head: VueHeadClient;
  history: RouterHistory;
  initialState: InitialState;
  logger: Logger;
}

type InitialState = Record<string, StateTree> & { context: Context };

async function createApp({
  head,
  history,
  initialState,
  logger,
}: CreateAppConfig) {
  const app = createSSRApp(App);
  app.provide(initialContextKey, initialState.context);
  const store = createPinia();
  const services = createServices(initialState.context, logger);
  const router = createRouter({
    history,
    routes,
  });

  store.use(createServicesPiniaPlugin(services));

  app.use(createServicesVuePlugin(services)).use(router).use(store).use(head);

  store.state.value = initialState;

  app.config.errorHandler = (error, _, info) => {
    services.logger.error(error, info);
    throw error;
  };

  await router.push(initialState.context.url);
  await router.isReady();

  return {
    app,
    head,
    router,
    services,
    store,
  };
}

export { createApp, type InitialState };
