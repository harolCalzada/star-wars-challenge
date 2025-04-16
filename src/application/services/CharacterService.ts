import { Character } from '../../domain/entities/Character';
import { ICharacterRepository } from '../../domain/ports/repositories/ICharacterRepository';
import { IStarWarsAPI } from '../../domain/ports/services/IStarWarsAPI';
import { CacheService } from '../../infrastructure/adapters/cache/CacheService';

export class CharacterService {
  private readonly CACHE_TTL = 1800; // 30 minutes in seconds

  constructor(
    private readonly characterRepository: ICharacterRepository,
    private readonly starWarsAPI: IStarWarsAPI
  ) {
    this.cache = CacheService.getInstance('character');
  }

  private readonly cache: CacheService;

  async getCharacter(id: string): Promise<Character> {
    // First try to get from cache
    const cachedCharacter = await this.cache.get<Character>(`character:${id}`);
    if (cachedCharacter) {
      return cachedCharacter;
    }

    // Then try to get from repository
    const character = await this.characterRepository.findById(id, 'character');
    if (character) {
      // Store in cache and return
      await this.cache.set(`character:${id}`, character);
      return character;
    }

    // If not found anywhere, fetch from Star Wars API
    const fetchedCharacter = await this.starWarsAPI.getCharacter(id);
    
    // Save to both cache and repository
    await Promise.all([
      this.cache.set(`character:${id}`, fetchedCharacter),
      this.characterRepository.save(fetchedCharacter)
    ]);

    return fetchedCharacter;
  }

  async getCharactersByPage(page: number): Promise<Character[]> {
    // First try to get from cache
    const cachedCharacters = await this.cache.get<Character[]>(`characters:page:${page}`);
    if (cachedCharacters) {
      return cachedCharacters;
    }

    // If not in cache, fetch from API
    const characters = await this.starWarsAPI.getCharactersByPage(page);
    
    // Save to cache
    await this.cache.set(`characters:page:${page}`, characters);
    
    return characters;
  }
}
