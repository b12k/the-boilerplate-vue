import {
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
} from 'vue-router';
import { extractComponents } from './extract-components';

export const execRoutePreFetch = async (
  to: RouteLocationNormalized,
  from?: RouteLocationNormalizedLoaded,
  isSsr?: boolean,
) => {
  const { entering, staying } = await extractComponents(to, from);
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
