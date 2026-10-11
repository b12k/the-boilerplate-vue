import { loggerService } from '@server/services/logger.service';
import { setTimeout as delay } from 'node:timers/promises';
import { createClient } from 'redis';

import type { CacheClient, ConditionalCacheWriteParams } from './cache.service';

const RECONNECT_DELAY_MS = 1000;
const CONNECTION_TIMEOUT_MS = 1000;
const COMMAND_TIMEOUT_MS = 1000;
const MAX_PENDING_COMMANDS = 256;

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
    const timerAbortController = new AbortController();
    try {
      await Promise.race([
        client.connect(),
        RedisCache.timeoutConnection(
          AbortSignal.any([timerAbortController.signal, connectionAbortSignal]),
        ),
      ]);
    } finally {
      timerAbortController.abort();
    }
  }

  private static logError(error: unknown) {
    loggerService.logger.error(error, '[RedisCache] Redis cache unavailable');
  }

  private static async timeoutConnection(timerAbortSignal: AbortSignal) {
    await delay(CONNECTION_TIMEOUT_MS, undefined, {
      signal: timerAbortSignal,
    });
    throw new Error('[RedisCache] Connection timed out');
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
    const { client } = this;
    if (!client?.isReady) return false;
    try {
      const deletedKeysCount = await this.waitForCommand(
        client,
        'DELEX IFEQ',
        client.delEx(key, {
          condition: 'IFEQ',
          matchValue: expectedValue,
        }),
      );
      return deletedKeysCount === 1;
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
    const { client } = this;
    // oxlint-disable-next-line unicorn/no-useless-undefined -- Cache misses must be explicit on every return path.
    if (!client?.isReady) return undefined;
    try {
      const cachedValue = await this.waitForCommand(
        client,
        'GET',
        client.get(key),
        this.options.readTimeoutMs,
      );
      return cachedValue ?? undefined;
    } catch (error) {
      RedisCache.logError(error);
      // oxlint-disable-next-line unicorn/no-useless-undefined -- A failed cache read is a miss.
      return undefined;
    }
  }

  public async set(
    key: string,
    value: string,
    ttlSec = this.options.defaultTtlSec,
  ) {
    const { client } = this;
    if (!client?.isReady) return;
    try {
      await this.waitForCommand(
        client,
        'SET',
        client.set(key, value, {
          expiration: { type: 'EX', value: ttlSec },
        }),
      );
    } catch (error) {
      RedisCache.logError(error);
    }
  }

  public async setIfAbsent(key: string, value: string, ttlMs: number) {
    const { client } = this;
    if (!client?.isReady) return false;
    try {
      const setReply = await this.waitForCommand(
        client,
        'SET NX',
        client.set(key, value, {
          condition: 'NX',
          expiration: { type: 'PX', value: ttlMs },
        }),
      );
      return setReply === 'OK';
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
    const { client } = this;
    if (!client?.isReady) return false;
    try {
      const setReply = await this.waitForCommand(
        client,
        'SET IFEQ',
        client.set(key, value, {
          condition: 'IFEQ',
          expiration: { type: 'PX', value: ttlMs },
          matchValue: expectedValue,
        }),
      );
      return setReply === 'OK';
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
      commandsQueueMaxLength: MAX_PENDING_COMMANDS,
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
      if (!this.isConnecting) this.resetConnection(client);
    });
    return client;
  }

  private resetConnection(client: ReturnType<RedisCache['createClient']>) {
    if (client !== this.client) return;
    // Reject queued commands before allowing another request to use this connection.
    delete this.client;
    client.destroy();
    if (this.checkIsConnectionStopped()) return;
    this.connect(this.options.connectionRetriesCount).catch((error: unknown) =>
      RedisCache.logError(error),
    );
  }

  private async waitForCommand<T>(
    client: ReturnType<RedisCache['createClient']>,
    commandName: string,
    commandPromise: Promise<T>,
    timeoutMs = COMMAND_TIMEOUT_MS,
  ) {
    const commandStartedAtMs = performance.now();
    const timerAbortController = new AbortController();
    const timeoutMessage = `[RedisCache] ${commandName} timed out after ${timeoutMs} ms; operation unconfirmed`;
    const commandTimeout = delay(timeoutMs, undefined, {
      signal: timerAbortController.signal,
    }).then(() => {
      const timeoutError = new Error(timeoutMessage);
      RedisCache.logError(timeoutError);
      this.resetConnection(client);
      throw timeoutError;
    });
    try {
      const commandResult = await Promise.race([
        commandPromise,
        commandTimeout,
      ]);
      if (performance.now() - commandStartedAtMs >= timeoutMs) {
        this.resetConnection(client);
        throw new Error(timeoutMessage);
      }
      return commandResult;
    } finally {
      timerAbortController.abort();
    }
  }
}
