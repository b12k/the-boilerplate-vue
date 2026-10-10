import type { Context } from '@server/services';
import type { Logger } from 'pino';

import { create as createAxios, isAxiosError } from 'axios';

import type {
  DemoArchitecture,
  DemoOverview,
  DemoProject,
  DemoRun,
} from './api.types';

function createApi(
  context: Context,
  logger: Logger,
  ssrAbortSignal?: AbortSignal,
) {
  const apiClient = createAxios({
    baseURL: context.apiUrl,
    ...(ssrAbortSignal && { signal: ssrAbortSignal }),
  });

  apiClient.interceptors.request.use((requestConfig) => {
    const requestAbortSignal = requestConfig.signal;
    if (ssrAbortSignal) {
      requestConfig.signal =
        requestAbortSignal instanceof AbortSignal &&
        requestAbortSignal !== ssrAbortSignal
          ? AbortSignal.any([ssrAbortSignal, requestAbortSignal])
          : ssrAbortSignal;
    }
    logger.info({ endpoint: requestConfig.url, source: 'http' }, 'API request');
    return requestConfig;
  });

  async function fetchApi<T>(
    endpoint: string,
    requestAbortSignal?: AbortSignal,
    params?: { fail: boolean },
  ) {
    const { data: apiResponse } = await apiClient.get<T>(endpoint, {
      ...(params && { params }),
      ...(requestAbortSignal && { signal: requestAbortSignal }),
    });
    return apiResponse;
  }

  return {
    fetchArchitecture: (requestAbortSignal?: AbortSignal) =>
      fetchApi<DemoArchitecture>('/architecture', requestAbortSignal),
    fetchOverview: (requestAbortSignal?: AbortSignal) =>
      fetchApi<DemoOverview>('/overview', requestAbortSignal),
    fetchProject(id: string, requestAbortSignal?: AbortSignal) {
      return fetchApi<DemoProject>(
        `/projects/${encodeURIComponent(id)}`,
        requestAbortSignal,
      ).catch((error: unknown): undefined => {
        if (isAxiosError(error) && error.response?.status === 404) return;
        throw error;
      });
    },
    fetchRun(shouldFail: boolean, requestAbortSignal?: AbortSignal) {
      return fetchApi<DemoRun>('/run', requestAbortSignal, {
        fail: shouldFail,
      });
    },
    setNavigationAbortSignal(navigationAbortSignal: AbortSignal) {
      apiClient.defaults.signal = navigationAbortSignal;
    },
  };
}

export { createApi };
