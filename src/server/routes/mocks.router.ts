import type { Response } from 'express';

import { Router as createRouter } from 'express';
import { setTimeout as delay } from 'node:timers/promises';

import { mockArchitecture, mockOverview, mockProjects } from './mock-data';

const MOCK_DELAY_MS = 120;
const MOCK_RUN_DELAY_MS = 650;

async function waitForMockResponse(response: Response, delayMs: number) {
  if (response.destroyed) return false;
  const mockAbortController = new AbortController();

  function handleClientDisconnect() {
    if (!response.writableFinished) mockAbortController.abort();
  }

  response.once('close', handleClientDisconnect);
  try {
    await delay(delayMs, undefined, { signal: mockAbortController.signal });
    return !response.destroyed;
  } catch (error) {
    if (mockAbortController.signal.aborted) return false;
    throw error;
  } finally {
    response.off('close', handleClientDisconnect);
  }
}

function createMocksRouter() {
  const router = createRouter();
  let completedRunsCount = 0;

  router.use((_, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });
  router.get('/overview', async (_, response) => {
    if (await waitForMockResponse(response, MOCK_DELAY_MS)) {
      response.json(mockOverview);
    }
  });
  router.get('/architecture', async (_, response) => {
    if (await waitForMockResponse(response, MOCK_DELAY_MS)) {
      response.json(mockArchitecture);
    }
  });
  router.get('/projects/:projectId', async (request, response) => {
    if (!(await waitForMockResponse(response, MOCK_DELAY_MS))) return;
    const project = mockProjects.find(
      (candidate) => candidate.id === request.params['projectId'],
    );
    if (!project) {
      response.status(404).json({ message: 'Project not found.' });
      return;
    }
    response.json(project);
  });
  router.get('/run', async (request, response) => {
    if (!(await waitForMockResponse(response, MOCK_RUN_DELAY_MS))) return;
    if (request.query['fail'] === 'true') {
      response.status(500).json({
        message: 'The mock API could not complete this request. Try again.',
      });
      return;
    }
    completedRunsCount += 1;
    response.json({
      delayMs: MOCK_RUN_DELAY_MS,
      sequence: completedRunsCount,
      steps: [
        'Axios received the HTTP response',
        'Pinia state updated',
        'Page rendered from state',
      ],
    });
  });
  router.use((_, response) => {
    response.status(404).json({ message: 'Mock endpoint not found.' });
  });
  return router;
}

const mocksRouter = createMocksRouter();

export { mocksRouter };
