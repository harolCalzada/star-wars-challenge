import axios from 'axios';
import { environment } from '../../http/config/environment';

export interface MovieDetails {
  id: number;
  title: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string;
  overview: string;
}

export class TMDBService {
  private readonly baseUrl = 'https://api.themoviedb.org/';
  private readonly apiKey = environment.tmdb.apiKey;
  
  
  // Mapeo de URLs de SWAPI a IDs de TMDB
  private readonly movieMapping: { [key: string]: number } = {
    'https://swapi.dev/api/films/1/': 11, // Episode IV
    'https://swapi.dev/api/films/2/': 5,  // Episode V
    'https://swapi.dev/api/films/3/': 1,  // Episode VI
    'https://swapi.dev/api/films/4/': 4,  // Episode I
    'https://swapi.dev/api/films/5/': 3,  // Episode II
    'https://swapi.dev/api/films/6/': 2   // Episode III
  };

  async getMovieDetails(swapiUrl: string): Promise<MovieDetails | null> {
    console.log('Getting movie details for SWAPI URL:', swapiUrl);
    console.log('API Key:', this.apiKey);
    const tmdbId = this.movieMapping[swapiUrl];
    console.log('TMDB ID:', tmdbId);
    if (!tmdbId) return null;

    try {
      const response = await axios.get(`${this.baseUrl}/movie/${tmdbId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        }
      });

      return {
        id: response.data.id,
        title: response.data.title,
        posterPath: `https://image.tmdb.org/t/p/w500${response.data.poster_path}`,
        backdropPath: `https://image.tmdb.org/t/p/original${response.data.backdrop_path}`,
        releaseDate: response.data.release_date,
        overview: response.data.overview
      };
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  }

  async getMoviesDetails(swapiUrls: string[]): Promise<MovieDetails[]> {
    console.log('Getting details for movies:', swapiUrls);
    const promises = swapiUrls.map(url => this.getMovieDetails(url));
    const results = await Promise.all(promises);
    const filteredResults = results.filter((movie): movie is MovieDetails => movie !== null);
    console.log('Final movie details:', filteredResults);
    return filteredResults;
  }
}
