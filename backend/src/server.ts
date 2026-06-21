import app from './app';
import { env } from './config/env';
import { connectDB } from './config/database';
import { logger } from './config/logger';

const startServer = async (): Promise<void> => {
  // Connect to PostgreSQL database
  await connectDB();

  const port = env.PORT;
  app.listen(port, () => {
    logger.info(`🚀 Server running on port ${port} in ${env.NODE_ENV} mode`);
  });
};

startServer().catch((err) => {
  logger.error('❌ Failed to start server:', err);
  process.exit(1);
});
