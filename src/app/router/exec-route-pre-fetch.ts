import type { useStore as useAppStore } from '@app/store';
import type { Logger } from 'pino';
import type {
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
} from 'vue-router';

import { getMatchedComponents } from '@b12k/vue3-router-gmc';

interface RoutePreFetchConfig {
  isSsr: boolean;
  logger: Logger;
  signal?: AbortSignal;
  useStore: typeof useAppStore;
}

export async function execRoutePreFetch(
  to: RouteLocationNormalized,
  {
    isSsr,
    logger,
    signal = new AbortController().signal,
    useStore,
  }: RoutePreFetchConfig,
  from?: RouteLocationNormalizedLoaded,
) {
  const { entering, staying } = await getMatchedComponents(to, from);
  if (signal.aborted) return;

  const components = [
    ...entering,
    ...staying.filter(({ shouldReFetch }) => shouldReFetch),
  ];
  const prefetch = Promise.all(
    components.map(async ({ fetchData }) => {
      try {
        signal.throwIfAborted();
        await fetchData?.(to, useStore, signal);
      } catch (error) {
        if (!signal.aborted) throw error;
      }
    }),
  );

  if (!isSsr && to.meta.noPreFetchAwait) {
    // Observe background failures without making navigation wait for them.
    // oxlint-disable-next-line promise/prefer-await-to-then, promise/prefer-await-to-callbacks
    prefetch.catch((error: unknown) => logger.error(error));
    return;
  }

  await prefetch;
}
