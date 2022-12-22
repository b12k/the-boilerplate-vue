import type { RouteLocationNormalized } from 'vue-router';

export {};

declare module '@vue/runtime-core' {
  interface ComponentCustomOptions {
    fetchData?: (to: RouteLocationNormalized) => Promise<void>;
    shouldReFetch?: boolean;
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    responseCode?: number;
    noPreFetchAwait?: boolean;
  }
}
