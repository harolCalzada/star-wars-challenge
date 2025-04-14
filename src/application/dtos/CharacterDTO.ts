import { Type } from '@sinclair/typebox';

export const MovieDetailsDTO = Type.Object({
  id: Type.Number(),
  title: Type.String(),
  posterPath: Type.String(),
  backdropPath: Type.String(),
  releaseDate: Type.String(),
  overview: Type.String()
});

export const CharacterListItemDTO = Type.Object({
  id: Type.String(),
  name: Type.String(),
  detailUrl: Type.String()
});

export const CharacterDetailDTO = Type.Object({
  id: Type.String(),
  name: Type.String(),
  height: Type.String(),
  mass: Type.String(),
  hairColor: Type.String(),
  skinColor: Type.String(),
  eyeColor: Type.String(),
  birthYear: Type.String(),
  gender: Type.String(),
  homeworld: Type.String(),
  films: Type.Array(Type.String()),
  species: Type.Array(Type.String()),
  vehicles: Type.Array(Type.String()),
  starships: Type.Array(Type.String()),
  created: Type.String(),
  edited: Type.String(),
  url: Type.String(),
  movieDetails: Type.Array(MovieDetailsDTO)
});

export type CharacterListItemDTOType = typeof CharacterListItemDTO;
export type CharacterDetailDTOType = typeof CharacterDetailDTO;
