import axios from 'axios';
import https from 'https';
import { Character } from '../../../domain/entities/Character';
import { IStarWarsAPI } from '../../../domain/ports/services/IStarWarsAPI';
import { TMDBService } from './TMDBService';

// Create an axios instance with custom configuration to handle self-signed certificates
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  })
});

export class StarWarsAPIService implements IStarWarsAPI {
  private readonly tmdbService: TMDBService;
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = 'http://swapi.dev/api';
    this.tmdbService = new TMDBService();
  }

  private extractIdFromUrl(url: string): string {
    const matches = url.match(/\/people\/(\d+)/);
    return matches ? matches[1] : '';
  }

  private async transformResponse(data: any): Promise<Character> {
    console.log('Films from SWAPI:', data.films);
    const movieDetails = await this.tmdbService.getMoviesDetails(data.films);
    console.log('Movie details from TMDB:', movieDetails);
    
    return {
      id: this.extractIdFromUrl(data.url),
      name: data.name,
      height: data.height,
      mass: data.mass,
      hairColor: data.hair_color,
      skinColor: data.skin_color,
      eyeColor: data.eye_color,
      birthYear: data.birth_year,
      gender: data.gender,
      homeworld: data.homeworld,
      films: data.films,
      movieDetails,
      species: data.species,
      vehicles: data.vehicles,
      starships: data.starships,
      created: data.created,
      edited: data.edited,
      url: data.url
    };
  }

  async getCharacter(id: string): Promise<Character> {
    try {
      console.log(`Fetching character ${id}`);
      const response = await axiosInstance.get(`${this.baseUrl}/people/${id}/`);
      console.log('SWAPI response:', response.data);
      return await this.transformResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Character with id ${id} not found`);
      }
      throw error;
    }
  }

  async getFirstPageCharacters(): Promise<Character[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/people/`);
      console.log('Characters:', response.data);
      const characters = await Promise.all(
        response.data.results.map((character: any) => this.transformResponse(character))
      );
      return characters;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching characters: ${error.message}`);
      }
      throw new Error('Error fetching characters');
    }
  }
}
