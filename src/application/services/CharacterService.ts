import { Character } from '../../domain/entities/Character';
import { ICharacterRepository } from '../../domain/ports/repositories/ICharacterRepository';
import { IStarWarsAPI } from '../../domain/ports/services/IStarWarsAPI';

export class CharacterService {
  constructor(
    private readonly characterRepository: ICharacterRepository,
    private readonly starWarsAPI: IStarWarsAPI
  ) {}

  async getCharacter(id: string): Promise<Character> {
    // First try to get from repository (cache/database)
    const character = await this.characterRepository.findById(id);
    if (character) {
      return character;
    }

    // If not found, fetch from Star Wars API and save
    const fetchedCharacter = await this.starWarsAPI.getCharacter(id);
    await this.characterRepository.save(fetchedCharacter);
    return fetchedCharacter;
  }

  async getFirstPageCharacters(): Promise<Character[]> {
    return this.starWarsAPI.getFirstPageCharacters();
  }
}
