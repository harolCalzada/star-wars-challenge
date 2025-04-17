import { Character } from '../../domain/entities/Character';
import { ICharacterRepository } from '../../domain/ports/repositories/ICharacterRepository';
import { IStarWarsAPI } from '../../domain/ports/services/IStarWarsAPI';
import { CacheService } from '../../infrastructure/adapters/cache/CacheService';
import { TMDBService } from '../../infrastructure/adapters/services/TMDBService';

export class CharacterService {
  private readonly cache: CacheService;
  private readonly tmdbService: TMDBService;
  private readonly CACHE_TTL = 1800; // 30 minutes in seconds

  constructor(
    private readonly characterRepository: ICharacterRepository,
    private readonly starWarsAPI: IStarWarsAPI
  ) {
    this.cache = CacheService.getInstance('character');
    this.tmdbService = new TMDBService();
  }

  async getCharacter(id: string): Promise<Character> {
    try {
      const cacheKey = `character:${id}`;
      
      // Try to get from cache first
      try {
        const cachedData = await this.cache.get<Character>(cacheKey);
        if (cachedData && typeof cachedData === 'object' && 'id' in cachedData) {
          console.log(`Character ${id} found in cache`);
          return cachedData;
        }
      } catch (cacheError) {
        console.warn('Cache error, continuing with API request:', cacheError);
      }

      // Fetch from Star Wars API
      const character = await this.starWarsAPI.getCharacter(id);

      // Get movie details
      const movieDetails = await this.tmdbService.getMoviesDetails(character.films);
      const characterWithMovies = {
        ...character,
        movieDetails
      };

      // Try to save to cache
      if (characterWithMovies && typeof characterWithMovies === 'object' && 'id' in characterWithMovies) {
        try {
          await this.cache.set(cacheKey, characterWithMovies);
          console.log(`Character ${id} saved to cache`);
        } catch (cacheError) {
          console.warn('Failed to save to cache:', cacheError);
        }
      }

      return characterWithMovies;
    } catch (error) {
      console.error('Error fetching character:', error);
      throw error;
    }
  }

  async clearCache(): Promise<void> {
    try {
      // Limpiar caché de personajes individuales
      await this.cache.deletePattern('character:');
      // Limpiar caché de páginas de personajes
      await this.cache.deletePattern('characters:page:');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async getCharactersByPage(page: number): Promise<Character[]> {
    try {
      const cacheKey = `characters:page:${page}`;
      let characters: Character[] = [];

      // Try to get from cache first
      try {
        const cachedData = await this.cache.get<Character[]>(cacheKey);
        if (Array.isArray(cachedData)) {
          console.log(`Characters page ${page} found in cache`);
          return cachedData;
        }
      } catch (cacheError) {
        console.warn('Cache error, continuing with API request:', cacheError);
      }

      // Fetch from Star Wars API
      characters = await this.starWarsAPI.getCharactersByPage(page);

      // Try to save to cache
      if (Array.isArray(characters) && characters.length > 0) {
        try {
          await this.cache.set(cacheKey, characters);
          console.log(`Saved ${characters.length} characters to cache`);
        } catch (cacheError) {
          console.warn('Failed to save to cache:', cacheError);
        }
      }

      return characters;
    } catch (error) {
      console.error('Error fetching characters:', error);
      throw error;
    }
  }
}
