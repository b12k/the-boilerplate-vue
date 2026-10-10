import type { Context } from '@server/services';
import type { Logger } from 'pino';

import { create as createAxios } from 'axios';

const VERSION_CHECK_INTERVAL_MS = 60_000;
const VERSION_CHECK_TIMEOUT_MS = 3000;

function createVersionService(context: Context, logger: Logger) {
  const clientVersion = context.version;
  const healthClient = createAxios({ timeout: VERSION_CHECK_TIMEOUT_MS });
  let isStarted = false;
  let isChecking = false;
  const polling: {
    timer?: ReturnType<typeof setInterval> | undefined;
  } = {};

  function checkIsPollingActive() {
    return isStarted && !document.hidden;
  }

  async function check() {
    if (!checkIsPollingActive() || isChecking) return;
    isChecking = true;
    try {
      const {
        data: { version: serverVersion },
      } = await healthClient.get<{ version: string }>('/health');
      if (checkIsPollingActive() && serverVersion !== clientVersion) {
        globalThis.location.reload();
      }
    } catch (error) {
      if (checkIsPollingActive()) {
        logger.warn({ error }, 'Application version check failed');
      }
    } finally {
      isChecking = false;
    }
  }

  function requestCheck() {
    check().catch((error: unknown) => logger.error(error));
  }

  function handleVisibilityChange() {
    clearInterval(polling.timer);
    polling.timer = undefined;
    if (document.hidden) return;
    requestCheck();
    polling.timer = setInterval(requestCheck, VERSION_CHECK_INTERVAL_MS);
  }

  function start() {
    if (isStarted) return;
    isStarted = true;
    document.addEventListener('visibilitychange', handleVisibilityChange);
    handleVisibilityChange();
  }

  function stop() {
    isStarted = false;
    clearInterval(polling.timer);
    polling.timer = undefined;
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }

  return { check, start, stop };
}

export { createVersionService };
