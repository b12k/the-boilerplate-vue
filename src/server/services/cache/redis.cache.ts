import { createClient } from 'redis';
import type { CacheClient } from './cache.service';

export class RedisCache implements CacheClient {
  private readonly client;

  constructor(
    url: string,
    private readonly ttl: number,
  ) {
    this.client = createClient({
      url,
    });
  }

  async connect() {
    await this.client.connect();
  }

  async get(key: string) {
    return (await this.client.get(key)) || undefined;
  }

  set(key: string, value: string, ttl = this.ttl) {
    this.client.set(key, value, { EX: ttl });
  }
}
