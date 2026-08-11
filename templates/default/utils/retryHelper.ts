export type RetryOptions = {
  retries?: number;
  delayMs?: number;
  onRetry?: (attempt: number, error: unknown) => void | Promise<void>;
};

const delay = async (durationMs: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, durationMs));
};

export const retryAsync = async <T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
  const retries = options.retries ?? 3;
  const delayMs = options.delayMs ?? 300;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        break;
      }

      if (options.onRetry) {
        await options.onRetry(attempt + 1, error);
      }

      await delay(delayMs * (attempt + 1));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Retry operation failed');
};