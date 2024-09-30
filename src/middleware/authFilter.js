const { UnauthorizedError } = require('./errors');
const { verifyToken } = require('../client/authClient');
const logger = require('../utils/logger');

const authFilter = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.error('No authorization header provided');
    return next(new UnauthorizedError('No authorization header provided'));
  }

  const token = authHeader.split(' ')[1]; // Remove 'Bearer' prefix

  try {
    const response = await verifyToken(token);

    if (response.success) {
      req.accessToken = token;
      next();
    } else {
      logger.error('Invalid access token');
      next(new UnauthorizedError('Invalid access token'));
    }
  } catch (error) {
    if (error.response) {
      logger.error('Token verification failed:', error.response.data);
      next(new UnauthorizedError(error.response.data.message || 'Token verification failed'));
    } else if (error.request) {
      logger.error('No response received from authentication server:', error.request);
      next(new UnauthorizedError('No response received from authentication server'));
    } else {
      logger.error('Error occurred during authentication:', error.message);
      next(new UnauthorizedError('Error occurred during authentication'));
    }
  }
};

module.exports = authFilter;
