'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';

interface TopbarProps {
  currentTenant?: 'jigawa' | 'kano';
  onTenantChange?: (tenant: 'jigawa' | 'kano') => void;
}

export default function Topbar({ currentTenant = 'jigawa', onTenantChange }: TopbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);

  const tenantName = currentTenant === 'jigawa' ? 'Jigawa' : 'Kano';
  const tenantLgaCount = currentTenant === 'jigawa' ? 27 : 44;

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
                AU
              </div>
              <span className="hidden md:block text-uradi-text-primary font-medium">Admin User</span>
              <ChevronDown className="hidden md:block h-4 w-4 text-uradi-text-secondary" />
            </button>

            {/* User dropdown menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl py-1 bg-uradi-bg-secondary border border-uradi-border">
                <div className="px-4 py-3 border-b border-uradi-border">
                  <p className="text-sm font-medium text-uradi-text-primary">Admin User</p>
                  <p className="text-xs text-uradi-text-secondary">admin@uradi360.com</p>
                  <p className="text-xs text-uradi-gold mt-1">Super Admin</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-uradi-text-secondary hover:text-uradi-text-primary hover:bg-uradi-bg-tertiary transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-uradi-text-secondary hover:text-uradi-text-primary hover:bg-uradi-bg-tertiary transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </div>
                <div className="border-t border-uradi-border py-1">
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-uradi-status-critical hover:bg-uradi-bg-tertiary transition-colors">
                    <LogOut className="h-4 w-4" />
                    Sign out
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
