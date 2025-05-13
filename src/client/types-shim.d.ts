import type { RouteLocationNormalized } from 'vue-router';

import type { Services } from './services';

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >;
  export default component;
}

declare module 'vue' {
  interface ComponentCustomOptions {
    fetchData?: (to: RouteLocationNormalized) => unknown;
    shouldReFetch?: boolean;
  }
  interface ComponentCustomProperties {
    $services: Services;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomOptions {
    fetchData?: (to: RouteLocationNormalized) => Promise<void>;
    shouldReFetch?: boolean;
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    noPreFetchAwait?: boolean;
    responseCode?: number;
  }
}

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $services: Services;
  }
}

export {};
