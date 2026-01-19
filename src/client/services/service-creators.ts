import type { Context } from '@server';
import type { Logger } from 'pino';
import type { App, ObjectPlugin } from 'vue';

import { createApi } from './api.service';

export type Services = ReturnType<typeof createServices>;

export function createServices(_: Context, logger: Logger) {
  return {
    api: createApi(),
    logger,
  };
}

export function createServicesPiniaPlugin(services: Services) {
  return () => ({
    $services: services,
  });
}

export function createServicesVuePlugin(services: Services): ObjectPlugin {
  return {
    install: (app: App) => {
      app.config.globalProperties.$services = services;
      app.provide('$services', services);
    },
  };
}
