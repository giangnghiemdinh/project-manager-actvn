import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  set(key: string, value: unknown, ttl?: number) {
    return this.cacheManager.set(key, value, ttl);
  }

  get(key: string) {
    return this.cacheManager.get(key);
  }

  del(key: string) {
    return this.cacheManager.del(key);
  }
}
