import type { Logger } from 'pino';

import { delay } from 'es-toolkit/promise';

import type { DemoRun } from './demo-api';

import { demoArchitecture, demoOverview } from './demo-api';

const MOCK_DELAY_MS = 120;
const DEMO_RUN_DELAY_MS = 650;

export function createApi(logger: Logger) {
  let sequence = 0;

  async function fetchMock<T>(
    endpoint: string,
    response: T,
    signal?: AbortSignal,
  ) {
    logger.info({ endpoint, source: 'mock' }, 'Demo API request');
    await delay(MOCK_DELAY_MS, signal ? { signal } : undefined);
    signal?.throwIfAborted();
    return structuredClone(response);
  }

  return {
    fetchArchitecture: (signal?: AbortSignal) =>
      fetchMock('/demo/architecture', demoArchitecture, signal),
    fetchOverview: (signal?: AbortSignal) =>
      fetchMock('/demo/overview', demoOverview, signal),
    fetchProject(id: string, signal?: AbortSignal) {
      const project = demoOverview.projects.find(
        (candidate) => candidate.id === id,
      );
      return fetchMock(`/demo/projects/${id}`, project, signal);
    },
    async fetchRun(
      shouldFail: boolean,
      signal?: AbortSignal,
    ): Promise<DemoRun> {
      logger.info(
        { endpoint: '/demo/run', source: 'mock' },
        'Demo API request',
      );
      await delay(DEMO_RUN_DELAY_MS, signal ? { signal } : undefined);
      signal?.throwIfAborted();
      if (shouldFail) {
        throw new Error(
          'The mock API could not complete this request. Try again.',
        );
      }
      sequence += 1;
      return {
        delayMs: DEMO_RUN_DELAY_MS,
        sequence,
        steps: [
          'Mock API responded',
          'Pinia state updated',
          'Page rendered from state',
        ],
      };
    },
  };
}
