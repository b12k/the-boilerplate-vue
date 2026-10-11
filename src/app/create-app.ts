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
import { createUseStore, initialContextKey } from './store';

interface CreateAppConfig {
  head: VueHeadClient;
  history: RouterHistory;
  initialState: InitialState;
  logger: Logger;
  ssrAbortSignal?: AbortSignal;
}

type InitialState = Record<string, StateTree> & { context: Context };

async function createApp({
  head,
  history,
  initialState,
  logger,
  ssrAbortSignal,
}: CreateAppConfig) {
  const app = createSSRApp(App);
  app.provide(initialContextKey, initialState.context);
  const pinia = createPinia();
  const useStore = createUseStore(pinia);
  const services = createServices(initialState.context, logger, ssrAbortSignal);
  const router = createRouter({
    history,
    routes,
    scrollBehavior: (_, __, savedPosition) => savedPosition ?? { top: 0 },
  });

  pinia.use(createServicesPiniaPlugin(services));

  app.use(createServicesVuePlugin(services)).use(router).use(pinia).use(head);

  pinia.state.value = initialState;

  app.config.errorHandler = (error, _, info) => {
    services.logger.error(error, info);
    throw error;
  };

  await router.push(initialState.context.url);
  await router.isReady();

  return {
    app,
    head,
    pinia,
    router,
    services,
    useStore,
  };
}

export { createApp, type InitialState };
