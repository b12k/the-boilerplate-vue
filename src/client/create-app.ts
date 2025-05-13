import type { Context } from '@server';
import type { VueHeadClient } from '@unhead/vue';
import type { Logger } from 'pino';

import { createPinia, type StateTree } from 'pinia';
import { createSSRApp } from 'vue';
import { createRouter, type RouterHistory } from 'vue-router';

import App from './app.vue';
import { routes } from './router';
import {
  createServices,
  createServicesPiniaPlugin,
  createServicesVuePlugin,
} from './services';

export type CreateAppConfig = {
  head: VueHeadClient;
  history: RouterHistory;
  initialState: InitialState;
  logger: Logger;
};
export type InitialState = StateTree & { context: Context };

export const createApp = async ({
  head,
  history,
  initialState,
  logger,
}: CreateAppConfig) => {
  const app = createSSRApp(App);
  const store = createPinia();
  const services = createServices(initialState.context, logger);
  const router = createRouter({
    history,
    routes,
  });

  store.use(createServicesPiniaPlugin(services));

  app.use(createServicesVuePlugin(services)).use(router).use(store).use(head);

  store.state.value = initialState;

  app.config.errorHandler = (error, instance, info) => {
    services.logger.error(error, info, [instance]);
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
};
