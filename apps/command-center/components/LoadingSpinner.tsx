import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-uradi-gold`} />
      {text && <p className="text-sm text-uradi-text-secondary">{text}</p>}
    </div>
  );
}

// Skeleton loading component for cards
interface SkeletonProps {
  className?: string;
  count?: number;
}

export function SkeletonCard({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-uradi-bg-secondary border border-uradi-border rounded-xl p-4 ${className}`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-uradi-bg-tertiary rounded" />
              <div className="h-8 w-16 bg-uradi-bg-tertiary rounded" />
              <div className="h-4 w-20 bg-uradi-bg-tertiary rounded" />
            </div>
            <div className="h-10 w-10 bg-uradi-bg-tertiary rounded-lg" />
          </div>
        </div>
      ))}
    </>
  );
}

// Table skeleton
export function SkeletonTable({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-uradi-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 flex-1 bg-uradi-bg-tertiary rounded" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-uradi-border">
          {Array.from({ length: 6 }).map((_, j) => (
            <div key={j} className="h-4 flex-1 bg-uradi-bg-tertiary rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Page loading state
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}
