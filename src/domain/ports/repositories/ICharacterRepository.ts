import { Character } from '../../entities/Character';

export interface ICharacterRepository {
  findById(id: string): Promise<Character | null>;
  findAll(): Promise<Character[]>;
  save(character: Character): Promise<void>;
  update(id: string, character: Partial<Character>): Promise<void>;
  delete(id: string): Promise<void>;
}
