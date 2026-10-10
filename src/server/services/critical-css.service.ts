import type { CriticalCssTask } from '@server/workers/critical-css.worker';

import { env } from '@server/env';
import path from 'node:path';
import { Piscina } from 'piscina';

import { loggerService } from './logger.service';

const WORKER_IDLE_TIMEOUT_MS = 30_000;

// oxlint-disable-next-line init-declarations -- The pool is created only when CSS extraction is needed.
let criticalCssPool: Piscina<CriticalCssTask, string> | undefined;
let unfinishedCssTasksCount = 0;

async function closeCriticalCssPool() {
  await criticalCssPool?.close();
}

function destroyCriticalCssPool() {
  criticalCssPool?.destroy().catch((error: unknown) => {
    loggerService.logger.error(error, 'Failed to destroy critical CSS pool');
  });
}

function getCriticalCssPool() {
  if (criticalCssPool) return criticalCssPool;

  const workerExtension = path.extname(import.meta.filename);
  criticalCssPool = new Piscina<CriticalCssTask, string>({
    closeTimeout: env.SHUTDOWN_BUDGET_MS,
    filename: new URL(
      `../workers/critical-css.worker${workerExtension}`,
      import.meta.url,
    ).href,
    idleTimeout: WORKER_IDLE_TIMEOUT_MS,
    maxQueue: env.CACHE_CRITICAL_CSS_MAX_QUEUE,
    maxThreads: env.CACHE_CRITICAL_CSS_MAX_THREADS,
    minThreads: 0,
    name: 'extractCriticalCss',
  });
  criticalCssPool.on('error', (error: unknown) => {
    loggerService.logger.error(error, 'Critical CSS worker failed');
  });
  return criticalCssPool;
}

async function getCriticalCss(html: string, cssFiles: Array<string>) {
  const htmlSizeBytes = Buffer.byteLength(html);
  if (htmlSizeBytes > env.CACHE_CRITICAL_CSS_MAX_HTML_BYTES) {
    throw new Error(
      `Critical CSS HTML exceeds ${env.CACHE_CRITICAL_CSS_MAX_HTML_BYTES} bytes`,
    );
  }

  const maxTasksCount =
    env.CACHE_CRITICAL_CSS_MAX_THREADS + env.CACHE_CRITICAL_CSS_MAX_QUEUE;
  // Piscina keeps abortable tasks in a separate queue; bound every accepted task.
  if (unfinishedCssTasksCount >= maxTasksCount) {
    throw new Error(
      `Critical CSS pool capacity exceeded (${maxTasksCount} tasks)`,
    );
  }
  unfinishedCssTasksCount += 1;

  const budgetMs = env.CACHE_CRITICAL_CSS_BUDGET_MS;
  const expiresBefore = performance.now() + budgetMs;
  const cssAbortController = new AbortController();
  const timeoutError = new Error(
    `Critical CSS extraction timed out after ${budgetMs} ms, including queue wait`,
  );
  const cssTimeout = setTimeout(() => {
    cssAbortController.abort(timeoutError);
  }, budgetMs);

  try {
    const css = await getCriticalCssPool().run(
      { assetsPath: env.ASSETS_LOCATION_PATH, cssFiles, html },
      { signal: cssAbortController.signal },
    );
    if (performance.now() >= expiresBefore) throw timeoutError;
    return css;
  } catch (error) {
    if (cssAbortController.signal.aborted) throw timeoutError;
    throw error;
  } finally {
    clearTimeout(cssTimeout);
    unfinishedCssTasksCount -= 1;
  }
}

export { closeCriticalCssPool, destroyCriticalCssPool, getCriticalCss };
