import { getMatchedComponents } from '@b12k/vue3-router-gmc';
import {
  type RouteLocationNormalized,
  type RouteLocationNormalizedLoaded,
} from 'vue-router';

export const execRoutePreFetch = async (
  to: RouteLocationNormalized,
  from?: RouteLocationNormalizedLoaded,
  isSsr?: boolean,
) => {
  const { entering, staying } = await getMatchedComponents(to, from);
  const enteringFetchDataPromises = entering.map(
    ({ fetchData }) => fetchData && fetchData(to),
  );
  const stayingReFetchDataPromises = staying.map(
    ({ fetchData, shouldReFetch }) =>
      fetchData && shouldReFetch && fetchData(to),
  );

  if (isSsr || !to.meta.noPreFetchAwait) {
    await Promise.all([
      ...enteringFetchDataPromises,
      ...stayingReFetchDataPromises,
    ]);
  }
};
