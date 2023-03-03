import {
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
} from 'vue-router';
import { getMatchedComponents } from '@b12k/vue3-router-gmc';

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
