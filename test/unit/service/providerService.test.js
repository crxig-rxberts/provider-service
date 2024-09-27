const ProviderService = require('../../../src/service/providerService');
const { NotFoundError } = require('../../../src/middleware/errors');
const { documentClient } = require('../../../src/config/dynamodb');

jest.mock('../../../src/config/dynamodb', () => ({
  documentClient: {
    put: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  TABLE_NAME: 'MockTableName'
}));
jest.mock('../../../src/utils/logger');


describe('ProviderService', () => {
  const mockProvider = {
    userSub: 'test-user-sub',
    providerName: 'Test Provider',
    category: 'Test Category',
    availability: {},
    timeSlotLength: 30,
    services: [{ name: 'Test Service', price: 100 }],
    searchId: 'test-search-id',
    providerImage: 'test-image-url'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProvider', () => {
    it('should create a provider successfully', async () => {
      documentClient.put.mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
      });

      const result = await ProviderService.createProvider(mockProvider);

      expect(documentClient.put).toHaveBeenCalled();

      // Check that all properties from mockProvider are present in the result
      expect(result).toMatchObject(mockProvider);

      // Check that services array has the correct length
      expect(result.services).toHaveLength(mockProvider.services.length);

      // Check that each service in the result has an id and matches the original service
      result.services.forEach((service, index) => {
        expect(service).toMatchObject(mockProvider.services[index]);
        expect(service).toHaveProperty('id');
        expect(typeof service.id).toBe('string');
      });
    });

    it('should throw an error if creation fails', async () => {
      documentClient.put.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      await expect(ProviderService.createProvider(mockProvider)).rejects.toThrow('DB Error');
    });
  });

  describe('getProvider', () => {
    it('should get a provider successfully', async () => {
      documentClient.get.mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Item: mockProvider })
      });

      const result = await ProviderService.getProvider(mockProvider.userSub);

      expect(documentClient.get).toHaveBeenCalledWith(expect.objectContaining({
        Key: { userSub: mockProvider.userSub }
      }));
      expect(result).toEqual(mockProvider);
    });

    it('should throw NotFoundError if provider does not exist', async () => {
      documentClient.get.mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
      });

      await expect(ProviderService.getProvider(mockProvider.userSub)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateProvider', () => {
    it('should update a provider successfully', async () => {
      const updatedProvider = { ...mockProvider, providerName: 'Updated Provider' };
      documentClient.update.mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Attributes: updatedProvider })
      });

      const result = await ProviderService.updateProvider(mockProvider.userSub, updatedProvider);

      expect(documentClient.update).toHaveBeenCalled();
      expect(result).toEqual(updatedProvider);
    });

    it('should throw an error if update fails', async () => {
      documentClient.update.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      await expect(ProviderService.updateProvider(mockProvider.userSub, mockProvider)).rejects.toThrow('DB Error');
    });
  });

  describe('deleteProvider', () => {
    it('should delete a provider successfully', async () => {
      documentClient.delete.mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
      });

      await ProviderService.deleteProvider(mockProvider.userSub);

      expect(documentClient.delete).toHaveBeenCalledWith(expect.objectContaining({
        Key: { userSub: mockProvider.userSub }
      }));
    });

    it('should throw an error if deletion fails', async () => {
      documentClient.delete.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      await expect(ProviderService.deleteProvider(mockProvider.userSub)).rejects.toThrow('DB Error');
    });
  });
});
