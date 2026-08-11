import type { ConsoleMessage } from '@playwright/test';
import { logger } from '../utils/logger';

export class ConsoleLogger {
  static handleMessage(message: ConsoleMessage): void {
    const type = message.type();
    const text = message.text();
    const url = message.location()?.url ?? 'unknown';

    switch (type) {
      case 'error':
        logger.error.exception(`Console error [${url}]: ${text}`);
        break;
      case 'warning':
        logger.warning.slowElement(`Console warning [${url}]: ${text}`);
        break;
      default:
        logger.debug.internal(`Console ${type} [${url}]: ${text}`);
    }
  }

  static handlePageError(error: Error): void {
    logger.error.exception(`Page error: ${error.message}`);
  }
}
