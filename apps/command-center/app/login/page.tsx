'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call to backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage or cookies
        localStorage.setItem('token', data.access_token);
        router.push('/overview');
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

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
                  placeholder="admin@uradi360.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-uradi-text-secondary mb-2">
                Password
              </label>
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
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-uradi-gold to-uradi-gold-dark text-uradi-bg-primary font-semibold rounded-lg hover:from-uradi-gold-light hover:to-uradi-gold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-uradi-gold/20"
            >
              {loading ? (
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
