'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ChevronRight,
  Heart,
  Shield,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowLeft,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Lock,
  Eye,
  FileText,
  CreditCard,
  Smartphone,
  Building2,
  Globe,
  Loader2,
} from 'lucide-react';
import { useCreateDonation, useTransparencyStats } from '@/hooks/usePublicApi';

// Navigation items
const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Vision', href: '/vision' },
  { name: 'Scorecard', href: '/scorecard' },
  { name: 'News', href: '/news' },
  { name: 'Get Involved', href: '/get-involved' },
  { name: 'Donate', href: '/donate' },
];

// Donation amounts
const donationAmounts = [
  { amount: 1000, label: '₦1,000', description: 'Supporter' },
  { amount: 5000, label: '₦5,000', description: 'Advocate' },
  { amount: 10000, label: '₦10,000', description: 'Champion' },
  { amount: 25000, label: '₦25,000', description: 'Patriot' },
  { amount: 50000, label: '₦50,000', description: 'Visionary' },
  { amount: 100000, label: '₦100,000', description: 'Leader' },
];

// Payment methods
const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
  { id: 'bank', name: 'Bank Transfer', icon: Building2 },
  { id: 'ussd', name: 'USSD', icon: Smartphone },
  { id: 'intl', name: 'International', icon: Globe },
];

// Transparency stats
const transparencyStats = [
  { label: 'Total Raised', value: '₦45.2M', change: '+12% this month' },
  { label: 'Donors', value: '3,847', change: '+234 this week' },
  { label: 'Avg. Donation', value: '₦11,750', change: 'Transparent' },
  { label: 'Spent on Programs', value: '92%', change: '8% operations' },
];

// Recent donors (anonymized)
const recentDonors = [
  { amount: '₦50,000', location: 'Dutse', time: '2 minutes ago' },
  { amount: '₦5,000', location: 'Hadejia', time: '5 minutes ago' },
  { amount: '₦25,000', location: 'Birnin Kudu', time: '12 minutes ago' },
  { amount: '₦10,000', location: 'Gumel', time: '18 minutes ago' },
  { amount: '₦100,000', location: 'Kano', time: '25 minutes ago' },
];

