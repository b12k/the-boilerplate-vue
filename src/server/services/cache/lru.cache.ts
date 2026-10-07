import { LRUCache } from 'lru-cache';

import type { CacheClient } from './cache.service';

const MS_PER_SEC = 1000;

export class LruCache implements CacheClient {
  private readonly client;

  public constructor(ttlSec: number) {
    this.client = new LRUCache<string, string>({
      max: 10_000,
      ttl: ttlSec * MS_PER_SEC,
    });
  }

  public get(key: string) {
    return this.client.get(key);
  }

  public set(key: string, value: string, ttlSec?: number) {
    this.client.set(
      key,
      value,
      ttlSec ? { ttl: ttlSec * MS_PER_SEC } : undefined,
    );
  }

  public setIfAbsent(key: string, value: string, ttlSec: number) {
    if (this.client.has(key)) return false;

    this.set(key, value, ttlSec);
    return true;
  }

  public setIfValue(
    key: string,
    value: string,
    expectedValue: string,
    ttlSec: number,
  ) {
    if (this.client.get(key) !== expectedValue) return false;

    this.set(key, value, ttlSec);
    return true;
  }
}
