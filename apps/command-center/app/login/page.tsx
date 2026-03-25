'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, Building2, ChevronDown } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import { tenants, useTenantStore } from '@/stores/tenantStore';

// Tenant display config
const tenantConfig = {
  jigawa: {
    name: 'Jigawa',
    description: '27 LGAs',
    color: 'bg-emerald-500',
  },
  kano: {
    name: 'Kano',
    description: '44 LGAs',
    color: 'bg-violet-500',
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<'jigawa' | 'kano'>('jigawa');
  const [showPassword, setShowPassword] = useState(false);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [error, setError] = useState('');
  const [isUradiAdminPortal, setIsUradiAdminPortal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const loginMutation = useLogin();
  const setTenant = useTenantStore((state) => state.setTenant);

  useEffect(() => {
    setMounted(true);
    // Detect if this is URADI admin portal (no tenant pre-selection)
    const hostname = window.location.hostname;
    const isUradi = hostname.includes('uradi.nyamabo.com') || hostname === 'localhost';
    setIsUradiAdminPortal(isUradi);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // For URADI admin, don't set tenant - let backend determine from user
      if (!isUradiAdminPortal) {
        setTenant(selectedTenant);
      }

      const result = await loginMutation.mutateAsync({ email, password });
      // Store token in localStorage
      localStorage.setItem('token', result.access_token);
      // Store refresh token if available
      if (result.refresh_token) {
        localStorage.setItem('refresh_token', result.refresh_token);
      }
      // Store user info
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      // Store selected tenant (only for tenant-specific portals)
      if (!isUradiAdminPortal) {
        localStorage.setItem('tenant-storage', JSON.stringify({ currentTenant: tenants[selectedTenant] }));
      }
      // Set cookie for middleware
      document.cookie = `token=${result.access_token}; path=/; max-age=86400; SameSite=Strict`;
      router.push('/overview');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  // Don't render tenant selector until mounted (client-side)
  const showTenantSelector = mounted && !isUradiAdminPortal;

  const currentTenantConfig = tenantConfig[selectedTenant];

  return (
    <div className="min-h-screen flex items-center justify-center bg-uradi-bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #C8A94E 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-uradi-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-uradi-status-info/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-uradi-gold to-uradi-gold-dark mb-4 shadow-lg shadow-uradi-gold/20">
            <span className="text-uradi-bg-primary font-bold text-2xl">U</span>
          </div>
          <h1 className="text-3xl font-bold text-uradi-text-primary mb-2">
            URADI-360
          </h1>
          <p className="text-uradi-text-secondary">
            Command Center
          </p>
          <p className="text-uradi-text-tertiary text-sm mt-1">
            Intelligence. Governance. Victory.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-uradi-bg-secondary border border-uradi-border rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-uradi-text-primary">Welcome back</h2>
            <p className="text-uradi-text-secondary text-sm mt-1">
              Sign in to access the command center
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tenant Selector - Only show for tenant-specific portals (not URADI admin) */}
            {showTenantSelector && (
            <div>
              <label className="block text-sm font-medium text-uradi-text-secondary mb-2">
                Select Campaign
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTenantDropdown(!showTenantDropdown)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-uradi-bg-primary border border-uradi-border rounded-lg text-left hover:border-uradi-gold/50 transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full ${currentTenantConfig.color}`} />
                  <div className="flex-1">
                    <div className="text-uradi-text-primary font-medium">{currentTenantConfig.name}</div>
                    <div className="text-uradi-text-tertiary text-xs">{currentTenantConfig.description}</div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-uradi-text-tertiary transition-transform ${showTenantDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Tenant Dropdown */}
                {showTenantDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-uradi-bg-primary border border-uradi-border rounded-lg shadow-lg">
                    {(Object.keys(tenants) as Array<'jigawa' | 'kano'>).map((tenantId) => {
                      const config = tenantConfig[tenantId];
                      const tenant = tenants[tenantId];
                      return (
                        <button
                          key={tenantId}
                          type="button"
                          onClick={() => {
                            setSelectedTenant(tenantId);
                            setShowTenantDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-uradi-bg-tertiary transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            selectedTenant === tenantId ? 'bg-uradi-bg-tertiary' : ''
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full ${config.color}`} />
                          <div className="flex-1">
                            <div className="text-uradi-text-primary font-medium">{tenant.candidate_name}</div>
                            <div className="text-uradi-text-tertiary text-xs">{tenant.state} • {config.description}</div>
                          </div>
                          {selectedTenant === tenantId && (
                            <div className="w-2 h-2 rounded-full bg-uradi-gold" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="text-xs text-uradi-text-tertiary mt-1">
                Accessing {tenants[selectedTenant].candidate_name}&#39;s {tenants[selectedTenant].candidate_party} campaign
              </p>
            </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-uradi-text-secondary mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-uradi-text-tertiary" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-uradi-bg-primary border border-uradi-border rounded-lg text-uradi-text-primary placeholder-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50 focus:border-uradi-gold transition-colors"
                  placeholder="you@campaign.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-uradi-text-secondary mb-2">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-uradi-gold hover:text-uradi-gold-light transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-uradi-text-tertiary" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-uradi-bg-primary border border-uradi-border rounded-lg text-uradi-text-primary placeholder-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50 focus:border-uradi-gold transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-uradi-text-tertiary hover:text-uradi-text-secondary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-uradi-status-critical/10 border border-uradi-status-critical/20">
                <p className="text-sm text-uradi-status-critical">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-uradi-gold to-uradi-gold-dark text-uradi-bg-primary font-semibold rounded-lg hover:from-uradi-gold-light hover:to-uradi-gold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-uradi-gold/20"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-uradi-border">
            <p className="text-xs text-center text-uradi-text-tertiary">
              Restricted access. Authorized personnel only.
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-uradi-text-tertiary">
              <span>Protected by</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-uradi-bg-tertiary">JWT</span>
                <span className="px-2 py-0.5 rounded bg-uradi-bg-tertiary">RBAC</span>
                <span className="px-2 py-0.5 rounded bg-uradi-bg-tertiary">Multi-tenant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-uradi-text-tertiary mt-6">
          URADI-360 v1.0.0
        </p>
      </div>
    </div>
  );
}
