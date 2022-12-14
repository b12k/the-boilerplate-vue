import { RouteLocationNormalized } from 'vue-router';

export {};

declare module 'vue' {
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
  interface LocationAsRelativeRaw {
    name: string;
  }
}
