import { Character } from '../../domain/entities/Character';
import { Static } from '@sinclair/typebox';
import { CharacterDetailDTO, CharacterListItemDTO } from '../dtos/CharacterDTO';

export class CharacterMapper {
  public static toListItemDTO(entity: Character): Static<typeof CharacterListItemDTO> {
    return {
      id: entity.id,
      name: entity.name,
      detailUrl: `/api/v1/characters/${entity.id}`
    };
  }

  public static toDetailDTO(entity: Character): Static<typeof CharacterDetailDTO> {
    return {
      id: entity.id,
      name: entity.name,
      height: entity.height,
      mass: entity.mass,
      hairColor: entity.hairColor,
      skinColor: entity.skinColor,
      eyeColor: entity.eyeColor,
      birthYear: entity.birthYear,
      gender: entity.gender,
      homeworld: entity.homeworld,
      films: entity.films || [],
      species: entity.species || [],
      vehicles: entity.vehicles || [],
      starships: entity.starships || [],
      created: entity.created,
      edited: entity.edited,
      url: entity.url,
      movieDetails: entity.movieDetails || []
    };
  }

  public static toDomain(dto: Static<typeof CharacterDetailDTO>): Character {
    return {
      id: dto.id,
      name: dto.name,
      height: dto.height,
      mass: dto.mass,
      hairColor: dto.hairColor,
      skinColor: dto.skinColor,
      eyeColor: dto.eyeColor,
      birthYear: dto.birthYear,
      gender: dto.gender,
      homeworld: dto.homeworld,
      films: dto.films,
      species: dto.species,
      vehicles: dto.vehicles,
      starships: dto.starships,
      created: dto.created,
      edited: dto.edited,
      url: dto.url
    };
  }
}
