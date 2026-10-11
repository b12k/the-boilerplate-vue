import type { Context } from '@server/services';
import type { Logger } from 'pino';
import type { App } from 'vue';

import { markRaw } from 'vue';

import { createApi } from './api.service';

type Services = ReturnType<typeof createServices>;

function createServices(
  context: Context,
  logger: Logger,
  ssrAbortSignal?: AbortSignal,
) {
  return markRaw({
    api: createApi(context, logger, ssrAbortSignal),
    logger,
  });
}

function createServicesPiniaPlugin(services: Services) {
  return () => ({
    $services: services,
  });
}

function createServicesVuePlugin(services: Services) {
  return {
    install: (app: App) => {
      app.config.globalProperties.$services = services;
      app.provide('$services', services);
    },
  };
}

export {
  createServices,
  createServicesPiniaPlugin,
  createServicesVuePlugin,
  type Services,
};
