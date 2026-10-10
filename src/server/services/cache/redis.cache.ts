import { loggerService } from '@server/services/logger.service';
import { setTimeout as delay } from 'node:timers/promises';
import { createClient } from 'redis';

import type { CacheClient, ConditionalCacheWriteParams } from './cache.service';

const RECONNECT_DELAY_MS = 1000;
const CONNECTION_TIMEOUT_MS = 1000;
const COMMAND_TIMEOUT_MS = 1000;

interface RedisCacheOptions {
  connectionRetriesCount: number;
  defaultTtlSec: number;
  readTimeoutMs: number;
  redisUrl: string;
}

export class RedisCache implements CacheClient {
  private client?: ReturnType<RedisCache['createClient']>;

  private readonly connectionAbortController = new AbortController();
  private isConnecting = false;

  public constructor(private readonly options: RedisCacheOptions) {}

  private static async connectClient(
    client: ReturnType<RedisCache['createClient']>,
    connectionAbortSignal: AbortSignal,
  ) {
    const controller = new AbortController();
    try {
      await Promise.race([
        client.connect(),
        RedisCache.timeoutConnection(
          AbortSignal.any([controller.signal, connectionAbortSignal]),
        ),
      ]);
    } finally {
      controller.abort();
    }
  }

  private static createCommandTimeoutError(commandName: string) {
    return new Error(
      `[RedisCache] ${commandName} timed out after ${COMMAND_TIMEOUT_MS} ms; operation unconfirmed`,
    );
  }

  private static logError(error: unknown) {
    loggerService.logger.error(error, '[RedisCache] Redis cache unavailable');
  }

  private static async timeoutCommand(
    commandName: string,
    timerAbortSignal: AbortSignal,
  ) {
    await delay(COMMAND_TIMEOUT_MS, undefined, { signal: timerAbortSignal });
    throw RedisCache.createCommandTimeoutError(commandName);
  }

  private static async timeoutConnection(signal: AbortSignal) {
    await delay(CONNECTION_TIMEOUT_MS, undefined, { signal });
    throw new Error('[RedisCache] Connection timed out');
  }

  private static async waitForCommand<T>(
    commandName: string,
    commandPromise: Promise<T>,
  ) {
    const commandStartedAtMs = performance.now();
    const timerAbortController = new AbortController();
    try {
      const commandResult = await Promise.race([
        commandPromise,
        RedisCache.timeoutCommand(commandName, timerAbortController.signal),
      ]);
      if (performance.now() - commandStartedAtMs >= COMMAND_TIMEOUT_MS) {
        throw RedisCache.createCommandTimeoutError(commandName);
      }
      return commandResult;
    } finally {
      timerAbortController.abort();
    }
  }

  public async close() {
    this.connectionAbortController.abort();
    if (this.client?.isReady) await this.client.close();
    else this.client?.destroy();
  }

  public async connect(
    attemptsCount = this.options.connectionRetriesCount + 1,
  ) {
    const connectionAbortSignal = this.connectionAbortController.signal;
    if (this.isConnecting || this.checkIsConnectionStopped()) return;

    this.isConnecting = true;
    // oxlint-disable-next-line init-declarations -- A cause exists only after a failed attempt.
    let connectionError: unknown;
    try {
      for (
        let attemptIndex = 0;
        attemptIndex < attemptsCount;
        attemptIndex += 1
      ) {
        if (this.checkIsConnectionStopped()) return;
        if (attemptIndex > 0) {
          // oxlint-disable-next-line no-await-in-loop -- Delay separates sequential connection attempts.
          await delay(RECONNECT_DELAY_MS, undefined, {
            signal: connectionAbortSignal,
          });
        }

        const client = this.createClient();
        this.client = client;
        try {
          // oxlint-disable-next-line no-await-in-loop -- Connection attempts must run sequentially.
          await RedisCache.connectClient(client, connectionAbortSignal);
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
          if (this.checkIsConnectionStopped()) return;
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
    } catch (error) {
      if (!this.checkIsConnectionStopped()) throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  public async deleteIfValue(key: string, expectedValue: string) {
    if (!this.client?.isReady) return false;

    try {
      const result = await RedisCache.waitForCommand(
        'DELEX IFEQ',
        this.client.delEx(key, {
          condition: 'IFEQ',
          matchValue: expectedValue,
        }),
      );
      return result === 1;
    } catch (error) {
      RedisCache.logError(error);
      return false;
    }
  }

  public destroy() {
    this.connectionAbortController.abort();
    this.client?.destroy();
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

  public async set(
    key: string,
    value: string,
    ttlSec = this.options.defaultTtlSec,
  ) {
    if (!this.client?.isReady) return;

    try {
      await RedisCache.waitForCommand(
        'SET',
        this.client.set(key, value, {
          expiration: { type: 'EX', value: ttlSec },
        }),
      );
    } catch (error) {
      RedisCache.logError(error);
    }
  }

  public async setIfAbsent(key: string, value: string, ttlMs: number) {
    if (!this.client?.isReady) return false;

    try {
      const result = await RedisCache.waitForCommand(
        'SET NX',
        this.client.set(key, value, {
          condition: 'NX',
          expiration: { type: 'PX', value: ttlMs },
        }),
      );
      return result === 'OK';
    } catch (error) {
      RedisCache.logError(error);
      return false;
    }
  }

  public async setIfValue({
    expectedValue,
    key,
    ttlMs,
    value,
  }: ConditionalCacheWriteParams) {
    if (!this.client?.isReady) return false;

    try {
      const result = await RedisCache.waitForCommand(
        'SET IFEQ',
        this.client.set(key, value, {
          condition: 'IFEQ',
          expiration: { type: 'PX', value: ttlMs },
          matchValue: expectedValue,
        }),
      );
      return result === 'OK';
    } catch (error) {
      RedisCache.logError(error);
      return false;
    }
  }

  private checkIsConnectionStopped() {
    return this.connectionAbortController.signal.aborted;
  }

  private createClient() {
    const client = createClient({
      disableOfflineQueue: true,
      socket: {
        connectTimeout: CONNECTION_TIMEOUT_MS,
        // The bounded loop owns retries, including handshake timeouts.
        reconnectStrategy: false,
      },
      url: this.options.redisUrl,
    });
    client.on('connect', () => {
      // Redis stores the socket after TCP connects; destroy() may have already run during shutdown.
      if (this.checkIsConnectionStopped() || !client.isOpen) client.destroy();
    });
    client.on('error', (error: unknown) => {
      if (!this.isConnecting) RedisCache.logError(error);
    });
    client.on('terminated', () => {
      if (
        this.connectionAbortController.signal.aborted ||
        this.isConnecting ||
        client !== this.client
      ) {
        return;
      }
      client.destroy();
      // Recover in the background after a socket error.
      this.connect(this.options.connectionRetriesCount).catch(
        (error: unknown) => RedisCache.logError(error),
      );
    });
    return client;
  }

  private async timeoutRead(signal: AbortSignal) {
    await delay(this.options.readTimeoutMs, undefined, { signal });
    throw new Error(
      `[RedisCache] GET timed out after ${this.options.readTimeoutMs} ms`,
    );
  }
}
