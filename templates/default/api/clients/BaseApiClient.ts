import type { APIRequestContext, APIResponse } from '@playwright/test';
import { logger } from '../../utils/logger';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiRequestOptions = {
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  /** Overrides the method-based retry default (see BaseApiClient.send). */
  retries?: number;
};

export type ApiResponse<T = unknown> = {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  body: T;
  rawText: string;
  durationMs: number;
};

// Only idempotent reads retry automatically. POST/PUT/PATCH/DELETE never auto-retry
// so a transient 5xx can't silently duplicate a signup, cart mutation, or order.
const IDEMPOTENT_METHODS: ReadonlySet<HttpMethod> = new Set(['GET']);
const RETRYABLE_STATUS_THRESHOLD = 500;

const delay = async (durationMs: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, durationMs));
};

export class BaseApiClient {
  protected readonly request: APIRequestContext;
  protected readonly baseUrl: string;

  constructor(request: APIRequestContext, baseUrl = '') {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  private resolveUrl(path: string): string {
    return this.baseUrl ? `${this.baseUrl}${path}` : path;
  }

  private async performOnce<T>(method: HttpMethod, url: string, options: ApiRequestOptions): Promise<ApiResponse<T>> {
    const startedAt = Date.now();
    const raw: APIResponse = await this.request.fetch(url, {
      method,
      headers: options.headers,
      data: options.data,
      params: options.params,
    });
    const durationMs = Date.now() - startedAt;
    const rawText = await raw.text();

    let body: T;
    try {
      body = rawText ? (JSON.parse(rawText) as T) : (undefined as T);
    } catch {
      body = rawText as unknown as T;
    }

    logger.api.response(`${method} ${url} -> ${raw.status()} (${durationMs}ms)`);
    if (!raw.ok()) {
      logger.error.exception(`${method} ${url} returned ${raw.status()}: ${rawText.slice(0, 500)}`);
    }

    return {
      status: raw.status(),
      ok: raw.ok(),
      headers: raw.headers(),
      body,
      rawText,
      durationMs,
    };
  }

  protected async send<T = unknown>(method: HttpMethod, path: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(path);
    const maxAttempts = 1 + (options.retries ?? (IDEMPOTENT_METHODS.has(method) ? 2 : 0));

    logger.api.request(`${method} ${url}`);
    if (options.data !== undefined) {
      logger.api.request(`${method} ${url} | Payload: ${JSON.stringify(options.data)}`);
    }
    if (options.headers) {
      logger.api.headers(`${method} ${url} | Headers: ${JSON.stringify(options.headers)}`);
    }

    let lastResult: ApiResponse<T> | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      lastResult = await this.performOnce<T>(method, url, options);

      const isRetryableStatus = lastResult.status >= RETRYABLE_STATUS_THRESHOLD;
      if (!isRetryableStatus || attempt === maxAttempts) {
        return lastResult;
      }

      logger.warning.retry(`${method} ${url} attempt ${attempt} returned ${lastResult.status}; retrying`);
      await delay(300 * attempt);
    }

    return lastResult as ApiResponse<T>;
  }

  protected get<T = unknown>(path: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.send<T>('GET', path, options);
  }

  protected post<T = unknown>(path: string, data?: unknown, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.send<T>('POST', path, { ...options, data });
  }

  protected put<T = unknown>(path: string, data?: unknown, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.send<T>('PUT', path, { ...options, data });
  }

  protected patch<T = unknown>(path: string, data?: unknown, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.send<T>('PATCH', path, { ...options, data });
  }

  protected delete<T = unknown>(path: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.send<T>('DELETE', path, options);
  }
}
