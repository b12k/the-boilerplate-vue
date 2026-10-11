import { setTimeout as delay } from 'node:timers/promises';

import { trackServerTask } from './server-tasks';

class SsrResponseTimeoutError extends Error {
  public readonly code = 'SSR_RESPONSE_TIMEOUT';

  public readonly statusCode = 500;

  public constructor(
    public readonly budgetMs: number,
    public readonly elapsedMs: number,
  ) {
    super('SSR response timed out');
    this.name = 'SsrResponseTimeoutError';
  }
}

function createSsrResponseBudget(
  budgetMs: number,
  ssrAbortSignal?: AbortSignal,
) {
  const budgetStartedAtMs = performance.now();
  const budgetExpiresAtMs = budgetStartedAtMs + budgetMs;
  const timerAbortController = new AbortController();
  const timerAbortSignal = ssrAbortSignal
    ? AbortSignal.any([ssrAbortSignal, timerAbortController.signal])
    : timerAbortController.signal;

  function createTimeoutError() {
    return new SsrResponseTimeoutError(
      budgetMs,
      Math.round(performance.now() - budgetStartedAtMs),
    );
  }

  function checkIsExpired() {
    return performance.now() >= budgetExpiresAtMs;
  }

  function assertIsWithinBudget() {
    ssrAbortSignal?.throwIfAborted();
    if (checkIsExpired()) throw createTimeoutError();
  }

  async function rejectAfterBudget(): Promise<never> {
    const remainingBudgetMs = Math.max(
      0,
      Math.ceil(budgetExpiresAtMs - performance.now()),
    );
    await delay(remainingBudgetMs, undefined, { signal: timerAbortSignal });
    throw createTimeoutError();
  }

  async function waitFor<T>(runOperation: () => Promise<T>) {
    ssrAbortSignal?.throwIfAborted();
    try {
      const operationPromise = trackServerTask(runOperation());
      return await Promise.race([rejectAfterBudget(), operationPromise]);
    } catch (error) {
      ssrAbortSignal?.throwIfAborted();
      throw error;
    } finally {
      timerAbortController.abort();
    }
  }

  return { assertIsWithinBudget, checkIsExpired, waitFor };
}

export { createSsrResponseBudget, SsrResponseTimeoutError };
