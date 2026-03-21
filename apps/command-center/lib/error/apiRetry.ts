/**
 * API Retry Logic
 * Automatically retry failed API calls with exponential backoff
 */

import { logApiError } from './logger';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatuses: number[];
}

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Timeout, Rate limit, Server errors
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  // Exponential backoff: 2^attempt * baseDelay
  const exponentialDelay = Math.pow(2, attempt) * baseDelay;

  // Add jitter (±25%) to prevent thundering herd
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);

  // Cap at max delay
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown, config: RetryConfig): boolean {
  // Check for network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Check for HTTP status codes
  if (error instanceof Response) {
    return config.retryableStatuses.includes(error.status);
  }

  // Check for error object with status
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    return config.retryableStatuses.includes(status);
  }

  return false;
}

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const fullConfig = { ...defaultConfig, ...config };
  let lastError: unknown;

  for (let attempt = 0; attempt <= fullConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === fullConfig.maxRetries) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error, fullConfig)) {
        throw error;
      }

      // Calculate delay
      const delay = calculateDelay(attempt, fullConfig.baseDelay, fullConfig.maxDelay);

      // Log retry attempt
      console.warn(`API call failed (attempt ${attempt + 1}/${fullConfig.maxRetries + 1}), retrying in ${delay}ms...`);

      // Wait before retry
      await sleep(delay);
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Fetch wrapper with automatic retry
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryConfig?: Partial<RetryConfig>
): Promise<Response> {
  return withRetry(
    async () => {
      const response = await fetch(url, options);

      // Throw for non-ok responses so they can be retried
      if (!response.ok) {
        // Clone response before throwing since error handlers might need to read it
        const errorResponse = response.clone();
        throw errorResponse;
      }

      return response;
    },
    retryConfig
  );
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Wait for connection to be restored
 */
export function waitForConnection(): Promise<void> {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const handler = () => {
      window.removeEventListener('online', handler);
      resolve();
    };

    window.addEventListener('online', handler);
  });
}

/**
 * Execute API call with offline detection
 */
export async function withOfflineSupport<T>(
  fn: () => Promise<T>,
  onOffline?: () => void
): Promise<T> {
  if (!isOnline()) {
    onOffline?.();
    await waitForConnection();
  }

  return fn();
}

/**
 * Queue failed requests for retry when back online
 * (Simple implementation - could be enhanced with IndexedDB)
 */
const offlineQueue: Array<{ fn: () => Promise<unknown>; resolve: (value: unknown) => void; reject: (reason: unknown) => void }> = [];

export function queueOfflineRequest<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    offlineQueue.push({ fn, resolve: resolve as (value: unknown) => void, reject });
  });
}

// Process queue when back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log('Back online, processing queued requests...');

    while (offlineQueue.length > 0) {
      const { fn, resolve, reject } = offlineQueue.shift()!;
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
  });
}
