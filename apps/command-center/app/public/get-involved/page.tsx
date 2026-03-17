'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ChevronRight,
  Users,
  Calendar,
  MapPin,
  Download,
  CheckCircle,
  ArrowLeft,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  Phone,
  Mail,
  Heart,
  Megaphone,
  Home,
  UserPlus,
  Share2,
  Award,
  TrendingUp,
  Clock,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { useVolunteerSignup } from '@/hooks/usePublicApi';

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

// Volunteer roles
const volunteerRoles = [
  {
    id: 'canvasser',
    icon: Users,
    title: 'Door-to-Door Canvasser',
    description: 'Engage directly with voters in their homes, share our message, and identify supporters.',
    commitment: '4-8 hours/week',
    location: 'Various locations',
    skills: ['Communication', 'Persuasion', 'Local knowledge'],
  },
  {
    id: 'phonebank',
    icon: Phone,
    title: 'Phone Bank Volunteer',
    description: 'Make calls to voters from our campaign office or your home. Training provided.',
    commitment: '2-4 hours/week',
    location: 'Remote or HQ',
    skills: ['Communication', 'Data entry', 'Patience'],
  },
  {
    id: 'event',
    icon: Calendar,
    title: 'Event Coordinator',
    description: 'Help organize rallies, town halls, and community events.',
    commitment: 'Event-based',
    location: 'Various venues',
    skills: ['Organization', 'Leadership', 'Logistics'],
  },
  {
    id: 'digital',
    icon: Share2,
    title: 'Digital Ambassador',
    description: 'Share campaign content on social media and engage with online communities.',
    commitment: 'Flexible',
    location: 'Remote',
    skills: ['Social media', 'Content creation', 'Engagement'],
  },
  {
    id: 'driver',
    icon: MapPin,
    title: 'Transportation Volunteer',
    description: 'Drive voters to polling stations on election day and supporters to events.',
    commitment: 'As needed',
    location: 'Your vehicle',
    skills: ['Valid license', 'Reliable vehicle', 'Local knowledge'],
  },
  {
    id: 'poll',
    icon: Award,
    title: 'Polling Unit Agent',
    description: 'Represent the campaign at polling units on election day. Training mandatory.',
    commitment: 'Election day',
    location: 'Assigned polling unit',
    skills: ['Attention to detail', 'Calm under pressure', 'Integrity'],
  },
];

// Ways to participate
const participationWays = [
  {
    icon: UserPlus,
    title: 'Become a Member',
    description: 'Join our campaign membership program for exclusive updates and events.',
    cta: 'Join Now',
    href: '#membership',
  },
  {
    icon: Home,
    title: 'Host an Event',
    description: 'Open your home or venue for a campaign event in your community.',
    cta: 'Host Event',
    href: '#host',
  },
  {
    icon: Megaphone,
    title: 'Spread the Word',
    description: 'Download shareable graphics and talking points for social media.',
    cta: 'Download Kit',
    href: '#download',
  },
  {
    icon: Heart,
    title: 'Make a Donation',
    description: 'Financial contributions power our campaign activities and outreach.',
    cta: 'Donate',
    href: '/donate',
  },
];

// Impact stats
const impactStats = [
  { value: '2,500+', label: 'Active Volunteers', icon: Users },
  { value: '150+', label: 'Communities Covered', icon: MapPin },
  { value: '50k+', label: 'Conversations', icon: MessageCircle },
  { value: '500+', label: 'Events Hosted', icon: Calendar },
];

// Testimonials
const testimonials = [
  {
    quote: "Volunteering for this campaign has been the most rewarding experience. I believe in the vision and I'm proud to be part of the movement.",
    name: 'Amina Ibrahim',
    role: 'Door-to-Door Canvasser',
    location: 'Dutse',
  },
  {
    quote: "As a student, I can volunteer remotely as a Digital Ambassador. It's flexible and I feel like I'm making a real difference.",
    name: 'Yusuf Abdullahi',
    role: 'Digital Ambassador',
    location: 'Birnin Kudu',
  },
  {
    quote: "The training and support from the campaign team has been excellent. I feel prepared and empowered to represent our candidate.",
    name: 'Fatima Musa',
    role: 'Polling Unit Agent',
    location: 'Hadejia',
  },
];

