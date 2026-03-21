'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { useResetPassword } from '@/hooks/useAuth';

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[!@#$%^*&*(),.?":{}|<>]/.test(password) },
  ];

  const strength = checks.filter(c => c.met).length;
  const strengthLabel = strength <= 2 ? 'Weak' : strength <= 4 ? 'Medium' : 'Strong';
  const strengthColor = strength <= 2 ? 'bg-rose-500' : strength <= 4 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-uradi-text-tertiary">Password strength</span>
        <span className={`text-xs font-medium ${
          strength <= 2 ? 'text-rose-400' : strength <= 4 ? 'text-amber-400' : 'text-emerald-400'
        }`}>
          {strengthLabel}
        </span>
      </div>
      <div className="h-1 bg-uradi-bg-tertiary rounded-full overflow-hidden">
        <div
          className={`h-full ${strengthColor} transition-all duration-300`}
          style={{ width: `${(strength / checks.length) * 100}%` }}
        />
      </div>
      <ul className="space-y-1">
        {checks.map((check, idx) => (
          <li
            key={idx}
            className={`text-xs flex items-center gap-1.5 ${
              check.met ? 'text-emerald-400' : 'text-uradi-text-tertiary'
            }`}
          >
            <div className={`w-1 h-1 rounded-full ${check.met ? 'bg-emerald-400' : 'bg-uradi-text-tertiary'}`} />
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);

  const resetPasswordMutation = useResetPassword();

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ token, newPassword: password });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="bg-uradi-bg-secondary border border-uradi-border rounded-2xl p-8 shadow-xl text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>

        <h2 className="text-2xl font-bold text-uradi-text-primary mb-2">Password Reset Complete</h2>
        <p className="text-uradi-text-secondary mb-6">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>

        <button
          onClick={() => router.push('/login')}
          className="w-full py-2.5 px-4 bg-uradi-gold text-uradi-bg-primary font-semibold rounded-lg hover:bg-uradi-gold-light transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Invalid token state
  if (!isTokenValid) {
    return (
      <div className="bg-uradi-bg-secondary border border-uradi-border rounded-2xl p-8 shadow-xl text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-rose-500/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
        </div>

        <h2 className="text-2xl font-bold text-uradi-text-primary mb-2">Invalid Reset Link</h2>
        <p className="text-uradi-text-secondary mb-6">
          {error || 'This password reset link is invalid or has expired.'}
        </p>

        <Link
          href="/forgot-password"
          className="inline-block w-full py-2.5 px-4 bg-uradi-gold text-uradi-bg-primary font-semibold rounded-lg hover:bg-uradi-gold-light transition-colors"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-uradi-bg-secondary border border-uradi-border rounded-2xl p-8 shadow-xl">
      <div className="mb-6">
        <div className="w-12 h-12 mb-4 rounded-full bg-uradi-gold/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-uradi-gold" />
        </div>
        <h1 className="text-2xl font-bold text-uradi-text-primary mb-2">
          Create New Password
        </h1>
        <p className="text-uradi-text-secondary">
          Enter a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-uradi-text-secondary mb-2">
            New Password
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
              disabled={resetPasswordMutation.isPending}
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
          {password && <PasswordStrength password={password} />}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-uradi-text-secondary mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-uradi-text-tertiary" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-uradi-bg-primary border border-uradi-border rounded-lg text-uradi-text-primary placeholder-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50 focus:border-uradi-gold transition-colors"
              placeholder="••••••••"
              required
              disabled={resetPasswordMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-uradi-text-tertiary hover:text-uradi-text-secondary transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-rose-400 mt-1">Passwords do not match</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-uradi-status-critical/10 border border-uradi-status-critical/20 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-uradi-status-critical flex-shrink-0 mt-0.5" />
            <p className="text-sm text-uradi-status-critical">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            resetPasswordMutation.isPending ||
            !password ||
            !confirmPassword ||
            password !== confirmPassword
          }
          className="w-full py-2.5 px-4 bg-gradient-to-r from-uradi-gold to-uradi-gold-dark text-uradi-bg-primary font-semibold rounded-lg hover:from-uradi-gold-light hover:to-uradi-gold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-uradi-gold/20"
        >
          {resetPasswordMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" />
              Resetting...
            </span>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
}

// Loading fallback for Suspense
function ResetPasswordLoading() {
  return (
    <div className="bg-uradi-bg-secondary border border-uradi-border rounded-2xl p-8 shadow-xl">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-uradi-gold" />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
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
        {/* Back to Login */}
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-uradi-text-secondary hover:text-uradi-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to login</span>
          </Link>
        </div>

        <Suspense fallback={<ResetPasswordLoading />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
