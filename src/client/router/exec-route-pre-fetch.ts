import type {
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
} from 'vue-router';

import { getMatchedComponents } from '@b12k/vue3-router-gmc';

async function execRoutePreFetch(
  to: RouteLocationNormalized,
  from?: RouteLocationNormalizedLoaded,
  isSsr = false,
) {
  const { entering, staying } = await getMatchedComponents(to, from);
  const enteringFetchDataPromises = entering.map(({ fetchData }) =>
    fetchData?.(to),
  );
  const stayingReFetchDataPromises = staying.map(
    ({ fetchData, shouldReFetch }) =>
      (shouldReFetch ?? false) ? fetchData?.(to) : undefined,
  );

  if (!isSsr && (to.meta.noPreFetchAwait ?? false)) return;

  await Promise.all([
    ...enteringFetchDataPromises,
    ...stayingReFetchDataPromises,
  ]);
}

export { execRoutePreFetch };
