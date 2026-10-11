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
  prefetchAbortSignal?: AbortSignal;
  useStore: typeof useAppStore;
}

export async function execRoutePreFetch(
  to: RouteLocationNormalized,
  {
    isSsr,
    logger,
    prefetchAbortSignal = new AbortController().signal,
    useStore,
  }: RoutePreFetchConfig,
  from?: RouteLocationNormalizedLoaded,
) {
  const { entering, staying } = await getMatchedComponents(to, from);
  if (prefetchAbortSignal.aborted) return;

  const componentsToPrefetch = [
    ...entering,
    ...staying.filter(({ shouldReFetch }) => shouldReFetch),
  ];
  const prefetchPromise = Promise.all(
    componentsToPrefetch.map(async ({ fetchData }) => {
      try {
        prefetchAbortSignal.throwIfAborted();
        await fetchData?.(to, useStore, prefetchAbortSignal);
      } catch (error) {
        if (!prefetchAbortSignal.aborted) throw error;
      }
    }),
  );

  if (!isSsr && to.meta.noPreFetchAwait) {
    // Observe background failures without making navigation wait for them.
    prefetchPromise.catch((error: unknown) => logger.error(error));
    return;
  }

  await prefetchPromise;
}
