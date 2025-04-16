import { GenericDataController } from '../../infrastructure/http/controllers/GenericDataController';
import { GenericDataService } from '../../application/services/GenericDataService';

describe('GenericDataController', () => {
  let controller: GenericDataController;
  let mockService: jest.Mocked<GenericDataService>;
  let mockRequest: any;
  let mockReply: any;

  beforeEach(() => {
    mockService = {
      getData: jest.fn(),
      getAllData: jest.fn(),
      saveData: jest.fn(),
      getExternalApiHistory: jest.fn(),
    } as any;

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      internalServerError: jest.fn().mockReturnThis(),
      notFound: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      log: { error: jest.fn() },
    };

    controller = new GenericDataController(mockService);
  });

  describe('getExternalApiHistory', () => {
    it('should return history data successfully', async () => {
      const mockHistory = [
        { id: '1', type: 'character', name: 'Luke', createdAt: '2025-04-16T10:00:00Z' },
        { id: '2', type: 'movie', title: 'A New Hope', createdAt: '2025-04-16T09:00:00Z' }
      ];

      mockService.getExternalApiHistory.mockResolvedValue(mockHistory);

      await controller.getExternalApiHistory(mockRequest, mockReply);

      expect(mockService.getExternalApiHistory).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalledWith(mockHistory);
    });

    it('should handle errors appropriately', async () => {
      const error = new Error('Database error');
      mockService.getExternalApiHistory.mockRejectedValue(error);

      await controller.getExternalApiHistory(mockRequest, mockReply);

      expect(mockRequest.log.error).toHaveBeenCalledWith(error);
      expect(mockReply.internalServerError).toHaveBeenCalledWith('Error fetching history');
    });
  });
});
