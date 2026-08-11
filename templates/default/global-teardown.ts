import { logger } from './utils/logger';

export default async function globalTeardown(): Promise<void> {
  logger.application.browser('Browser closed');
  logger.application.startup('Framework shutting down');
}
