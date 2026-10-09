import { setTimeout as delay } from 'node:timers/promises';

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

function createSsrDeadline(budgetMs: number) {
  const startedAt = performance.now();
  const expiresBefore = startedAt + budgetMs;
  const controller = new AbortController();

  function createTimeoutError() {
    return new SsrResponseTimeoutError(
      budgetMs,
      Math.round(performance.now() - startedAt),
    );
  }

  function checkIsExpired() {
    return performance.now() >= expiresBefore;
  }

  function assertIsWithinBudget() {
    if (checkIsExpired()) throw createTimeoutError();
  }

  async function rejectAfterBudget(): Promise<never> {
    const remainingMs = Math.max(
      0,
      Math.ceil(expiresBefore - performance.now()),
    );
    await delay(remainingMs, undefined, { signal: controller.signal });
    throw createTimeoutError();
  }

  async function waitFor<T>(operation: () => Promise<T>) {
    try {
      return await Promise.race([rejectAfterBudget(), operation()]);
    } finally {
      controller.abort();
    }
  }

  return { assertIsWithinBudget, checkIsExpired, waitFor };
}

export { createSsrDeadline, SsrResponseTimeoutError };
