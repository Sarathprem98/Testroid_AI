import { logger } from './utils/logger';

export default async function globalSetup(): Promise<void> {
  logger.application.startup('Framework starting up');
  logger.application.browser('Browser launch initiated');
}
