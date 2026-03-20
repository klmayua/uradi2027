/**
 * Loading Skeleton Component
 * Provides visual feedback during data loading
 */

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'list' | 'dashboard' | 'form';
  count?: number;
}

export function LoadingSkeleton({ type = 'card', count = 3 }: LoadingSkeletonProps) {
  if (type === 'dashboard') {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-uradi-bg-secondary rounded-xl p-4 h-24">
              <div className="h-4 bg-uradi-bg-tertiary rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-uradi-bg-tertiary rounded w-3/4"></div>
            </div>
          ))}
        </div>

        {/* Content rows */}
        <div className="grid lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-uradi-bg-secondary rounded-xl p-6 h-64">
              <div className="h-6 bg-uradi-bg-tertiary rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-12 bg-uradi-bg-tertiary rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-4 animate-pulse">
        {/* Table header */}
        <div className="flex gap-4 pb-4 border-b border-uradi-border">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-uradi-bg-tertiary rounded flex-1"></div>
          ))}
        </div>

        {/* Table rows */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 py-4 border-b border-uradi-border/50">
            {[...Array(6)].map((_, j) => (
              <div key={j} className="h-4 bg-uradi-bg-tertiary rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="bg-uradi-bg-tertiary rounded-lg p-4">
            <div className="h-4 bg-uradi-bg-secondary rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-uradi-bg-secondary rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-uradi-bg-tertiary rounded w-1/3"></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-uradi-bg-tertiary rounded w-1/4"></div>
            <div className="h-10 bg-uradi-bg-tertiary rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className={`grid gap-4 ${count > 1 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-uradi-bg-secondary rounded-xl p-6 animate-pulse">
          <div className="h-4 bg-uradi-bg-tertiary rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-uradi-bg-tertiary rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-uradi-bg-tertiary rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}
