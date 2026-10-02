import { createClient } from 'redis';

import type { CacheClient } from './cache.service';

class RedisCache implements CacheClient {
  private readonly client;

  public constructor(
    url: string,
    private readonly ttlSec: number,
  ) {
    this.client = createClient({
      url,
    });
  }

  public async connect() {
    await this.client.connect();
  }

  public async get(key: string) {
    return (await this.client.get(key)) ?? undefined;
  }

  public async set(key: string, value: string, ttlSec = this.ttlSec) {
    await this.client.set(key, value, {
      expiration: { type: 'EX', value: ttlSec },
    });
  }
}

export { RedisCache };
