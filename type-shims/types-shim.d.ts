import type { Services } from '@app/services';
import type { RouteLocationNormalized } from 'vue-router';

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

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $services: Services;
  }
}
