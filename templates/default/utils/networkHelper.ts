import type { Request, Response } from '@playwright/test';
import { logger } from '../utils/logger';

export class NetworkLogger {
  static onRequest(request: Request): void {
    const method = request.method();
    const url = request.url();
    const headers = request.headers();

    logger.network.request(`${method} ${url}`);
    logger.ui.navigation(`Request: ${method} ${url}`);

    const postData = request.postDataJSON() || request.postData();
    if (postData) {
      logger.api.request(`POST ${url} | Payload: ${typeof postData === 'string' ? postData : JSON.stringify(postData)}`);
    }

    logger.debug.variable(`Request headers for ${url}: ${JSON.stringify(headers)}`);
  }

  static onResponse(response: Response): void {
    const url = response.url();
    const status = response.status();
    const ok = response.ok();

    logger.network.response(`${response.request().method()} ${url}`);
    logger.network.status(`Status: ${status} for ${url}`);

    if (!ok) {
      logger.network.failed(`Status ${status} for ${url}`);
    }

    const contentType = response.headers()['content-type'] || '';

    if (contentType.includes('application/json')) {
      response.text().then((body) => {
        logger.api.response(`Response for ${url}: ${body}`);
      }).catch(() => undefined);
    }

    logger.api.timing(`Response time for ${url}`);

    logger.debug.variable(`Response headers for ${url}: ${JSON.stringify(response.headers())}`);
  }

  static onFailedResponse(response: Response): void {
    const url = response.url();
    const status = response.status();
    logger.network.failed(`Failed response ${status} for ${url}`);
    logger.error.exception(`Network error ${status} for ${url}`);
  }
}
