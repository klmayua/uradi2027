'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useForgotPassword } from '@/hooks/useAuth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await forgotPasswordMutation.mutateAsync({ email });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    }
  };

  // Success state
  if (isSuccess) {
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
          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-2xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>

            <h2 className="text-2xl font-bold text-uradi-text-primary mb-2">Check your email</h2>
            <p className="text-uradi-text-secondary mb-6">
              We&#39;ve sent a password reset link to
              <br />
              <span className="text-uradi-gold font-medium">{email}</span>
            </p>

            <p className="text-sm text-uradi-text-tertiary mb-6">
              Click the link in the email to reset your password.
              If you don&#39;t see it, check your spam folder.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-2.5 px-4 bg-uradi-gold text-uradi-bg-primary font-semibold rounded-lg hover:bg-uradi-gold-light transition-colors"
              >
                Back to Login
              </button>

              <button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="w-full py-2.5 px-4 border border-uradi-border text-uradi-text-secondary font-medium rounded-lg hover:bg-uradi-bg-tertiary transition-colors"
              >
                Try different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="bg-uradi-bg-secondary border border-uradi-border rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-uradi-text-primary mb-2">
              Reset Password
            </h1>
            <p className="text-uradi-text-secondary">
              Enter your email address and we&#39;ll send you a link to reset your password.
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
                  placeholder="you@campaign.com"
                  required
                  disabled={forgotPasswordMutation.isPending}
                />
              </div>
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
              disabled={forgotPasswordMutation.isPending || !email}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-uradi-gold to-uradi-gold-dark text-uradi-bg-primary font-semibold rounded-lg hover:from-uradi-gold-light hover:to-uradi-gold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-uradi-gold/20"
            >
              {forgotPasswordMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5" />
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-uradi-text-tertiary">
              Remember your password?{' '}
              <Link href="/login" className="text-uradi-gold hover:text-uradi-gold-light transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