export default function DonatePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'ussd' | 'intl'>('card');
  const [isRecurring, setIsRecurring] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    showName: true,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const donationMutation = useCreateDonation();
  const { data: transparencyData, isLoading: transparencyLoading } = useTransparencyStats();

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(0);
  };

  const finalAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount <= 0) return;

    try {
      const response = await donationMutation.mutateAsync({
        amount: finalAmount,
        currency: 'NGN',
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        show_name: formData.showName,
        is_recurring: isRecurring,
        payment_method: paymentMethod,
      });

      if (response?.payment_url) {
        setPaymentUrl(response.payment_url);
        setIsSubmitted(true);
        // Redirect to payment gateway
        window.location.href = response.payment_url;
      }
    } catch (error) {
      console.error('Failed to create donation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--gray-200)]">
        <div className="container-premium">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-display font-bold text-[var(--navy-deep)] text-lg leading-tight">Musa Danladi</p>
                <p className="text-xs text-[var(--gray-500)]">For Jigawa 2027</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    item.href === '/donate'
                      ? 'text-[var(--gold-primary)]'
                      : 'text-[var(--gray-700)] hover:text-[var(--gold-primary)]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <Link href="/get-involved" className="btn-secondary text-sm py-2.5 px-5">
                Volunteer
              </Link>
              <Link href="/donate" className="btn-primary text-sm py-2.5 px-5">
                Donate
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[var(--navy-deep)]" />
              ) : (
                <Menu className="w-6 h-6 text-[var(--navy-deep)]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[var(--gray-200)]">
            <div className="container-premium py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-[var(--gray-700)] hover:text-[var(--gold-primary)] font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-3 border-t border-[var(--gray-200)]">
                <Link href="/get-involved" className="block btn-secondary text-center">
                  Volunteer
                </Link>
                <Link href="/donate" className="block btn-primary text-center">
                  Donate
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[var(--navy-deep)] via-[var(--navy-royal)] to-[var(--navy-deep)]">
        <div className="container-premium">
          <div className="max-w-3xl">
            <Link href="/" className="inline-flex items-center gap-2 text-[var(--gold-light)] hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              Support the Movement
            </h1>
            <p className="text-xl text-[var(--gray-300)] leading-relaxed">
              Your contribution powers our campaign for progress. Every donation,
              no matter the size, brings us closer to building a better Jigawa.
            </p>
          </div>
        </div>
      </section>

      {/* Transparency Dashboard */}
      <section className="py-12 bg-[var(--off-white)] border-b border-[var(--gray-200)]">
        <div className="container-premium">
          <div className="flex items-center gap-2 mb-6">
            <Eye className="w-5 h-5 text-[var(--gold-primary)]" />
            <span className="font-semibold text-[var(--navy-deep)]">Real-Time Transparency Dashboard</span>
          </div>
          {transparencyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-primary)]" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-[var(--gray-500)] mb-1">Total Raised</p>
                <p className="text-2xl font-display font-bold text-[var(--navy-deep)]">
                  ₦{(transparencyData?.total_raised || 0).toLocaleString()}
                </p>
                <p className="text-xs text-[var(--success)]">+12% this month</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-[var(--gray-500)] mb-1">Donors</p>
                <p className="text-2xl font-display font-bold text-[var(--navy-deep)]">
                  {(transparencyData?.total_donors || 0).toLocaleString()}
                </p>
                <p className="text-xs text-[var(--success)]">+234 this week</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-[var(--gray-500)] mb-1">Avg. Donation</p>
                <p className="text-2xl font-display font-bold text-[var(--navy-deep)]">
                  ₦{Math.round(transparencyData?.avg_donation || 0).toLocaleString()}
                </p>
                <p className="text-xs text-[var(--success)]">Transparent</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-[var(--gray-500)] mb-1">Spent on Programs</p>
                <p className="text-2xl font-display font-bold text-[var(--navy-deep)]">
                  {transparencyData?.spent_on_programs || '92%'}
                </p>
                <p className="text-xs text-[var(--success)]">8% operations</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Donation Form Section */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="card-premium p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-[var(--navy-deep)]">Make a Donation</h2>
                    <p className="text-sm text-[var(--gray-500)]">Secure, encrypted, and transparent</p>
                  </div>
                </div>

                {/* Amount Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-4">Select Amount</label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {donationAmounts.map((option) => (
                      <button
                        key={option.amount}
                        onClick={() => handleAmountSelect(option.amount)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedAmount === option.amount
                            ? 'border-[var(--gold-primary)] bg-[var(--gold-light)]'
                            : 'border-[var(--gray-200)] hover:border-[var(--gold-primary)]'
                        }`}
                      >
                        <p className="font-semibold text-[var(--navy-deep)]">{option.label}</p>
                        <p className="text-xs text-[var(--gray-500)]">{option.description}</p>
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--gray-500)]">₦</span>
                    <input
                      type="number"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      className="w-full pl-8 pr-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                    />
                  </div>
                </div>

                {/* Recurring Option */}
                <div className="mb-8 p-4 bg-[var(--gray-50)] rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-5 h-5 text-[var(--gold-primary)] rounded focus:ring-[var(--gold-primary)]"
                    />
                    <div>
                      <p className="font-medium text-[var(--navy-deep)]">Make this a monthly donation</p>
                      <p className="text-sm text-[var(--gray-500)]">Sustain our movement with ongoing support</p>
                    </div>
                  </label>
                </div>

                {/* Payment Method */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-4">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === method.id
                            ? 'border-[var(--gold-primary)] bg-[var(--gold-light)]'
                            : 'border-[var(--gray-200)] hover:border-[var(--gold-primary)]'
                        }`}
                      >
                        <method.icon className="w-5 h-5 text-[var(--navy-royal)]" />
                        <span className="text-sm font-medium">{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-4">Your Information</label>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                    />
                  </div>
                </div>

                {/* Public Recognition */}
                <div className="mb-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showName}
                      onChange={(e) => setFormData({ ...formData, showName: e.target.checked })}
                      className="w-5 h-5 text-[var(--gold-primary)] rounded focus:ring-[var(--gold-primary)]"
                    />
                    <div>
                      <p className="font-medium text-[var(--navy-deep)]">Show my name on the donor wall</p>
                      <p className="text-sm text-[var(--gray-500)]">You can choose to remain anonymous</p>
                    </div>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={donationMutation.isPending || finalAmount <= 0 || !formData.name || !formData.email}
                  className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {donationMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Donate ${finalAmount > 0 ? `₦${finalAmount.toLocaleString()}` : ''}`
                  )}
                </button>

                {donationMutation.isError && (
                  <p className="text-red-500 text-sm text-center mt-4">
                    Failed to process donation. Please try again.
                  </p>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--gray-500)]">
                  <Lock className="w-4 h-4" />
                  <span>Secure SSL Encryption</span>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Security Notice */}
              <div className="card-premium p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-[var(--success)]" />
                  <h3 className="font-semibold text-[var(--navy-deep)]">Secure & Transparent</h3>
                </div>
                <ul className="space-y-3 text-sm text-[var(--gray-600)]">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--success)] flex-shrink-0 mt-0.5" />
                    <span>Bank-level SSL encryption</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--success)] flex-shrink-0 mt-0.5" />
                    <span>Real-time donation tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--success)] flex-shrink-0 mt-0.5" />
                    <span>INEC compliance verified</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--success)] flex-shrink-0 mt-0.5" />
                    <span>Instant receipt via email</span>
                  </li>
                </ul>
              </div>

              {/* Recent Donors */}
              <div className="card-premium p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-[var(--gold-primary)]" />
                  <h3 className="font-semibold text-[var(--navy-deep)]">Recent Supporters</h3>
                </div>
                {transparencyLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--gold-primary)]" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transparencyData?.recent_donors?.map((donor: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-[var(--gray-100)] last:border-0">
                        <div>
                          <p className="font-medium text-[var(--navy-deep)]">₦{donor.amount.toLocaleString()}</p>
                          <p className="text-xs text-[var(--gray-500)]">{donor.location}</p>
                        </div>
                        <span className="text-xs text-[var(--gray-400)]">{new Date(donor.time).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Compliance */}
              <div className="card-premium p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-[var(--navy-royal)]" />
                  <h3 className="font-semibold text-[var(--navy-deep)]">Compliance</h3>
                </div>
                <p className="text-sm text-[var(--gray-600)] mb-4">
                  This campaign complies with all INEC regulations and Nigerian electoral laws.
                  Maximum donation limits apply.
                </p>
                <a href="#" className="text-sm text-[var(--navy-royal)] hover:text-[var(--gold-primary)] font-medium">
                  View Compliance Documents →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--navy-deep)] text-white py-16">
        <div className="container-premium">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <p className="font-display font-bold text-lg">Musa Danladi</p>
                  <p className="text-xs text-[var(--gray-400)]">For Jigawa 2027</p>
                </div>
              </div>
              <p className="text-[var(--gray-400)] text-sm mb-4">
                Leadership that delivers. Join us in building a prosperous, inclusive Jigawa.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[var(--gold-primary)] transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-[var(--gray-400)]">
                {['About', 'Vision', 'Scorecard', 'News', 'Events'].map((link) => (
                  <li key={link}>
                    <Link href={`/${link.toLowerCase()}`} className="hover:text-[var(--gold-primary)] transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get Involved */}
            <div>
              <h4 className="font-semibold mb-4">Get Involved</h4>
              <ul className="space-y-2 text-sm text-[var(--gray-400)]">
                {['Volunteer', 'Donate', 'Host an Event', 'Become a Member'].map((link) => (
                  <li key={link}>
                    <Link href="/get-involved" className="hover:text-[var(--gold-primary)] transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-[var(--gray-400)]">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--gold-primary)]" />
                  <span>123 Campaign HQ, Dutse, Jigawa</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[var(--gold-primary)]" />
                  <span>+234 800 123 4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[var(--gold-primary)]" />
                  <span>contact@musadanladi.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[var(--gold-primary)]" />
                  <span>WhatsApp: +234 800 123 4568</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--gray-500)]">
              © 2026 Musa Danladi Campaign. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-[var(--gray-500)]">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
