import { GenericDataService } from '../../application/services/GenericDataService';
import { IGenericRepository } from '../../domain/ports/repositories/IGenericRepository';

describe('GenericDataService', () => {
  let service: GenericDataService;
  let mockRepository: jest.Mocked<IGenericRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };
    service = new GenericDataService(mockRepository);
  });

  describe('getExternalApiHistory', () => {
    it('should return combined and sorted data from characters and movies', async () => {
      const mockCharacters = [
        { id: '1', type: 'character', name: 'Luke', createdAt: '2025-04-16T10:00:00Z' },
        { id: '2', type: 'character', name: 'Leia', createdAt: '2025-04-16T09:00:00Z' }
      ];
      const mockMovies = [
        { id: '3', type: 'movie', title: 'A New Hope', createdAt: '2025-04-16T11:00:00Z' }
      ];

      mockRepository.findAll.mockImplementation((type) => {
        if (type === 'character') return Promise.resolve(mockCharacters);
        if (type === 'movie') return Promise.resolve(mockMovies);
        return Promise.resolve([]);
      });

      const result = await service.getExternalApiHistory();

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('3'); // Most recent first (movie)
      expect(result[1].id).toBe('1'); // Second most recent (Luke)
      expect(result[2].id).toBe('2'); // Oldest (Leia)

      expect(mockRepository.findAll).toHaveBeenCalledWith('character');
      expect(mockRepository.findAll).toHaveBeenCalledWith('movie');
    });

    it('should handle empty results', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.getExternalApiHistory();

      expect(result).toHaveLength(0);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(2);
    });
  });
});
