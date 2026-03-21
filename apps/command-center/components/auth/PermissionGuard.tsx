/**
 * Permission Guard Component
 * Conditionally render content based on user permissions
 */

import { useCan } from '@/hooks/useUsers';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  resource: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Permission Guard
 * Only renders children if user has the specified permission
 */
export function PermissionGuard({
  resource,
  action,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const allowed = useCan(resource, action);

  if (!allowed) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * Permission Button
 * Button that only appears if user has permission
 */
interface PermissionButtonProps {
  resource: string;
  action: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function PermissionButton({
  resource,
  action,
  children,
  onClick,
  className,
}: PermissionButtonProps) {
  const allowed = useCan(resource, action);

  if (!allowed) {
    return null;
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}

/**
 * Permission Link
 * Link that only appears if user has permission
 */
interface PermissionLinkProps {
  resource: string;
  action: string;
  href: string;
  children: ReactNode;
  className?: string;
}

export function PermissionLink({
  resource,
  action,
  href,
  children,
  className,
}: PermissionLinkProps) {
  const allowed = useCan(resource, action);

  if (!allowed) {
    return null;
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
