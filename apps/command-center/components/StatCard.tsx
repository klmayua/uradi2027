import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: 'uradi-status-info' | 'uradi-status-positive' | 'uradi-status-critical' | 'uradi-status-warning' | 'uradi-gold' | 'uradi-status-neutral' | 'uradi-party-pdp' | 'uradi-party-apc' | 'uradi-party-nnpp';
  className?: string;
}

const colorMap: Record<string, { text: string; bg: string }> = {
  'uradi-status-info': { text: 'text-uradi-status-info', bg: 'bg-uradi-status-info/10' },
  'uradi-status-positive': { text: 'text-uradi-status-positive', bg: 'bg-uradi-status-positive/10' },
  'uradi-status-critical': { text: 'text-uradi-status-critical', bg: 'bg-uradi-status-critical/10' },
  'uradi-status-warning': { text: 'text-uradi-status-warning', bg: 'bg-uradi-status-warning/10' },
  'uradi-gold': { text: 'text-uradi-gold', bg: 'bg-uradi-gold/10' },
  'uradi-status-neutral': { text: 'text-uradi-status-neutral', bg: 'bg-uradi-status-neutral/10' },
  'uradi-party-pdp': { text: 'text-uradi-party-pdp', bg: 'bg-uradi-party-pdp/10' },
  'uradi-party-apc': { text: 'text-uradi-party-apc', bg: 'bg-uradi-party-apc/10' },
  'uradi-party-nnpp': { text: 'text-uradi-party-nnpp', bg: 'bg-uradi-party-nnpp/10' },
};

export function StatCard({ title, value, change, icon: Icon, color, className }: StatCardProps) {
  const colors = colorMap[color] || colorMap['uradi-status-info'];

  return (
    <div className={cn("bg-uradi-bg-secondary border border-uradi-border rounded-xl p-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-uradi-text-secondary text-sm">{title}</p>
          <p className="text-2xl font-bold text-uradi-text-primary font-mono mt-1">{value}</p>
          <p className={cn("text-sm mt-1", colors.text)}>{change}</p>
        </div>
        <div className={cn("p-2 rounded-lg", colors.bg)}>
          <Icon className={cn("h-5 w-5", colors.text)} />
        </div>
      </div>
    </div>
  );
}
