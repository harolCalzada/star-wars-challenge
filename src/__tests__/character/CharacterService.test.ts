import { CharacterService } from '../../application/services/CharacterService';
import { Character } from '../../domain/entities/Character';
import { ICharacterRepository } from '../../domain/ports/repositories/ICharacterRepository';
import { IStarWarsAPI } from '../../domain/ports/services/IStarWarsAPI';
import { CacheService } from '../../infrastructure/adapters/cache/CacheService';
import { TMDBService } from '../../infrastructure/adapters/services/TMDBService';

// Mock TMDBService
jest.mock('../../infrastructure/adapters/services/TMDBService', () => {
  const mockInstance = {
    getMoviesDetails: jest.fn().mockResolvedValue([{
      id: 11,
      title: 'Star Wars: Episode IV - A New Hope',
      overview: 'Mock overview',
      posterPath: '/mock-poster.jpg',
      backdropPath: '/mock-backdrop.jpg',
      releaseDate: '1977-05-25'
    }])
  };

  return {
    TMDBService: {
      getInstance: jest.fn().mockReturnValue(mockInstance)
    }
  };
});

// Mock CacheService
jest.mock('../../infrastructure/adapters/cache/CacheService', () => {
  return {
    CacheService: {
      getInstance: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue(undefined),
      }),
    },
  };
});

const baseCharacter: Character = {
  id: '1',
  name: 'Luke Skywalker',
  height: '172',
  mass: '77',
  hairColor: 'blond',
  skinColor: 'fair',
  eyeColor: 'blue',
  birthYear: '19BBY',
  gender: 'male',
  homeworld: 'Tatooine',
  films: ['A New Hope'],
  species: [],
  vehicles: [],
  starships: [],
  created: '2025-04-16T10:00:00Z',
  edited: '2025-04-16T10:00:00Z',
  url: 'https://swapi.dev/api/people/1/'
};

const mockCharacters = [baseCharacter];

const characterWithMovies: Character = {
  ...baseCharacter,
  movieDetails: [{
    id: 11,
    title: 'Star Wars: Episode IV - A New Hope',
    overview: 'Mock overview',
    posterPath: '/mock-poster.jpg',
    backdropPath: '/mock-backdrop.jpg',
    releaseDate: '1977-05-25'
  }]
};

describe('CharacterService', () => {
  let service: CharacterService;
  let mockRepository: jest.Mocked<ICharacterRepository>;
  let mockStarWarsAPI: jest.Mocked<IStarWarsAPI>;




  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      save: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    } as jest.Mocked<ICharacterRepository>;

    mockStarWarsAPI = {
      getCharacter: jest.fn().mockResolvedValue(baseCharacter),
      getCharactersByPage: jest.fn().mockResolvedValue([baseCharacter]),
    } as jest.Mocked<IStarWarsAPI>;

    // Reset cache mock
    (CacheService.getInstance as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    });

    service = new CharacterService(
      mockRepository,
      mockStarWarsAPI
    );
  });

  describe('getCharacter', () => {
    it('should return character from repository if available', async () => {
      const mockCache = CacheService.getInstance('character');
      (mockCache.get as jest.Mock).mockResolvedValueOnce(null);
      
      // Mock repository hit
      mockRepository.findById.mockResolvedValueOnce(characterWithMovies);

      const result = await service.getCharacter('1');

      expect(result).toEqual(characterWithMovies);
      expect(mockCache.get).toHaveBeenCalledWith('character:1');
      expect(mockRepository.findById).toHaveBeenCalledWith('1', 'character');
      expect(mockCache.set).toHaveBeenCalledWith('character:1', characterWithMovies);
    });

    it('should fetch character from Star Wars API if not in repository', async () => {
      // Mock cache miss
      const mockCache = CacheService.getInstance('character');
      (mockCache.get as jest.Mock).mockResolvedValueOnce(null);
      
      // Mock repository miss
      mockRepository.findById.mockResolvedValueOnce(null);
      
      // Mock API hit
      mockStarWarsAPI.getCharacter.mockResolvedValueOnce(baseCharacter);

      const result = await service.getCharacter('1');

      expect(result).toEqual(characterWithMovies);
      expect(mockCache.get).toHaveBeenCalledWith('character:1');
      expect(mockRepository.findById).toHaveBeenCalledWith('1', 'character');
      expect(mockStarWarsAPI.getCharacter).toHaveBeenCalledWith('1');
      expect(mockRepository.save).toHaveBeenCalledWith(characterWithMovies);
      expect(mockCache.set).toHaveBeenCalledWith('character:1', characterWithMovies);
    });
  });

  describe('getCharactersByPage', () => {
    it('should fetch characters from Star Wars API', async () => {
      const pageCharacters = [baseCharacter];
      
      // Mock cache miss
      const mockCache = CacheService.getInstance('character');
      (mockCache.get as jest.Mock).mockResolvedValueOnce(null);
      
      // Mock API hit
      mockStarWarsAPI.getCharactersByPage.mockResolvedValue(pageCharacters);

      const result = await service.getCharactersByPage(1);

      expect(result).toEqual(pageCharacters);
      expect(mockCache.get).toHaveBeenCalledWith('characters:page:1');
      expect(mockStarWarsAPI.getCharactersByPage).toHaveBeenCalledWith(1);
      expect(mockCache.set).toHaveBeenCalledWith('characters:page:1', pageCharacters);
    });
  });
});
