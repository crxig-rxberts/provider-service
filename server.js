const app = require('./src/app');
const logger = require('./src/utils/logger');
const { initializeDynamoDB } = require('./src/config/dynamodb');

const port = process.env.PORT || 3004;

async function startServer() {
  try {
    logger.info('Starting Server');
    await initializeDynamoDB();
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
module.exports = { startServer };
