'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, Settings, User, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface TopbarProps {
  currentTenant?: 'jigawa' | 'kano';
  onTenantChange?: (tenant: 'jigawa' | 'kano') => void;
}

// Helper to get initials from full name
function getInitials(fullName: string): string {
  if (!fullName) return '??';
  const parts = fullName.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Helper to format role for display
function formatRole(role: string): string {
  if (!role) return 'Unknown';
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Topbar({ currentTenant = 'jigawa', onTenantChange }: TopbarProps) {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get user from auth store
  const { user, logout, isAuthenticated } = useAuthStore();

  const tenantName = currentTenant === 'jigawa' ? 'Jigawa' : 'Kano';
  const tenantLgaCount = currentTenant === 'jigawa' ? 27 : 44;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
      setUserMenuOpen(false);
    }
  };

  // If user is not loaded yet, show minimal state
  if (!user || !isAuthenticated) {
    return (
      <div className="relative z-10 flex-shrink-0 flex h-14 bg-uradi-bg-secondary border-b border-uradi-border">
        <div className="flex-1 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-uradi-text-secondary text-sm">Command Center</span>
          </div>
          <div className="flex items-center gap-4">
            <Loader2 className="h-5 w-5 animate-spin text-uradi-text-tertiary" />
          </div>
        </div>
      </div>
    );
  }

  const userInitials = getInitials(user.full_name);
  const displayRole = formatRole(user.role);

  return (
    <div className="relative z-10 flex-shrink-0 flex h-14 bg-uradi-bg-secondary border-b border-uradi-border">
      <div className="flex-1 px-4 flex justify-between items-center">
        {/* Left: Breadcrumb */}
        <div className="flex items-center">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <span className="text-uradi-text-secondary text-sm">Command Center</span>
              </li>
              <li className="text-uradi-text-tertiary">/</li>
              <li>
                <span className="text-uradi-text-primary text-sm font-medium">Overview</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Center: Tenant Selector */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <button
              onClick={() => setTenantMenuOpen(!tenantMenuOpen)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-uradi-gold/10 border border-uradi-gold/30 text-uradi-gold hover:bg-uradi-gold/20 transition-colors"
            >
              <span className="text-sm font-medium">{tenantName}</span>
              <span className="text-xs text-uradi-text-secondary">({tenantLgaCount} LGAs)</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Tenant Dropdown */}
            {tenantMenuOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 rounded-lg shadow-xl py-1 bg-uradi-bg-secondary border border-uradi-border">
                <button
                  onClick={() => {
                    onTenantChange?.('jigawa');
                    setTenantMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-uradi-bg-tertiary transition-colors ${
                    currentTenant === 'jigawa' ? 'text-uradi-gold' : 'text-uradi-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Jigawa</span>
                    {currentTenant === 'jigawa' && (
                      <span className="text-xs text-uradi-text-secondary">27 LGAs</span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => {
                    onTenantChange?.('kano');
                    setTenantMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-uradi-bg-tertiary transition-colors ${
                    currentTenant === 'kano' ? 'text-uradi-gold' : 'text-uradi-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Kano</span>
                    {currentTenant === 'kano' && (
                      <span className="text-xs text-uradi-text-secondary">44 LGAs</span>
                    )}
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-4">
          {/* Notification bell */}
          <button className="relative p-2 rounded-full text-uradi-text-secondary hover:text-uradi-text-primary hover:bg-uradi-bg-tertiary transition-colors">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-uradi-status-critical ring-2 ring-uradi-bg-secondary"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-uradi-gold/50"
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-uradi-gold to-uradi-gold-dark flex items-center justify-center text-uradi-bg-primary font-semibold text-sm">
                {userInitials}
              </div>
              <span className="hidden md:block text-uradi-text-primary font-medium">{user.full_name}</span>
              <ChevronDown className="hidden md:block h-4 w-4 text-uradi-text-secondary" />
            </button>

            {/* User dropdown menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl py-1 bg-uradi-bg-secondary border border-uradi-border">
                <div className="px-4 py-3 border-b border-uradi-border">
                  <p className="text-sm font-medium text-uradi-text-primary">{user.full_name}</p>
                  <p className="text-xs text-uradi-text-secondary">{user.email}</p>
                  <p className="text-xs text-uradi-gold mt-1">{displayRole}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-uradi-text-secondary hover:text-uradi-text-primary hover:bg-uradi-bg-tertiary transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-uradi-text-secondary hover:text-uradi-text-primary hover:bg-uradi-bg-tertiary transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </div>
                <div className="border-t border-uradi-border py-1">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-uradi-status-critical hover:bg-uradi-bg-tertiary transition-colors disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