export default function GetInvolvedPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    ward: '',
    availability: '',
    experience: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const volunteerMutation = useVolunteerSignup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await volunteerMutation.mutateAsync({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        ward: formData.ward || undefined,
        role: selectedRole,
        availability: formData.availability,
        experience: formData.experience || undefined,
        message: formData.message || undefined,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit volunteer application:', error);
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
                    item.href === '/get-involved'
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
              Join the Movement
            </h1>
            <p className="text-xl text-[var(--gray-300)] leading-relaxed">
              Real change happens when people come together. Whether you have an hour or a day,
              your contribution matters. Join thousands of volunteers building a better Jigawa.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 bg-[var(--off-white)] border-b border-[var(--gray-200)]">
        <div className="container-premium">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-lg flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-display font-bold text-[var(--navy-deep)] mb-1">{stat.value}</p>
                <p className="text-sm text-[var(--gray-600)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer Roles */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--navy-deep)] mb-4">
              Volunteer Opportunities
            </h2>
            <p className="text-lg text-[var(--gray-600)]">
              Find the role that matches your skills and availability
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {volunteerRoles.map((role) => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`card-premium p-6 cursor-pointer transition-all ${
                  selectedRole === role.id ? 'ring-2 ring-[var(--gold-primary)]' : ''
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-lg flex items-center justify-center mb-4">
                  <role.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--navy-deep)] mb-2">{role.title}</h3>
                <p className="text-[var(--gray-600)] text-sm mb-4">{role.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--gray-500)]">
                    <Clock className="w-4 h-4" />
                    <span>{role.commitment}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--gray-500)]">
                    <MapPin className="w-4 h-4" />
                    <span>{role.location}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--gray-200)]">
                  <p className="text-xs text-[var(--gray-500)] mb-2">Skills needed:</p>
                  <div className="flex flex-wrap gap-2">
                    {role.skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-[var(--gray-100)] text-[var(--gray-700)] text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section id="signup" className="section-padding bg-[var(--off-white)]">
        <div className="container-premium">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--navy-deep)] mb-4">
                Sign Up to Volunteer
              </h2>
              <p className="text-lg text-[var(--gray-600)]">
                Fill out the form below and our team will contact you within 24 hours
              </p>
            </div>

            {isSubmitted ? (
              <div className="card-premium p-12 text-center">
                <div className="w-20 h-20 bg-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-display font-bold text-[var(--navy-deep)] mb-4">Thank You for Signing Up!</h3>
                <p className="text-[var(--gray-600)] mb-6">
                  We've received your application and will contact you within 24 hours to discuss next steps.
                  Welcome to the movement!
                </p>
                <Link href="/" className="btn-primary">
                  Return to Homepage
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card-premium p-8">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">First Name *</label>
                    <input
                      required
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Last Name *</label>
                    <input
                      required
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Phone Number *</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Location/LGA *</label>
                    <input
                      required
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                      placeholder="e.g., Dutse"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Ward (Optional)</label>
                    <input
                      type="text"
                      value={formData.ward}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                      placeholder="e.g., Ward 5"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Preferred Role *</label>
                  <select
                    required
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                  >
                    <option value="">Select a role...</option>
                    {volunteerRoles.map((role) => (
                      <option key={role.id} value={role.id}>{role.title}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Availability *</label>
                  <select
                    required
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                  >
                    <option value="">Select availability...</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="evenings">Evenings only</option>
                    <option value="flexible">Flexible</option>
                    <option value="fulltime">Full-time</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Previous Experience (Optional)</label>
                  <textarea
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                    placeholder="Tell us about any relevant experience..."
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Message (Optional)</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                    placeholder="Why do you want to volunteer?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={volunteerMutation.isPending}
                  className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {volunteerMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
                {volunteerMutation.isError && (
                  <p className="text-red-500 text-sm text-center mt-4">
                    Failed to submit application. Please try again.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Other Ways to Participate */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--navy-deep)] mb-4">
              Other Ways to Participate
            </h2>
            <p className="text-lg text-[var(--gray-600)]">
              Can't volunteer? There are many other ways to support the campaign
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {participationWays.map((way) => (
              <div key={way.title} className="card-premium p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <way.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--navy-deep)] mb-2">{way.title}</h3>
                <p className="text-[var(--gray-600)] text-sm mb-4">{way.description}</p>
                <Link href={way.href} className="text-[var(--gold-primary)] font-medium hover:underline">
                  {way.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-[var(--off-white)]">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--navy-deep)] mb-4">
              Volunteer Stories
            </h2>
            <p className="text-lg text-[var(--gray-600)]">
              Hear from people who are already part of the movement
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card-premium p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Heart key={i} className="w-4 h-4 fill-[var(--gold-primary)] text-[var(--gold-primary)]" />
                  ))}
                </div>
                <blockquote className="text-[var(--gray-700)] mb-6 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--navy-deep)]">{testimonial.name}</p>
                    <p className="text-sm text-[var(--gray-500)]">{testimonial.role}</p>
                    <p className="text-xs text-[var(--gray-400)]">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[var(--navy-deep)] to-[var(--navy-royal)]">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-[var(--gray-300)] mb-8">
              Join thousands of volunteers working to build a better Jigawa
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#signup" className="btn-primary">
                Sign Up Now
              </a>
              <Link href="/donate" className="btn-secondary border-white text-white hover:bg-white hover:text-[var(--navy-deep)]">
                Make a Donation
              </Link>
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
