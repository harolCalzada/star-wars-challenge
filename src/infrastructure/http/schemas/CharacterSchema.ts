import { Type } from '@sinclair/typebox';
import { CharacterDetailDTO, CharacterListItemDTO } from '../../../application/dtos/CharacterDTO';

export const GetCharacterParams = Type.Object({
  id: Type.String()
});

export const GetCharacterResponse = CharacterDetailDTO;
export const GetCharactersResponse = Type.Array(CharacterListItemDTO);
