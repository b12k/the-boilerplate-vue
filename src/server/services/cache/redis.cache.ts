import { loggerService } from '@server/services/logger.service';
import { createClient } from 'redis';

import type { CacheClient } from './cache.service';

const RECONNECT_DELAY_MS = 1000;

export class RedisCache implements CacheClient {
  private readonly client;

  private hasConnected = false;

  public constructor(
    url: string,
    private readonly ttlSec: number,
  ) {
    this.client = createClient({
      disableOfflineQueue: true,
      socket: {
        // Initial failure must let the server continue SSR without cache.
        reconnectStrategy: () =>
          this.hasConnected ? RECONNECT_DELAY_MS : false,
      },
      url,
    });
    this.client.on('error', (error: unknown) => RedisCache.logError(error));
  }

  private static logError(error: unknown) {
    loggerService.logger.error(error, '[RedisCache] Redis cache unavailable');
  }

  public async connect() {
    await this.client.connect();
    this.hasConnected = true;
  }

  public async get(key: string) {
    // oxlint-disable-next-line unicorn/no-useless-undefined -- Cache misses must be explicit on every return path.
    if (!this.client.isReady) return undefined;

    try {
      return (await this.client.get(key)) ?? undefined;
    } catch (error) {
      RedisCache.logError(error);
      // oxlint-disable-next-line unicorn/no-useless-undefined -- A failed cache read is a miss.
      return undefined;
    }
  }

  public async set(key: string, value: string, ttlSec = this.ttlSec) {
    if (!this.client.isReady) return;

    try {
      await this.client.set(key, value, {
        expiration: { type: 'EX', value: ttlSec },
      });
    } catch (error) {
      RedisCache.logError(error);
    }
  }

  public async setIfAbsent(key: string, value: string, ttlSec: number) {
    if (!this.client.isReady) return false;

    try {
      const result = await this.client.set(key, value, {
        condition: 'NX',
        expiration: { type: 'EX', value: ttlSec },
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
    ttlSec: number,
  ) {
    if (!this.client.isReady) return false;

    try {
      // Replace only this computation's pending value, before it expires.
      const result = await this.client.eval(
        'if redis.call("GET", KEYS[1]) == ARGV[1] then redis.call("SET", KEYS[1], ARGV[2], "EX", ARGV[3]) return 1 end return 0',
        { arguments: [expectedValue, value, ttlSec.toString()], keys: [key] },
      );
      return result === 1;
    } catch (error) {
      RedisCache.logError(error);
      return false;
    }
  }
}
