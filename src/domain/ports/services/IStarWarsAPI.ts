import { Character } from '../../entities/Character';

export interface IStarWarsAPI {
  getCharacter(id: string): Promise<Character>;
  getFirstPageCharacters(): Promise<Character[]>;
}
