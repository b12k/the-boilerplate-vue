import type { Services } from '@app/services';
import type { useStore } from '@app/store';
import type { RouteLocationNormalized } from 'vue-router';

type FetchData = (
  to: RouteLocationNormalized,
  getStore: typeof useStore,
  signal: AbortSignal,
) => Promise<void> | void;

declare module 'vue' {
  interface ComponentCustomOptions {
    fetchData?: FetchData;
    shouldReFetch?: boolean;
  }
  interface ComponentCustomProperties {
    $services: Services;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomOptions {
    fetchData?: FetchData;
    shouldReFetch?: boolean;
  }
}

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $services: Services;
  }
}
