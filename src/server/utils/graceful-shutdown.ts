import type { Server } from 'node:http';
import type { Logger } from 'pino';

import { serverReadiness, waitForServerTasks } from './server-tasks';

interface GracefulShutdownOptions {
  budgetMs: number;
  closeResources: () => Promise<void>;
  forceCloseResources: () => void;
  logger: Logger;
  server: Server;
}

export function installGracefulShutdown({
  budgetMs,
  closeResources,
  forceCloseResources,
  logger,
  server,
}: GracefulShutdownOptions) {
  let hasShutdownStarted = false;

  function forceShutdown(reason: string, error?: unknown) {
    logger.error({ budgetMs, err: error, reason }, 'Forced server shutdown');
    server.closeAllConnections();
    forceCloseResources();
    // A deadline must terminate even operations that ignore cancellation.
    // oxlint-disable-next-line node/no-process-exit
    process.exit(1);
  }

  async function shutdown(signal: string) {
    if (hasShutdownStarted) return;
    hasShutdownStarted = true;
    serverReadiness.isReady = false;
    serverReadiness.isDraining = true;
    const shutdownStartedAtMs = performance.now();
    logger.info({ budgetMs, signal }, 'Server shutdown started');
    const shutdownTimer = setTimeout(() => {
      forceShutdown('SHUTDOWN_TIMEOUT');
    }, budgetMs);

    try {
      await server[Symbol.asyncDispose]();
      await waitForServerTasks();
      await closeResources();
      clearTimeout(shutdownTimer);
      logger.info(
        { durationMs: performance.now() - shutdownStartedAtMs, signal },
        'Server shutdown completed',
      );
      process.exitCode = 0;
    } catch (error) {
      forceShutdown('SHUTDOWN_FAILED', error);
    }
  }

  function handleShutdownSignal(signal: string) {
    shutdown(signal).catch((error: unknown) => {
      forceShutdown('SHUTDOWN_FAILED', error);
    });
  }

  process.on('SIGINT', handleShutdownSignal);
  process.on('SIGTERM', handleShutdownSignal);
}
