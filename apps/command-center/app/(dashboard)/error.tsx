'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto bg-uradi-bg-secondary border border-uradi-border rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-uradi-status-critical/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-uradi-status-critical" />
        </div>
        <h1 className="text-xl font-bold text-uradi-text-primary mb-2">
          Dashboard Error
        </h1>
        <p className="text-uradi-text-secondary mb-6">
          {error.message || 'Failed to load dashboard content.'}
        </p>
        <Button onClick={reset} variant="default">
          Try again
        </Button>
      </div>
    </div>
  );
}
