import { CharacterController } from '../../infrastructure/http/controllers/CharacterController';
import { CharacterService } from '../../application/services/CharacterService';
import { Character } from '../../domain/entities/Character';

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

const mockCharacter2: Character = {
  id: '2',
  name: 'Leia Organa',
  height: '150',
  mass: '49',
  hairColor: 'brown',
  skinColor: 'fair',
  eyeColor: 'brown',
  birthYear: '19BBY',
  gender: 'female',
  homeworld: 'Alderaan',
  films: ['A New Hope'],
  species: [],
  vehicles: [],
  starships: [],
  created: '2025-04-16T10:00:00Z',
  edited: '2025-04-16T10:00:00Z',
  url: 'https://swapi.dev/api/people/2/'
};

describe('CharacterController', () => {
  let controller: CharacterController;
  let mockService: jest.Mocked<CharacterService>;
  let mockRequest: any;
  let mockReply: any;

  beforeEach(() => {
    mockService = {
      getCharacter: jest.fn().mockResolvedValue(mockCharacter),
      getCharactersByPage: jest.fn().mockResolvedValue([mockCharacter, mockCharacter2])
    } as unknown as jest.Mocked<CharacterService>;

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
      notFound: jest.fn().mockImplementation(() => {
        mockReply.code(404);
        return mockReply;
      }),
      internalServerError: jest.fn(),
    };

    mockRequest = {
      log: { error: jest.fn() },
      params: {},
      query: {},
    };

    controller = new CharacterController(mockService);
  });

  describe('getCharacter', () => {
    it('should return character data successfully', async () => {
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

      mockRequest.params = { id: '1' };
      mockService.getCharacter.mockResolvedValue(mockCharacter);

      await controller.getCharacter(mockRequest, mockReply);

      expect(mockService.getCharacter).toHaveBeenCalledWith('1');
      expect(mockReply.send).toHaveBeenCalledWith(expect.objectContaining({
        id: mockCharacter.id,
        name: mockCharacter.name,
        height: mockCharacter.height,
        mass: mockCharacter.mass,
        hairColor: mockCharacter.hairColor,
        skinColor: mockCharacter.skinColor,
        eyeColor: mockCharacter.eyeColor,
        birthYear: mockCharacter.birthYear,
        gender: mockCharacter.gender,
        homeworld: mockCharacter.homeworld,
        films: mockCharacter.films,
        species: mockCharacter.species,
        vehicles: mockCharacter.vehicles,
        starships: mockCharacter.starships,
        url: mockCharacter.url
      }));
    });

    it('should return 404 when character is not found', async () => {
      mockRequest.params = { id: '999' };
      mockService.getCharacter.mockResolvedValue(null as unknown as Character);

      await controller.getCharacter(mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Character not found' });
    });

    it('should handle errors appropriately', async () => {
      mockRequest.params = { id: '1' };
      mockService.getCharacter.mockRejectedValue(new Error('Service error'));

      await controller.getCharacter(mockRequest, mockReply);

      expect(mockRequest.log.error).toHaveBeenCalled();
      expect(mockReply.internalServerError).toHaveBeenCalledWith('Error fetching character');
    });
  });

  describe('getCharactersByPage', () => {
    it('should return paginated character list', async () => {
      const mockList = {
        characters: [
          { id: '1', name: 'Luke' },
          { id: '2', name: 'Leia' }
        ],
        total: 2,
        page: 1,
        limit: 10
      };

      mockRequest.query = { page: 1, limit: 10 };
      mockService.getCharactersByPage.mockResolvedValue([mockCharacter, mockCharacter2]);

      await controller.getCharactersByPage(mockRequest, mockReply);

      expect(mockService.getCharactersByPage).toHaveBeenCalledWith(1);
      expect(mockReply.send).toHaveBeenCalled();
    });

    it('should handle errors in list retrieval', async () => {
      mockRequest.query = { page: 1, limit: 10 };
      mockService.getCharactersByPage.mockRejectedValue(new Error('Service error'));

      await controller.getCharactersByPage(mockRequest, mockReply);

      expect(mockRequest.log.error).toHaveBeenCalled();
      expect(mockReply.internalServerError).toHaveBeenCalledWith('Error fetching characters');
    });
  });
});
