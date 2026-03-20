/**
 * Responsive Table Component
 * Handles mobile overflow with horizontal scroll
 */

'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className = '' }: ResponsiveTableProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(true);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const position = target.scrollLeft;
    const maxScroll = target.scrollWidth - target.clientWidth;

    setScrollPosition(position);
    setShowLeftIndicator(position > 20);
    setShowRightIndicator(position < maxScroll - 20);
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('table-container');
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative">
      {/* Scroll Indicators */}
      {showLeftIndicator && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-uradi-bg-secondary/90 border border-uradi-border rounded-full flex items-center justify-center shadow-lg md:hidden"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 text-uradi-text-primary" />
        </button>
      )}

      {showRightIndicator && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-uradi-bg-secondary/90 border border-uradi-border rounded-full flex items-center justify-center shadow-lg md:hidden"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 text-uradi-text-primary" />
        </button>
      )}

      {/* Table Container */}
      <div
        id="table-container"
        onScroll={handleScroll}
        className={`overflow-x-auto scrollbar-thin scrollbar-thumb-uradi-border scrollbar-track-uradi-bg-primary ${className}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="min-w-[800px]">
          {children}
        </div>
      </div>

      {/* Mobile Scroll Hint */}
      <div className="md:hidden text-center mt-2 text-xs text-uradi-text-tertiary">
        Swipe to see more
      </div>
    </div>
  );
}

/**
 * Mobile Card View for Tables
 * Alternative to tables on mobile devices
 */

interface MobileCardViewProps<T> {
  data: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export function MobileCardView<T>({ data, renderCard, keyExtractor }: MobileCardViewProps<T>) {
  return (
    <div className="space-y-3 md:hidden">
      {data.map((item, index) => (
        <div key={keyExtractor(item)}>
          {renderCard(item, index)}
        </div>
      ))}
    </div>
  );
}

/**
 * Touch-friendly Button
 * Minimum 44px touch target
 */

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function TouchButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: TouchButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-uradi-gold/50';

  const variantStyles = {
    primary: 'bg-uradi-gold text-uradi-bg-primary hover:bg-uradi-gold-light',
    secondary: 'bg-uradi-bg-tertiary text-uradi-text-primary hover:bg-uradi-border',
    danger: 'bg-uradi-status-critical/20 text-uradi-status-critical hover:bg-uradi-status-critical/30',
    ghost: 'text-uradi-text-secondary hover:text-uradi-text-primary hover:bg-uradi-bg-tertiary'
  };

  const sizeStyles = {
    sm: 'min-h-[36px] px-3 py-2 text-sm',
    md: 'min-h-[44px] px-4 py-2',
    lg: 'min-h-[48px] px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Mobile Navigation Bottom Bar
 */

import { Home, Users, AlertCircle, BarChart2, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { icon: Home, label: 'Overview', href: '/overview' },
  { icon: Users, label: 'Voters', href: '/constituents/voters' },
  { icon: AlertCircle, label: 'Incidents', href: '/election-day/incidents' },
  { icon: BarChart2, label: 'Results', href: '/election-day/results' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-uradi-bg-secondary border-t border-uradi-border md:hidden z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-[64px] ${
                isActive
                  ? 'text-uradi-gold'
                  : 'text-uradi-text-tertiary hover:text-uradi-text-secondary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Mobile Filter Drawer
 */

import { X, Filter } from 'lucide-react';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function MobileFilterDrawer({ isOpen, onClose, children, title = 'Filters' }: MobileFilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-uradi-bg-secondary rounded-t-2xl z-50 md:hidden max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-uradi-bg-secondary border-b border-uradi-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-uradi-gold" />
            <span className="font-semibold text-uradi-text-primary">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-uradi-bg-tertiary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </>
  );
}
