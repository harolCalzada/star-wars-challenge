import { Character } from '../../domain/entities/Character';
import { ICharacterRepository } from '../../domain/ports/repositories/ICharacterRepository';
import { IStarWarsAPI } from '../../domain/ports/services/IStarWarsAPI';
import { ICharacterCache } from '../../domain/ports/cache/ICharacterCache';

export class CharacterService {
  private readonly CACHE_TTL = 1800; // 30 minutes in seconds

  constructor(
    private readonly characterRepository: ICharacterRepository,
    private readonly starWarsAPI: IStarWarsAPI,
    private readonly characterCache: ICharacterCache
  ) {}

  async getCharacter(id: string): Promise<Character> {
    // First try to get from cache
    const cachedCharacter = await this.characterCache.get(id);
    if (cachedCharacter) {
      return cachedCharacter;
    }

    // Then try to get from repository
    const character = await this.characterRepository.findById(id);
    if (character) {
      // Store in cache and return
      await this.characterCache.set(id, character, this.CACHE_TTL);
      return character;
    }

    // If not found anywhere, fetch from Star Wars API
    const fetchedCharacter = await this.starWarsAPI.getCharacter(id);
    
    // Save to both cache and repository
    await Promise.all([
      this.characterCache.set(id, fetchedCharacter, this.CACHE_TTL),
      this.characterRepository.save(fetchedCharacter)
    ]);

    return fetchedCharacter;
  }

  async getCharactersByPage(page: number): Promise<Character[]> {
    // First try to get from cache
    const cachedCharacters = await this.characterCache.getList(page);
    if (cachedCharacters) {
      return cachedCharacters;
    }

    // If not in cache, fetch from API
    const characters = await this.starWarsAPI.getCharactersByPage(page);
    
    // Store in cache
    await this.characterCache.setList(page, characters, this.CACHE_TTL);
    
    return characters;
  }
}
