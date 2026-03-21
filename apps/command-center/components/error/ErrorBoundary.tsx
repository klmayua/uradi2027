/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree
 */

'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console
    console.error('Error caught by boundary:', error, errorInfo);

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // Structured error logging
    const errorData = {
      type: 'react_error_boundary',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
    };

    // Send to API endpoint for logging
    fetch('/api/logs/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData),
    }).catch(() => {
      // Silent fail - don't cause infinite error loops
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-uradi-status-critical/10 mb-4">
              <AlertTriangle className="w-8 h-8 text-uradi-status-critical" />
            </div>
            <h2 className="text-xl font-semibold text-uradi-text-primary mb-2">
              Something went wrong
            </h2>
            <p className="text-uradi-text-secondary mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-uradi-gold text-uradi-bg-primary rounded-lg font-medium hover:bg-uradi-gold-light transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * API Error Component
 * Displays user-friendly error message for API failures
 */

interface APIErrorProps {
  error: Error | string;
  onRetry?: () => void;
}

export function APIError({ error, onRetry }: APIErrorProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className="p-6 rounded-xl bg-uradi-bg-secondary border border-uradi-border">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-uradi-status-critical/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-uradi-status-critical" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-uradi-text-primary mb-1">
            Failed to load data
          </h3>
          <p className="text-sm text-uradi-text-secondary mb-4">
            {errorMessage || 'An error occurred while fetching data from the server'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-uradi-bg-tertiary text-uradi-text-primary rounded-lg text-sm font-medium hover:bg-uradi-border transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton Component
 */

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-uradi-bg-secondary rounded-lg animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

/**
 * Empty State Component
 */

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  title = 'No data found',
  description = 'There are no items to display at this time.',
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-uradi-bg-tertiary mb-4">
        <svg
          className="w-6 h-6 text-uradi-text-tertiary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-uradi-text-primary mb-1">{title}</h3>
      <p className="text-sm text-uradi-text-secondary mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
