import { Character } from '../../entities/Character';

export interface ICharacterRepository {
  findById(id: string, type?: string): Promise<Character | null>;
  findAll(): Promise<Character[]>;
  save(character: Character): Promise<Character>;
  update(character: Character): Promise<Character>;
  delete(id: string): Promise<void>;
}
