import { Character } from '../../entities/Character';

export interface ICharacterCache {
  get(key: string): Promise<Character | null>;
  set(key: string, value: Character, ttlSeconds: number): Promise<void>;
  getList(page: number): Promise<Character[] | null>;
  setList(page: number, characters: Character[], ttlSeconds: number): Promise<void>;
}
