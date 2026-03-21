/**
 * Error Logging Service
 * Structured error logging for production monitoring
 */

export interface ErrorLog {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  componentStack?: string;
  context?: Record<string, unknown>;
  userId?: string;
  tenantId?: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

// Generate unique error ID
function generateErrorId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get current user info from localStorage
function getUserContext(): { userId?: string; tenantId?: string } {
  if (typeof window === 'undefined') return {};

  try {
    const user = localStorage.getItem('user');
    const tenant = localStorage.getItem('tenant-storage');

    return {
      userId: user ? JSON.parse(user).id : undefined,
      tenantId: tenant ? JSON.parse(tenant).currentTenant?.id : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Log error to console and optionally to server
 */
export function logError(
  error: Error | string,
  context?: Record<string, unknown>,
  type: 'error' | 'warning' = 'error'
): ErrorLog {
  const errorId = generateErrorId();
  const { userId, tenantId } = getUserContext();

  const errorLog: ErrorLog = {
    id: errorId,
    type,
    message: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    context,
    userId,
    tenantId,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    timestamp: new Date().toISOString(),
  };

  // Always log to console
  if (type === 'error') {
    console.error('[ErrorLogger]', errorLog);
  } else {
    console.warn('[ErrorLogger]', errorLog);
  }

  // Send to server in production
  if (process.env.NODE_ENV === 'production') {
    sendToServer(errorLog).catch(() => {
      // Silent fail
    });
  }

  return errorLog;
}

/**
 * Log warning
 */
export function logWarning(message: string, context?: Record<string, unknown>): ErrorLog {
  return logError(message, context, 'warning');
}

/**
 * Log API error with response details
 */
export function logApiError(
  endpoint: string,
  error: Error,
  response?: Response,
  requestData?: unknown
): ErrorLog {
  return logError(error, {
    endpoint,
    status: response?.status,
    statusText: response?.statusText,
    requestData,
    type: 'api_error',
  });
}

/**
 * Send error to server endpoint
 */
async function sendToServer(errorLog: ErrorLog): Promise<void> {
  try {
    const response = await fetch('/api/logs/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorLog),
      // Don't wait too long
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn('Failed to send error to server:', response.status);
    }
  } catch {
    // Silent fail - don't cause infinite loops
  }
}

/**
 * Global error handler for uncaught errors
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'uncaught_error',
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

    logError(error, {
      type: 'unhandled_promise',
    });
  });
}

/**
 * Error boundary error handler
 */
export function logComponentError(
  error: Error,
  errorInfo: { componentStack: string }
): void {
  logError(error, {
    componentStack: errorInfo.componentStack,
    type: 'react_error_boundary',
  });
}
