const request = require('supertest');
const app = require('../../src/app');
const { documentClient } = require('../../src/config/dynamodb');
const { verifyToken } = require('../../src/client/authClient');

jest.mock('../../src/config/dynamodb');
jest.mock('../../src/utils/logger');
jest.mock('../../src/client/authClient');

describe('Provider API Integration Tests', () => {
  const mockProvider = {
    userSub: 'test-user-sub',
    providerName: 'Test Provider',
    category: 'Test Category',
    availability: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [],
      sunday: []
    },
    timeSlotLength: 30,
    services: [{ name: 'Test Service', price: 100 }],
    searchId: 'test-search-id',
    providerImage: 'https://example.com/test-image.jpg'
  };


  const mockToken = 'mock-token';

  beforeEach(() => {
    jest.clearAllMocks();
    verifyToken.mockResolvedValue({ success: true });
  });

  describe('POST /api/providers', () => {
    it('should create a new provider', async () => {
      documentClient.put.mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
      });

      const response = await request(app)
        .post('/api/providers')
        .send(mockProvider)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(mockProvider);
      expect(response.body.data.services[0]).toHaveProperty('id');
    });

    it('should return 400 for invalid input', async () => {
      const invalidProvider = { ...mockProvider, providerName: null };

      const response = await request(app)
        .post('/api/providers')
        .send(invalidProvider)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('"providerName" must be a string');
    });
  });

  describe('GET /api/providers/:userSub', () => {
    it('should get an existing provider with valid token', async () => {
      documentClient.get.mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Item: mockProvider })
      });

      const response = await request(app)
        .get(`/api/providers/${mockProvider.userSub}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProvider);
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get(`/api/providers/${mockProvider.userSub}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No authorization header provided');
    });

    it('should return 401 for invalid token', async () => {
      verifyToken.mockResolvedValue({ success: false });

      const response = await request(app)
        .get(`/api/providers/${mockProvider.userSub}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid access token');
    });

    it('should return 404 for non-existent provider', async () => {
      documentClient.get.mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
      });

      const response = await request(app)
        .get('/api/providers/non-existent-sub')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Provider not found');
    });
  });

  describe('PUT /api/providers/:userSub', () => {
    it('should update an existing provider with valid token', async () => {
      const updatedProvider = { ...mockProvider, providerName: 'Updated Provider' };
      documentClient.update.mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Attributes: updatedProvider })
      });

      const response = await request(app)
        .put(`/api/providers/${mockProvider.userSub}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updatedProvider)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedProvider);
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .put(`/api/providers/${mockProvider.userSub}`)
        .send(mockProvider)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No authorization header provided');
    });

    it('should return 400 for invalid input', async () => {
      const invalidProvider = { ...mockProvider, timeSlotLength: 'invalid' };

      const response = await request(app)
        .put(`/api/providers/${mockProvider.userSub}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidProvider)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('"timeSlotLength" must be a number');
    });
  });

  describe('DELETE /api/providers/:userSub', () => {
    it('should delete an existing provider with valid token', async () => {
      documentClient.delete.mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
      });

      const response = await request(app)
        .delete(`/api/providers/${mockProvider.userSub}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Provider deleted successfully');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .delete(`/api/providers/${mockProvider.userSub}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No authorization header provided');
    });

    it('should return 500 if deletion fails', async () => {
      documentClient.delete.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      const response = await request(app)
        .delete(`/api/providers/${mockProvider.userSub}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Internal server error');
    });
  });
});
