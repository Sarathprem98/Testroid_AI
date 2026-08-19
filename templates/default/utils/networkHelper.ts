import type { Request, Response } from '@playwright/test';
import { logger } from '../utils/logger';

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

// --- Network log noise-filtering configuration ---
// Tune these to change what NetworkLogger treats as noise. Everything in this block is
// bypassed entirely when LOG_VERBOSE_NETWORK=true (below), for deep debugging.

// URL substrings that mark a request as noise no matter which domain it's on. First-party
// bot-detection/analytics endpoints (Akamai/PerimeterX/Datadome-style sensor_data collectors,
// obfuscated tracking paths like /Czn2I2/WV2HD/...) hit these just as often as third-party
// trackers do, so this filter is independent of the first-party/third-party check below.
const NOISE_URL_PATTERNS = ['sensor_data', 'collect', 'analytics', 'telemetry', 'tracking', 'beacon'];

// A POST body at least this long, with (almost) no whitespace and mostly non-alphanumeric
// characters, reads as an obfuscated/encoded tracking payload (encrypted sensor blob, signed
// beacon, etc.) rather than a readable API request worth logging.
const OBFUSCATED_BODY_MIN_LENGTH = 500;
const OBFUSCATED_BODY_MAX_SPACE_RATIO = 0.02; // >2% whitespace reads as normal JSON/text, not obfuscated
const OBFUSCATED_BODY_MIN_SYMBOL_RATIO = 0.3; // <30% non-alphanumeric reads as normal JSON/text

// Every logged request/response body — not just ones caught by the noise filters above — is
// capped to this many characters. This is what actually saves a run from a legitimate but
// huge catalog/search JSON response, independent of whether any pattern above matches it.
const MAX_LOGGED_BODY_LENGTH = 500;

// Logged URLs/paths are capped to this many characters — long query strings are what
// usually blow this up. Only relevant in LOG_VERBOSE_NETWORK mode (full URL) and for the
// last-path-segment shown on failures in default mode; both bypass this when verbose is on.
const MAX_LOGGED_PATH_LENGTH = 100;

// Third-party requests (analytics/ads/tracking beacons — Facebook Pixel, Google Ads,
// Clevertap, etc.) still execute normally; this only controls whether NetworkLogger writes
// about them. Logging every one of them floods the log with noise unrelated to the app
// under test. Opt in via LOG_THIRD_PARTY_REQUESTS=true in .env.
const logThirdPartyRequests = toBoolean(process.env.LOG_THIRD_PARTY_REQUESTS, false);

// Escape hatch for deep debugging: disables the noise filters, body truncation, and
// path/URL stripping above so every request/response logs in full, regardless of domain,
// pattern match, or size.
const verboseNetworkLogging = toBoolean(process.env.LOG_VERBOSE_NETWORK, false);

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

function matchesNoiseUrlPattern(url: string): boolean {
  const lower = url.toLowerCase();
  return NOISE_URL_PATTERNS.some((pattern) => lower.includes(pattern));
}

function ratioOf(value: string, pattern: RegExp): number {
  return (value.match(pattern)?.length ?? 0) / value.length;
}

function looksObfuscated(body: string): boolean {
  if (body.length < OBFUSCATED_BODY_MIN_LENGTH) return false;
  if (ratioOf(body, /\s/g) > OBFUSCATED_BODY_MAX_SPACE_RATIO) return false;
  return ratioOf(body, /[^a-zA-Z0-9]/g) >= OBFUSCATED_BODY_MIN_SYMBOL_RATIO;
}

// Domain-scoped check (first-party vs. opted-in third-party logging).
function shouldLog(url: string): boolean {
  return logThirdPartyRequests || isFirstParty(url);
}

// Content-scoped check, independent of domain — catches first-party bot-detection/analytics
// traffic that shouldLog() alone would let through since it lives on BASE_URL's own host.
function isNoise(url: string, postData?: string): boolean {
  if (verboseNetworkLogging) return false;
  if (matchesNoiseUrlPattern(url)) return true;
  if (postData && (matchesNoiseUrlPattern(postData) || looksObfuscated(postData))) return true;
  return false;
}

