const { startServer } = require('../../server');
const app = require('../../src/app');
const logger = require('../../src/utils/logger');
const { initializeDynamoDB } = require('../../src/config/dynamodb');

jest.mock('../../src/app', () => ({
  listen: jest.fn()
}));
jest.mock('../../src/utils/logger');
jest.mock('../../src/config/dynamodb');

describe('Server Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PORT = '3004';
  });

  test('starts server successfully', async () => {
    app.listen.mockImplementation((port, callback) => {
      callback();
      return { address: () => ({ port }) };
    });

    await startServer();

    expect(logger.info).toHaveBeenCalledWith('Starting Server');
    expect(initializeDynamoDB).toHaveBeenCalled();
    expect(app.listen).toHaveBeenCalledWith(3004, expect.any(Function));
    expect(logger.info).toHaveBeenCalledWith('Server running on port 3004');
  });

  test('handles server start failure', async () => {
    const mockError = new Error('Failed to start server');
    initializeDynamoDB.mockRejectedValue(mockError);

    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

    try {
      await startServer();
    } catch (error) {
      logger.error(error);
    }

    expect(logger.error).toHaveBeenCalledWith('Failed to start server', { error: mockError });
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
  });
});
