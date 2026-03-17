'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Brain,
  Megaphone,
  Target,
  Calendar,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Network,
  Handshake,
  GitBranch,
  UserCircle,
  GraduationCap,
  HeartPulse,
  FileText,
  MessageSquare,
  MapPin,
  AlertTriangle,
  Vote,
  Shield,
  Wallet,
  MessageCircle,
} from 'lucide-react';

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navigation: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/overview', icon: LayoutDashboard },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { name: 'Political Atlas', href: '/intelligence/political-atlas', icon: Network },
      { name: 'Scenarios', href: '/intelligence/scenarios', icon: Brain },
      { name: 'Coalition', href: '/intelligence/coalition', icon: Handshake },
    ],
  },
  {
    title: 'CONSTITUENTS',
    items: [
      { name: 'Voters', href: '/constituents/voters', icon: Users },
      { name: 'Anchor Citizens', href: '/constituents/anchor-citizens', icon: UserCircle },
      { name: 'Youth Ambassadors', href: '/constituents/youth-ambassadors', icon: GraduationCap },
      { name: 'Sentiment', href: '/constituents/sentiment', icon: HeartPulse },
    ],
  },
  {
    title: 'NARRATIVE',
    items: [
      { name: 'Scorecards', href: '/narrative/scorecards', icon: FileText },
      { name: 'Content', href: '/narrative/content', icon: Megaphone },
      { name: 'Messaging', href: '/narrative/messaging', icon: MessageSquare },
    ],
  },
  {
    title: 'CAMPAIGN',
    items: [
      { name: 'Micro-targeting', href: '/campaign/micro-targeting', icon: Target },
      { name: 'Rapid Response', href: '/campaign/rapid-response', icon: AlertTriangle },
      { name: 'Polls', href: '/campaign/polls', icon: BarChart3 },
    ],
  },
  {
    title: 'ELECTION DAY',
    items: [
      { name: 'Monitors', href: '/election-day/monitors', icon: MapPin, badge: 'soon' },
      { name: 'Results', href: '/election-day/results', icon: Vote, badge: 'soon' },
      { name: 'Incidents', href: '/election-day/incidents', icon: AlertTriangle, badge: 'soon' },
    ],
  },
  {
    title: 'GOVERNANCE',
    items: [
      { name: 'Budget Tracker', href: '/governance/budget', icon: Wallet, badge: 'soon' },
      { name: 'Citizen Feedback', href: '/governance/feedback', icon: MessageCircle, badge: 'soon' },
      { name: 'Security', href: '/governance/security', icon: Shield, badge: 'soon' },
    ],
  },
];

const bottomNavigation: NavItem[] = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.();
  };

  const isActive = (href: string) => {
    if (href === '/overview') {
      return pathname === href || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-uradi-bg-primary border-r border-uradi-border transition-all duration-300 ease-in-out z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-uradi-border">
        <Link href="/overview" className="flex items-center gap-2 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-uradi-gold to-uradi-gold-dark flex items-center justify-center">
            <span className="text-uradi-bg-primary font-bold text-sm">U</span>
          </div>
          {!isCollapsed && (
            <span className="text-uradi-text-primary font-bold text-lg whitespace-nowrap">
              URADI-360
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 h-[calc(100vh-7rem)]">
        {navigation.map((section) => (
          <div key={section.title} className="mb-6">
            {!isCollapsed && (
              <h3 className="px-4 text-xs font-semibold text-uradi-text-tertiary uppercase tracking-wider mb-2">
                {section.title}
              </h3>
            )}
            <nav className="space-y-1 px-2">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-uradi-bg-tertiary text-uradi-gold border-l-4 border-uradi-gold'
                        : 'text-uradi-text-secondary hover:bg-uradi-bg-tertiary hover:text-uradi-text-primary border-l-4 border-transparent'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon
                      className={`flex-shrink-0 h-5 w-5 transition-colors ${
                        active ? 'text-uradi-gold' : 'text-uradi-text-tertiary group-hover:text-uradi-text-secondary'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="ml-3 flex-1 whitespace-nowrap">{item.name}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-uradi-status-warning/20 text-uradi-status-warning">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-uradi-border bg-uradi-bg-primary">
        <nav className="p-2">
          {bottomNavigation.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-uradi-bg-tertiary text-uradi-gold border-l-4 border-uradi-gold'
                    : 'text-uradi-text-secondary hover:bg-uradi-bg-tertiary hover:text-uradi-text-primary border-l-4 border-transparent'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  className={`flex-shrink-0 h-5 w-5 transition-colors ${
                    active ? 'text-uradi-gold' : 'text-uradi-text-tertiary group-hover:text-uradi-text-secondary'
                  }`}
                />
                {!isCollapsed && <span className="ml-3 whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-center py-3 text-uradi-text-tertiary hover:text-uradi-text-secondary hover:bg-uradi-bg-tertiary transition-colors border-t border-uradi-border"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
