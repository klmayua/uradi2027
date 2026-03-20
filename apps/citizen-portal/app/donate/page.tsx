'use client';

import { useState } from 'react';
import { Heart, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function DonatePage() {
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const predefinedAmounts = [1000, 5000, 10000, 50000, 100000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-uradi-bg-primary flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-uradi-text-primary mb-4">
            Thank You!
          </h1>
          <p className="text-uradi-text-secondary mb-8">
            Your contribution of ₦{(amount || Number(customAmount)).toLocaleString()} has been received.
            Together, we're building a better future.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-uradi-gold text-uradi-bg-primary font-semibold rounded-lg hover:bg-uradi-gold-light transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-uradi-bg-primary">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-uradi-border">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-uradi-gold font-bold text-xl">
            ← Back to Home
          </Link>
        </div>
      </header>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-uradi-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-uradi-gold" />
            </div>
            <h1 className="text-3xl font-bold text-uradi-text-primary mb-4">
              Support Our Campaign
            </h1>
            <p className="text-uradi-text-secondary">
              Your contribution helps us reach more voters, organize more events,
              and build a stronger movement for change.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-uradi-bg-secondary rounded-xl p-6 sm:p-8 border border-uradi-border">
            {/* Amount Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-uradi-text-primary mb-4">
                Select Amount
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {predefinedAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                      amount === amt
                        ? 'bg-uradi-gold text-uradi-bg-primary'
                        : 'bg-uradi-bg-tertiary text-uradi-text-primary hover:bg-uradi-border'
                    }`}
                  >
                    ₦{amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-uradi-text-secondary mb-2">
                  Or enter custom amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-uradi-text-secondary">₦</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmount(null);
                    }}
                    placeholder="Enter amount"
                    className="w-full pl-10 pr-4 py-3 bg-uradi-bg-primary border border-uradi-border rounded-lg text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50"
                  />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4 mb-8">
              <label className="block text-sm font-medium text-uradi-text-primary">
                Your Information
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
                className="w-full px-4 py-3 bg-uradi-bg-primary border border-uradi-border rounded-lg text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="w-full px-4 py-3 bg-uradi-bg-primary border border-uradi-border rounded-lg text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full px-4 py-3 bg-uradi-bg-primary border border-uradi-border rounded-lg text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50"
              />
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 mb-8 p-4 bg-uradi-bg-tertiary rounded-lg">
              <Shield className="w-5 h-5 text-uradi-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-uradi-text-primary font-medium">Secure Payment</p>
                <p className="text-sm text-uradi-text-secondary">
                  Your payment is secured with bank-level encryption.
                  We never store your card details.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || (!amount && !customAmount)}
              className="w-full py-4 bg-uradi-gold text-uradi-bg-primary font-semibold rounded-lg hover:bg-uradi-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Donate ₦${(amount || Number(customAmount) || 0).toLocaleString()}`
              )}
            </button>

            <p className="text-center text-xs text-uradi-text-tertiary mt-4">
              By donating, you agree to our terms of service and privacy policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
