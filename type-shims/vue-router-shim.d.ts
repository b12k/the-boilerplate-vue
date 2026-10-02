declare module 'vue-router' {
  interface RouteMeta {
    noPreFetchAwait?: boolean | undefined;
    responseCode?: number | undefined;
  }
}

export type { RouteMeta } from 'vue-router';
