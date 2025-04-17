import axios from 'axios';
import { environment } from '../../http/config/environment';

export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}

export class CacheService implements ICache {
  private static instance: CacheService;
  private readonly ttl: number;
  private readonly prefix: string;
  private readonly redisUrl: string;
  private readonly redisToken: string;

  private constructor(prefix: string = '') {
    const redisUrl = process.env.REDIS_URL;
    const redisToken = process.env.REDIS_TOKEN;

    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }
    if (!redisToken) {
      throw new Error('REDIS_TOKEN environment variable is not set');
    }

    this.redisUrl = redisUrl;
    this.redisToken = redisToken;
    this.prefix = prefix;
    this.ttl = environment.cache.ttl;

    console.log('Upstash Redis configured');
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

  async deletePattern(pattern: string): Promise<void> {
    try {
      console.log(`Deleting keys matching pattern ${pattern}...`);
      await axios.post(`${this.redisUrl}/del/${this.getKey(pattern)}*`, null, {
        headers: {
          Authorization: `Bearer ${this.redisToken}`
        }
      });
      console.log('Keys deleted successfully');
    } catch (error) {
      console.error('Error deleting keys:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      console.log(`Getting key ${key} from cache...`);
      const response = await axios.get(`${this.redisUrl}/get/${this.getKey(key)}`, {
        headers: {
          Authorization: `Bearer ${this.redisToken}`
        }
      });

      if (!response.data || response.data.result === null) {
        console.log('No data found in cache');
        return null;
      }

      try {
        const result = JSON.parse(response.data.result);
        if (result && typeof result === 'object') {
          if ('value' in result) {
            return JSON.parse(result.value) as T;
          }
          return result as T;
        }
        return null;
      } catch (parseError) {
        console.error('Error parsing cache data:', parseError);
        return null;
      }
    } catch (error) {
      console.error('Error getting value from cache:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      console.log(`Setting key ${key} in cache...`);
      await axios.post(`${this.redisUrl}/set/${this.getKey(key)}`, {
        value: JSON.stringify(value),
        ex: this.ttl
      }, {
        headers: {
          Authorization: `Bearer ${this.redisToken}`
        }
      });
    } catch (error) {
      console.error('Error setting value in cache:', error);
    } finally {
      console.log('Value set in cache successfully');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await axios.delete(`${this.redisUrl}/del/${this.getKey(key)}`, {
        headers: {
          Authorization: `Bearer ${this.redisToken}`
        }
      });
    } catch (error) {
      console.error('Error deleting from cache:', error);
    }
  }
}