function truncateBody(body: string): string {
  if (verboseNetworkLogging || body.length <= MAX_LOGGED_BODY_LENGTH) return body;
  const byteLength = Buffer.byteLength(body, 'utf-8');
  return `${body.slice(0, MAX_LOGGED_BODY_LENGTH)}...[truncated, ${byteLength} bytes]`;
}

function truncatePath(value: string): string {
  if (verboseNetworkLogging || value.length <= MAX_LOGGED_PATH_LENGTH) return value;
  return `${value.slice(0, MAX_LOGGED_PATH_LENGTH)}...`;
}

// The last path segment only (e.g. "/inventory" from ".../api/v1/inventory?sku=...") — used
// as a minimal hint on failure lines in default mode, without pulling in the full URL/query
// string that default mode otherwise omits entirely.
function lastPathSegment(url: string): string {
  try {
    const trimmed = new URL(url).pathname.replace(/\/+$/, '');
    const segment = trimmed.slice(trimmed.lastIndexOf('/') + 1);
    return truncatePath(segment ? `/${segment}` : '/');
  } catch {
    return '';
  }
}

/**
 * The single summary line for a completed request. Default mode is intentionally bare —
 * method, status, duration, nothing else — since a quick scan only needs to know whether
 * requests succeeded. A failure still gets the last path segment as a minimal "roughly
 * what" hint, since a bare status code among many identical-looking failures isn't enough
 * to tell them apart. LOG_VERBOSE_NETWORK=true shows the full URL on every line instead.
 */
function summaryLine(method: string, url: string, status: number, duration: string, ok: boolean): string {
  if (verboseNetworkLogging) return `${method} ${url} → ${status} (${duration})`;
  if (!ok) return `${method} ${lastPathSegment(url)} → ${status} (${duration})`;
  return `${method} → ${status} (${duration})`;
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

// Request start times, keyed by the Request instance itself rather than its URL. Playwright
// hands back the exact same Request object via `response.request()`, so identity-based
// pairing stays correct even when several in-flight requests share a URL — a URL-keyed map
// would mismatch those.
const requestStartTimes = new WeakMap<Request, number>();

export class NetworkLogger {
  static onRequest(request: Request): void {
    const url = request.url();
    if (!shouldLog(url)) return;

    const postData = safePostDataForLogging(request);
    if (isNoise(url, postData)) return;

    requestStartTimes.set(request, Date.now());

    // Payload preview is "full detail" — only worth the extra line, and only safe to show
    // in full, alongside the full URL that gives it context, in verbose mode.
    if (verboseNetworkLogging && postData) {
      logger.api.request(`${request.method()} ${url} | Payload: ${truncateBody(postData)}`);
    }
  }

  static onResponse(response: Response): void {
    const request = response.request();
    const url = response.url();
    if (!shouldLog(url)) return;
    if (isNoise(url)) return;

    const status = response.status();
    const ok = response.ok();

    const startTime = requestStartTimes.get(request);
    requestStartTimes.delete(request);
    const duration = startTime !== undefined ? `${Date.now() - startTime}ms` : 'n/a';

    const line = summaryLine(request.method(), url, status, duration, ok);
    if (ok) {
      logger.network.response(line);
    } else {
      logger.network.failed(line);
    }

    if (verboseNetworkLogging) {
      const contentType = response.headers()['content-type'] || '';
      if (contentType.includes('application/json')) {
        response.text().then((body) => {
          logger.api.response(`${url}: ${truncateBody(body)}`);
        }).catch(() => undefined);
      }
    }
  }

  static onFailedResponse(response: Response): void {
    const url = response.url();
    if (!shouldLog(url)) return;
    if (isNoise(url)) return;

    // The compact status line for this failure is already logged by onResponse (called
    // just before this, per fixtures/testFixture.ts) — this only adds the error-channel
    // entry so failures surface in error-focused log views/files too.
    const identifier = verboseNetworkLogging ? url : lastPathSegment(url);
    logger.error.exception(`${response.request().method()} ${identifier} → ${response.status()}`);
  }
}
