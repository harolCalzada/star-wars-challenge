import { CharacterService } from '../../application/services/CharacterService';
import { Character } from '../../domain/entities/Character';
import { ICharacterRepository } from '../../domain/ports/repositories/ICharacterRepository';
import { IStarWarsAPI } from '../../domain/ports/services/IStarWarsAPI';
import { CacheService } from '../../infrastructure/adapters/cache/CacheService';

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

const mockCharacter: Character = {
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

describe('CharacterService', () => {
  let service: CharacterService;
  let mockRepository: jest.Mocked<ICharacterRepository>;
  let mockStarWarsAPI: jest.Mocked<IStarWarsAPI>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    mockRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findAll: jest.fn().mockResolvedValue([]),
      save: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    } as jest.Mocked<ICharacterRepository>;

    mockStarWarsAPI = {
      getCharacter: jest.fn().mockResolvedValue(mockCharacter),
      getCharactersByPage: jest.fn().mockResolvedValue([mockCharacter]),
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
    const mockCharacter: Character = {
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

    it('should return character from repository if available', async () => {
      // Mock cache miss
      const mockCache = CacheService.getInstance('character');
      (mockCache.get as jest.Mock).mockResolvedValueOnce(null);
      
      // Mock repository hit
      mockRepository.findById.mockResolvedValueOnce(mockCharacter);

      const result = await service.getCharacter('1');

      expect(result).toEqual(mockCharacter);
      expect(mockCache.get).toHaveBeenCalledWith('character:1');
      expect(mockRepository.findById).toHaveBeenCalledWith('1', 'character');
      expect(mockCache.set).toHaveBeenCalledWith('character:1', mockCharacter);
    });

    it('should fetch character from Star Wars API if not in repository', async () => {
      // Mock cache miss
      const mockCache = CacheService.getInstance('character');
      (mockCache.get as jest.Mock).mockResolvedValueOnce(null);
      
      // Mock repository miss
      mockRepository.findById.mockResolvedValueOnce(null);
      
      // Mock API hit
      mockStarWarsAPI.getCharacter.mockResolvedValueOnce(mockCharacter);

      const result = await service.getCharacter('1');

      expect(result).toEqual(mockCharacter);
      expect(mockCache.get).toHaveBeenCalledWith('character:1');
      expect(mockRepository.findById).toHaveBeenCalledWith('1', 'character');
      expect(mockStarWarsAPI.getCharacter).toHaveBeenCalledWith('1');
      expect(mockRepository.save).toHaveBeenCalledWith(mockCharacter);
      expect(mockCache.set).toHaveBeenCalledWith('character:1', mockCharacter);
    });
  });

  describe('getCharactersByPage', () => {
    it('should fetch characters from Star Wars API', async () => {
      const mockCharacters = [mockCharacter];
      
      // Mock cache miss
      const mockCache = CacheService.getInstance('character');
      (mockCache.get as jest.Mock).mockResolvedValueOnce(null);
      
      // Mock API hit
      mockStarWarsAPI.getCharactersByPage.mockResolvedValue(mockCharacters);

      const result = await service.getCharactersByPage(1);

      expect(result).toEqual(mockCharacters);
      expect(mockCache.get).toHaveBeenCalledWith('characters:page:1');
      expect(mockStarWarsAPI.getCharactersByPage).toHaveBeenCalledWith(1);
      expect(mockCache.set).toHaveBeenCalledWith('characters:page:1', mockCharacters);
    });
  });
});
