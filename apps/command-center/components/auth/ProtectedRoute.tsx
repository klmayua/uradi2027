/**
 * Protected Route Component
 * Wraps routes that require authentication
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser, isAuthenticated } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading) {
      // Check if authenticated
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      // Check role requirements
      if (requiredRoles && user && !requiredRoles.includes(user.role)) {
        router.push('/overview');
        return;
      }
    }
  }, [isLoading, user, requiredRoles, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-uradi-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-2 border-uradi-gold border-t-transparent rounded-full"></div>
          <p className="text-uradi-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Check auth
  if (!isAuthenticated()) {
    return null;
  }

  // Check roles
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-uradi-bg-primary">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-uradi-text-primary mb-2">Access Denied</h1>
          <p className="text-uradi-text-secondary">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
