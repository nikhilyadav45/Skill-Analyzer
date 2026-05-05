import app from './app';
import { env } from './common/config/env';
import { logger } from './common/utils/logger';

const startServer = async () => {
  try {
    app.listen(env.PORT, () => {
      logger.info(`=================================`);
      logger.info(`🚀 Server listening on port ${env.PORT}`);
      logger.info(`=================================`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
