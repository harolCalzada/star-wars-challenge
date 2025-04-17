import axios from 'axios';
import { Character } from '../../../domain/entities/Character';
import { IStarWarsAPI } from '../../../domain/ports/services/IStarWarsAPI';

export class StarWarsAPIService implements IStarWarsAPI {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = 'https://swapi.py4e.com/api';
  }

  private extractIdFromUrl(url: string): string {
    try {
      const matches = url.match(/\/([0-9]+)\/?$/);
      if (!matches) {
        console.warn(`Could not extract ID from URL: ${url}`);
        return '';
      }
      return matches[1];
    } catch (error) {
      console.warn(`Error extracting ID from URL: ${url}`, error);
      return '';
    }
  }

  async getCharacter(id: string): Promise<Character> {
    try {
      console.log(`Fetching character ${id} from SWAPI`);
      console.log('Base URL:', this.baseUrl);
      console.log('Full URL:', `${this.baseUrl}/people/${id}/`);
      const response = await axios.get(`${this.baseUrl}/people/${id}/`, {
        timeout: 30000 // Aumentar a 30 segundos
      });

      if (!response.data) {
        throw new Error('Invalid response format from Star Wars API');
      }

      const character = response.data;
      console.log('SWAPI response:', character);

      return {
        id,
        name: character.name,
        height: character.height,
        mass: character.mass,
        hairColor: character.hair_color,
        skinColor: character.skin_color,
        eyeColor: character.eye_color,
        birthYear: character.birth_year,
        gender: character.gender,
        homeworld: character.homeworld,
        films: character.films,
        species: character.species,
        vehicles: character.vehicles,
        starships: character.starships,
        created: character.created,
        edited: character.edited,
        url: character.url
      };
    } catch (error) {
      console.error('Error fetching character:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Character with id ${id} not found`);
      }
      if (error instanceof Error) {
        throw new Error(`Error fetching character: ${error.message}`);
      }
      throw new Error('Error fetching character');
    }
  }

  async getCharactersByPage(page: number): Promise<Character[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/people/?page=${page}`, {
        timeout: 30000 // Aumentar a 30 segundos
      });
      
      if (!response.data || !Array.isArray(response.data.results)) {
        throw new Error('Invalid response format from Star Wars API');
      }

      console.log('API Response:', {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        resultsCount: response.data.results.length
      });

      const characters = await Promise.all(
        response.data.results.map(async (character: any) => {
          const id = this.extractIdFromUrl(character.url);
          return {
            id,
            name: character.name,
            height: character.height,
            mass: character.mass,
            hairColor: character.hair_color,
            skinColor: character.skin_color,
            eyeColor: character.eye_color,
            birthYear: character.birth_year,
            gender: character.gender,
            homeworld: character.homeworld,
            films: character.films,
            species: character.species,
            vehicles: character.vehicles,
            starships: character.starships,
            created: character.created,
            edited: character.edited,
            url: character.url
          };
        })
      );

      return characters;
    } catch (error) {
      console.error('Error fetching characters:', error);
      if (error instanceof Error) {
        throw new Error(`Error fetching characters: ${error.message}`);
      }
      throw new Error('Error fetching characters');
    }
  }
}
