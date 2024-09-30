const ProviderController = require('../../../src/controller/providerController');
const { NotFoundError } = require('../../../src/middleware/errors');
const ProviderService = require('../../../src/service/providerService');
const { formatResponse } = require('../../../src/utils/formatResponse');

jest.mock('../../../src/service/providerService');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/utils/formatResponse');

describe('ProviderController', () => {
  const mockProvider = {
    userSub: 'test-user-sub',
    providerName: 'Test Provider',
    category: 'Test Category',
    availability: {},
    timeSlotLength: 30,
    services: [{ name: 'Test Service', cost: 100 }],
    searchId: 'test-search-id',
    providerImage: 'test-image-url'
  };

  const mockReq = {
    body: mockProvider,
    params: { userSub: mockProvider.userSub }
  };

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    formatResponse.mockImplementation((message, data) => ({ message, data }));
  });

  describe('createProvider', () => {
    it('should create a provider successfully', async () => {
      ProviderService.createProvider.mockResolvedValue(mockProvider);

      await ProviderController.createProvider(mockReq, mockRes, mockNext);

      expect(ProviderService.createProvider).toHaveBeenCalledWith(mockProvider);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Provider created successfully',
        data: mockProvider
      });
    });

    it('should call next with error if creation fails', async () => {
      const error = new Error('Creation failed');
      ProviderService.createProvider.mockRejectedValue(error);

      await ProviderController.createProvider(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getProvider', () => {
    it('should get a provider successfully', async () => {
      ProviderService.getProvider.mockResolvedValue(mockProvider);

      await ProviderController.getProvider(mockReq, mockRes, mockNext);

      expect(ProviderService.getProvider).toHaveBeenCalledWith(mockProvider.userSub);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Provider retrieved successfully',
        data: mockProvider
      });
    });

    it('should call next with error if provider is not found', async () => {
      const error = new NotFoundError('Provider not found');
      ProviderService.getProvider.mockRejectedValue(error);

      await ProviderController.getProvider(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProvider', () => {
    it('should update a provider successfully', async () => {
      ProviderService.updateProvider.mockResolvedValue(mockProvider);

      await ProviderController.updateProvider(mockReq, mockRes, mockNext);

      expect(ProviderService.updateProvider).toHaveBeenCalledWith(mockProvider.userSub, mockProvider);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Provider updated successfully',
        data: mockProvider
      });
    });

    it('should call next with error if update fails', async () => {
      const error = new Error('Update failed');
      ProviderService.updateProvider.mockRejectedValue(error);

      await ProviderController.updateProvider(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteProvider', () => {
    it('should delete a provider successfully', async () => {
      ProviderService.deleteProvider.mockResolvedValue();

      await ProviderController.deleteProvider(mockReq, mockRes, mockNext);

      expect(ProviderService.deleteProvider).toHaveBeenCalledWith(mockProvider.userSub);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Provider deleted successfully'
      });
    });

    it('should call next with error if deletion fails', async () => {
      const error = new Error('Deletion failed');
      ProviderService.deleteProvider.mockRejectedValue(error);

      await ProviderController.deleteProvider(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
