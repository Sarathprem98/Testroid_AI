import type { Request, Response } from '@playwright/test';
import { logger } from '../utils/logger';

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

// Third-party requests (analytics/ads/tracking beacons — Facebook Pixel, Google Ads,
// Clevertap, etc.) still execute normally; this only controls whether NetworkLogger writes
// about them. Logging every one of them floods the log with noise unrelated to the app
// under test. Opt in via LOG_THIRD_PARTY_REQUESTS=true in .env.
const logThirdPartyRequests = toBoolean(process.env.LOG_THIRD_PARTY_REQUESTS, false);

function hostnameOf(url: string): string | undefined {
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

// BASE_URL's hostname, resolved once at module load. Undefined if BASE_URL isn't set — with
// nothing to compare against, every request is treated as first-party so logging behaves as
// it always has rather than going silently empty.
const baseHostname = process.env.BASE_URL ? hostnameOf(process.env.BASE_URL) : undefined;

function isFirstParty(url: string): boolean {
  if (!baseHostname) return true;
  const hostname = hostnameOf(url);
  return hostname === baseHostname || (hostname?.endsWith(`.${baseHostname}`) ?? false);
}

function shouldLog(url: string): boolean {
  return logThirdPartyRequests || isFirstParty(url);
}

/**
 * Best-effort POST body for logging only. `request.postDataJSON()` *throws* (not returns
 * null) when the body isn't valid JSON — which real sites hit constantly via third-party
 * analytics/ad beacons sending non-JSON bodies. Falls back to the raw text, or undefined if
 * there's no body at all; never throws.
 */
function safePostDataForLogging(request: Request): string | undefined {
  const raw = request.postData();
  if (!raw) return undefined;

  try {
    return JSON.stringify(request.postDataJSON());
  } catch {
    return raw;
  }
}

export class NetworkLogger {
  static onRequest(request: Request): void {
    const url = request.url();
    if (!shouldLog(url)) return;

    const method = request.method();
    const headers = request.headers();

    logger.network.request(`${method} ${url}`);
    logger.ui.navigation(`Request: ${method} ${url}`);

    const postData = safePostDataForLogging(request);
    if (postData) {
      logger.api.request(`POST ${url} | Payload: ${postData}`);
    }

    logger.debug.variable(`Request headers for ${url}: ${JSON.stringify(headers)}`);
  }

  static onResponse(response: Response): void {
    const url = response.url();
    if (!shouldLog(url)) return;

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
    if (!shouldLog(url)) return;

    const status = response.status();
    logger.network.failed(`Failed response ${status} for ${url}`);
    logger.error.exception(`Network error ${status} for ${url}`);
  }
}
