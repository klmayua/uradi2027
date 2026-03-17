'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error('Root error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-uradi-bg-primary p-6">
      <div className="max-w-md w-full bg-uradi-bg-secondary border border-uradi-border rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-uradi-status-critical/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-uradi-status-critical" />
        </div>
        <h1 className="text-xl font-bold text-uradi-text-primary mb-2">
          Something went wrong
        </h1>
        <p className="text-uradi-text-secondary mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Go home
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-uradi-text-tertiary mt-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
