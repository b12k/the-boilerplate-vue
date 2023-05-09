import { createSSRApp } from 'vue';
import { createPinia, StateTree } from 'pinia';
import { createRouter, RouterHistory } from 'vue-router';
import type { Logger } from 'pino';

import { Context } from '@server';
import App from './app.vue';
import { routes } from './router';
import { createLogger } from './services';

export type InitialState = StateTree & { context: Context };

export const createApp = async (
  history: RouterHistory,
  initialState: InitialState,
  logger?: Logger,
) => {
  createLogger(logger);
  const app = createSSRApp(App);
  const store = createPinia();
  const router = createRouter({
    history,
    routes,
  });

  app.use(router).use(store);

  store.state.value = initialState;
  await router.push(initialState.context.url);
  await router.isReady();

  return {
    app,
    store,
    router,
  };
};
