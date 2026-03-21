'use client';

import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
  onGoHome?: () => void;
}

export function ErrorFallback({ error, onReset, onGoHome }: ErrorFallbackProps) {
  const errorMessage = error?.message || 'An unexpected error occurred';
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-uradi-bg-primary p-8">
      <div className="text-center max-w-lg">
        {/* Error Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-uradi-status-critical/10 mb-6">
          <AlertTriangle className="w-10 h-10 text-uradi-status-critical" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-uradi-text-primary mb-3">
          Something went wrong
        </h1>

        {/* Description */}
        <p className="text-uradi-text-secondary mb-2">
          We apologize for the inconvenience. An error has occurred and we've been notified.
        </p>

        {/* Error Message (User-friendly) */}
        <div className="bg-uradi-bg-secondary border border-uradi-border rounded-lg p-4 mb-6">
          <p className="text-sm text-uradi-text-tertiary font-mono break-all">
            {errorMessage}
          </p>
        </div>

        {/* Stack Trace (Development Only) */}
        {isDev && error?.stack && (
          <div className="text-left bg-uradi-bg-secondary border border-uradi-border rounded-lg p-4 mb-6 overflow-auto max-h-64">
            <p className="text-xs text-uradi-text-tertiary font-mono whitespace-pre-wrap">
              {error.stack}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-uradi-gold text-uradi-bg-primary rounded-lg font-medium hover:bg-uradi-gold-light transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          )}

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-uradi-border text-uradi-text-primary rounded-lg font-medium hover:bg-uradi-bg-tertiary transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to dashboard
            </button>
          )}

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-uradi-border text-uradi-text-secondary rounded-lg font-medium hover:bg-uradi-bg-tertiary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-uradi-border">
          <p className="text-xs text-uradi-text-tertiary">
            If this problem persists, please contact support at{' '}
            <a
              href="mailto:support@uradi360.com"
              className="text-uradi-gold hover:underline"
            >
              support@uradi360.com
            </a>
          </p>
          <p className="text-xs text-uradi-text-tertiary mt-1">
            Error ID: {Math.random().toString(36).substring(2, 15)}
          </p>
        </div>
      </div>
    </div>
  );
}
