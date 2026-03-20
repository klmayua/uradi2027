/**
 * Empty State Component
 * Displayed when no data is available
 */

import { Inbox, Plus } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title = 'No data available',
  description = 'There are no items to display at this time.',
  icon: Icon = Inbox,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-uradi-bg-tertiary rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-uradi-text-tertiary" />
      </div>
      <h3 className="text-lg font-medium text-uradi-text-primary mb-2">{title}</h3>
      <p className="text-sm text-uradi-text-secondary max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="gap-2">
          <Plus className="w-4 h-4" />
          {action.label}
        </Button>
      )}
    </div>
  );
}
