import Redis from 'ioredis';
import { environment } from '../../http/config/environment';

export class CacheService {
  private static instance: CacheService;
  private readonly client: Redis;
  private readonly ttl: number;
  private readonly prefix: string;

  private constructor(prefix: string = '') {
    this.client = new Redis();
    this.ttl = environment.cache.ttl;
    this.prefix = prefix;
    console.log(`Redis Client Connected for ${prefix || 'default'} service`);
  }

  public static getInstance(prefix: string = ''): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(prefix);
    }
    return CacheService.instance;
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(this.getKey(key));
    if (!data) return null;
    return JSON.parse(data);
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.client.set(this.getKey(key), JSON.stringify(value), 'EX', this.ttl);
  }

  async del(key: string): Promise<void> {
    await this.client.del(this.getKey(key));
  }
}
