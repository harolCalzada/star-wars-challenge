import axios from 'axios';
import { environment } from '../../http/config/environment';
import { CacheService } from '../cache/CacheService';

export interface MovieDetails {
  id: number;
  title: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string;
  overview: string;
}

export class TMDBService {
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  private readonly apiKey = environment.tmdb.apiKey;
  private movieMapping: { [key: string]: number } = {};
  private readonly cache = CacheService.getInstance('tmdb');
  
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Iniciar el proceso de inicialización inmediatamente
    this.initializationPromise = this.initializeMovieMapping();
  }

  private async initializeMovieMapping(): Promise<void> {
    const starWarsMovies = [
      { swapiUrl: 'https://swapi.dev/api/films/1/', title: 'Star Wars', year: 1977 },  // Episode IV
      { swapiUrl: 'https://swapi.dev/api/films/2/', title: 'The Empire Strikes Back', year: 1980 },  // Episode V
      { swapiUrl: 'https://swapi.dev/api/films/3/', title: 'Return of the Jedi', year: 1983 },  // Episode VI
      { swapiUrl: 'https://swapi.dev/api/films/4/', title: 'The Phantom Menace', year: 1999 },  // Episode I
      { swapiUrl: 'https://swapi.dev/api/films/5/', title: 'Attack of the Clones', year: 2002 },  // Episode II
      { swapiUrl: 'https://swapi.dev/api/films/6/', title: 'Revenge of the Sith', year: 2005 }  // Episode III
    ];

    try {
      for (const movie of starWarsMovies) {
        const response = await axios.get(`${this.baseUrl}/search/movie`, {
          params: {
            query: movie.title,
            year: movie.year
          },
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        });

        if (response.data.results && response.data.results.length > 0) {
          this.movieMapping[movie.swapiUrl] = response.data.results[0].id;
        }
      }
      console.log('Movie mapping initialized:', this.movieMapping);
    } catch (error) {
      console.error('Error initializing movie mapping:', error);
    }
  }

  async getMovieDetails(swapiUrl: string): Promise<MovieDetails | null> {
    console.log('Getting movie details for SWAPI URL:', swapiUrl);
    
    // Esperar a que el mapeo se inicialice si aún no está listo
    if (!this.initialized && this.initializationPromise) {
      await this.initializationPromise;
      this.initialized = true;
    }
    
    const tmdbId = this.movieMapping[swapiUrl];
    console.log('TMDB ID:', tmdbId);
    if (!tmdbId) return null;

    // Intentar obtener del caché primero
    const cacheKey = `movie:${tmdbId}`;
    const cachedMovie = await this.cache.get<MovieDetails>(cacheKey);
    if (cachedMovie) {
      console.log('Movie details found in cache');
      return cachedMovie;
    }

    try {
      console.log('Movie not in cache, fetching from TMDB API');
      const response = await axios.get(`${this.baseUrl}/movie/${tmdbId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        }
      });

      const movieDetails: MovieDetails = {
        id: response.data.id,
        title: response.data.title,
        posterPath: `https://image.tmdb.org/t/p/w500${response.data.poster_path}`,
        backdropPath: `https://image.tmdb.org/t/p/original${response.data.backdrop_path}`,
        releaseDate: response.data.release_date,
        overview: response.data.overview
      };

      // Guardar en caché
      await this.cache.set(cacheKey, movieDetails);
      return movieDetails;
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
