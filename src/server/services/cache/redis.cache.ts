import { loggerService } from '@server/services/logger.service';
import { setTimeout as delay } from 'node:timers/promises';
import { createClient } from 'redis';

import type { CacheClient } from './cache.service';

const RECONNECT_DELAY_MS = 1000;
const CONNECTION_TIMEOUT_MS = 1000;

export class RedisCache implements CacheClient {
  private client?: ReturnType<RedisCache['createClient']>;

  private isConnecting = false;

  public constructor(
    private readonly url: string,
    private readonly ttlSec: number,
    private readonly connectionRetries: number,
    private readonly readTimeoutMs: number,
  ) {}

  private static async connectClient(
    client: ReturnType<RedisCache['createClient']>,
  ) {
    const controller = new AbortController();
    try {
      await Promise.race([
        client.connect(),
        RedisCache.timeoutConnection(controller.signal),
      ]);
    } finally {
      controller.abort();
    }
  }

  private static logError(error: unknown) {
    loggerService.logger.error(error, '[RedisCache] Redis cache unavailable');
  }

  private static async timeoutConnection(signal: AbortSignal) {
    await delay(CONNECTION_TIMEOUT_MS, undefined, { signal });
    throw new Error('[RedisCache] Connection timed out');
  }

  public async connect(attemptsCount = this.connectionRetries + 1) {
    if (this.isConnecting) return;

    this.isConnecting = true;
    // oxlint-disable-next-line init-declarations -- A cause exists only after a failed attempt.
    let connectionError: unknown;
    try {
      for (
        let attemptIndex = 0;
        attemptIndex < attemptsCount;
        attemptIndex += 1
      ) {
        // oxlint-disable-next-line no-await-in-loop -- Delay separates sequential connection attempts.
        if (attemptIndex > 0) await delay(RECONNECT_DELAY_MS);

        const client = this.createClient();
        this.client = client;
        try {
          // oxlint-disable-next-line no-await-in-loop -- Connection attempts must run sequentially.
          await RedisCache.connectClient(client);
          loggerService.logger.info(
            {
              connectionAttempt: attemptIndex + 1,
              connectionAttempts: attemptsCount,
            },
            '[RedisCache] Connected',
          );
          return;
        } catch (error) {
          client.destroy();
          connectionError = error;
          loggerService.logger.error(
            {
              connectionAttempt: attemptIndex + 1,
              connectionAttempts: attemptsCount,
              err: error,
            },
            '[RedisCache] Connection attempt failed',
          );
        }
      }
      throw new Error('[RedisCache] Connection retries exhausted', {
        cause: connectionError,
      });
    } finally {
      this.isConnecting = false;
    }
  }

  public async deleteIfValue(key: string, expectedValue: string) {
    if (!this.client?.isReady) return false;

    try {
      const result = await this.client.delEx(key, {
        condition: 'IFEQ',
        matchValue: expectedValue,
      });
      return result === 1;
    } catch (error) {
      RedisCache.logError(error);
      return false;
    }
  }

  public async get(key: string) {
    // oxlint-disable-next-line unicorn/no-useless-undefined -- Cache misses must be explicit on every return path.
    if (!this.client?.isReady) return undefined;

    const controller = new AbortController();
    try {
      const cached = await Promise.race([
        this.client.get(key),
        this.timeoutRead(controller.signal),
      ]);
      return cached ?? undefined;
    } catch (error) {
      RedisCache.logError(error);
      // oxlint-disable-next-line unicorn/no-useless-undefined -- A failed cache read is a miss.
      return undefined;
    } finally {
      controller.abort();
    }
  }

  public async set(key: string, value: string, ttlSec = this.ttlSec) {
    if (!this.client?.isReady) return;

    try {
      await this.client.set(key, value, {
        expiration: { type: 'EX', value: ttlSec },
      });
    } catch (error) {
      RedisCache.logError(error);
    }
  }

  public async setIfAbsent(key: string, value: string, ttlMs: number) {
    if (!this.client?.isReady) return false;

    try {
      const result = await this.client.set(key, value, {
        condition: 'NX',
        expiration: { type: 'PX', value: ttlMs },
      });
      return result === 'OK';
    } catch (error) {
      RedisCache.logError(error);
      return false;
    }
  }

  public async setIfValue(
    key: string,
    value: string,
    expectedValue: string,
    ttlMs: number,
  ) {
    if (!this.client?.isReady) return false;

    try {
      const result = await this.client.set(key, value, {
        condition: 'IFEQ',
        expiration: { type: 'PX', value: ttlMs },
        matchValue: expectedValue,
      });
      return result === 'OK';
    } catch (error) {
      RedisCache.logError(error);
      return false;
    }
  }

  private createClient() {
    const client = createClient({
      disableOfflineQueue: true,
      socket: {
        connectTimeout: CONNECTION_TIMEOUT_MS,
        // The bounded loop owns retries, including handshake timeouts.
        reconnectStrategy: false,
      },
      url: this.url,
    });
    client.on('error', (error: unknown) => {
      if (!this.isConnecting) RedisCache.logError(error);
    });
    client.on('terminated', () => {
      if (this.isConnecting || client !== this.client) return;
      client.destroy();
      // oxlint-disable-next-line promise/prefer-await-to-callbacks, promise/prefer-await-to-then -- A socket event starts recovery in the background and handles its terminal failure.
      this.connect(this.connectionRetries).catch((error: unknown) =>
        RedisCache.logError(error),
      );
    });
    return client;
  }

  private async timeoutRead(signal: AbortSignal) {
    await delay(this.readTimeoutMs, undefined, { signal });
    throw new Error(
      `[RedisCache] GET timed out after ${this.readTimeoutMs} ms`,
    );
  }
}
