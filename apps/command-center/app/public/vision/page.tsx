'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  HeartPulse,
  Building2,
  Sprout,
  Shield,
  Briefcase,
  Users,
  TrendingUp,
  CheckCircle,
  Download,
  ArrowLeft,
  Target,
  Lightbulb,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

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

// Policy pillars
const policyPillars = [
  {
    id: 'education',
    icon: GraduationCap,
    title: 'Education Reform',
    tagline: 'Every Child Deserves Quality Education',
    color: 'from-blue-500 to-blue-600',
    stats: [
      { value: '45', label: 'New Schools Built' },
      { value: '2,500+', label: 'Teachers Trained' },
      { value: '87%', label: 'Enrollment Increase' },
    ],
    initiatives: [
      'Free primary education for all children',
      'Teacher training and professional development',
      'School infrastructure modernization',
      'Digital literacy programs',
      'Scholarships for higher education',
    ],
    description: `Education is the foundation of prosperity. Our comprehensive education reform focuses on access, quality, and outcomes. We've built 45 new schools, trained over 2,500 teachers, and increased enrollment by 87%.`,
  },
  {
    id: 'healthcare',
    icon: HeartPulse,
    title: 'Healthcare Access',
    tagline: 'Quality Healthcare Within Reach',
    color: 'from-red-500 to-red-600',
    stats: [
      { value: '28', label: 'Health Centers Upgraded' },
      { value: '150k', label: 'Patients Served' },
      { value: '93%', label: 'Equipment Delivered' },
    ],
    initiatives: [
      'Primary healthcare center upgrades',
      'Free maternal and child health services',
      'Mobile clinics for rural areas',
      'Medical equipment modernization',
      'Health insurance for vulnerable populations',
    ],
    description: `Healthcare is a right, not a privilege. We've upgraded 28 primary healthcare centers with modern equipment, served over 150,000 patients, and ensured 93% of planned equipment has been delivered.`,
  },
  {
    id: 'infrastructure',
    icon: Building2,
    title: 'Infrastructure',
    tagline: 'Building Connections, Creating Opportunities',
    color: 'from-amber-500 to-amber-600',
    stats: [
      { value: '234km', label: 'Roads Constructed' },
      { value: '12', label: 'Bridges Built' },
      { value: '78%', label: 'Project Completion' },
    ],
    initiatives: [
      'Rural road construction and rehabilitation',
      'Bridge construction for river crossings',
      'Water supply infrastructure',
      'Electricity expansion projects',
      'Public building construction',
    ],
    description: `Infrastructure connects communities and drives economic growth. We've constructed 234km of roads, built 12 bridges, and achieved 78% completion of our infrastructure development plan.`,
  },
  {
    id: 'agriculture',
    icon: Sprout,
    title: 'Agriculture',
    tagline: 'Empowering Farmers, Feeding the Nation',
    color: 'from-green-500 to-green-600',
    stats: [
      { value: '8,500', label: 'Farmers Supported' },
      { value: '5,000', label: 'Hectares Cultivated' },
      { value: '85%', label: 'Target Reached' },
    ],
    initiatives: [
      'Modern farming equipment distribution',
      'Agricultural training and extension services',
      'Fertilizer and seed subsidies',
      'Irrigation system development',
      'Market access and storage facilities',
    ],
    description: `Agriculture is the backbone of our economy. We've supported 8,500 farmers with modern equipment, cultivated 5,000 hectares, and reached 85% of our agricultural development targets.`,
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Security',
    tagline: 'Safety and Peace for All',
    color: 'from-purple-500 to-purple-600',
    stats: [
      { value: '15%', label: 'Crime Reduction' },
      { value: '500+', label: 'Youth Employed' },
      { value: '82%', label: 'Initiative Progress' },
    ],
    initiatives: [
      'Community policing programs',
      'Youth employment initiatives',
      'Intelligence gathering networks',
      'Security equipment provision',
      'Conflict resolution mechanisms',
    ],
    description: `Security is essential for development. Our community policing initiatives have reduced crime by 15%, employed over 500 youth, and achieved 82% progress on security initiatives.`,
  },
  {
    id: 'youth',
    icon: Briefcase,
    title: 'Youth Empowerment',
    tagline: 'Creating Opportunities for the Next Generation',
    color: 'from-cyan-500 to-cyan-600',
    stats: [
      { value: '42,000', label: 'Jobs Created' },
      { value: '10,000', label: 'Skills Trained' },
      { value: '84%', label: 'Employment Rate' },
    ],
    initiatives: [
      'Vocational training programs',
      'Apprenticeship opportunities',
      'Small business support and loans',
      'Digital skills training',
      'Sports and recreation facilities',
    ],
    description: `Our youth are our future. We've created 42,000 jobs, trained 10,000 young people in valuable skills, and achieved an 84% employment rate among program participants.`,
  },
];

// Key commitments
const commitments = [
  {
    title: 'Transparency',
    description: 'Real-time publication of all government spending and project progress.',
    icon: Target,
  },
  {
    title: 'Accountability',
    description: 'Regular town halls and direct feedback mechanisms with citizens.',
    icon: CheckCircle,
  },
  {
    title: 'Innovation',
    description: 'Embracing technology and new ideas to solve old problems.',
    icon: Lightbulb,
  },
  {
    title: 'Inclusivity',
    description: 'Ensuring every community, regardless of size, has a voice.',
    icon: Users,
  },
];

export default function VisionPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState('education');

  const activePolicyData = policyPillars.find((p) => p.id === activePolicy);

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
                    item.href === '/vision'
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
              Our Vision for Jigawa
            </h1>
            <p className="text-xl text-[var(--gray-300)] leading-relaxed mb-8">
              A comprehensive platform built on six pillars of development. Each policy area
              represents our commitment to transforming Jigawa into a model of progress and prosperity.
            </p>
            <a href="#" className="inline-flex items-center gap-2 text-[var(--gold-primary)] hover:text-[var(--gold-light)] font-medium">
              <Download className="w-5 h-5" />
              <span>Download Full Platform (PDF)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Policy Navigation */}
      <section className="sticky top-20 z-40 bg-white border-b border-[var(--gray-200)] shadow-sm">
        <div className="container-premium">
          <div className="flex overflow-x-auto gap-2 py-4 no-scrollbar">
            {policyPillars.map((pillar) => (
              <button
                key={pillar.id}
                onClick={() => setActivePolicy(pillar.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activePolicy === pillar.id
                    ? 'bg-[var(--navy-deep)] text-white'
                    : 'bg-[var(--gray-100)] text-[var(--gray-700)] hover:bg-[var(--gray-200)]'
                }`}
              >
                <pillar.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{pillar.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Active Policy Detail */}
      <section className="section-padding">
        <div className="container-premium">
          {activePolicyData && (
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${activePolicyData.color} bg-opacity-10 rounded-full mb-6`}>
                  <activePolicyData.icon className="w-5 h-5 text-white" />
                  <span className="text-sm font-semibold text-white">{activePolicyData.title}</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--navy-deep)] mb-4">
                  {activePolicyData.tagline}
                </h2>

                <p className="text-lg text-[var(--gray-600)] leading-relaxed mb-8">
                  {activePolicyData.description}
                </p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-[var(--navy-deep)] mb-4">Key Initiatives</h3>
                  <ul className="space-y-3">
                    {activePolicyData.initiatives.map((initiative, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-[var(--gold-light)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-[var(--gold-dark)]" />
                        </div>
                        <span className="text-[var(--gray-700)]">{initiative}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link href="/scorecard" className="btn-primary">
                    View Progress
                  </Link>
                  <a href="#" className="btn-secondary">
                    Download Policy Brief
                  </a>
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                <div className="card-premium p-6">
                  <h3 className="text-lg font-semibold text-[var(--navy-deep)] mb-6">Progress Metrics</h3>
                  <div className="space-y-6">
                    {activePolicyData.stats.map((stat) => (
                      <div key={stat.label} className="text-center p-4 bg-[var(--gray-50)] rounded-lg">
                        <p className="text-3xl font-display font-bold text-[var(--gold-primary)] mb-1">{stat.value}</p>
                        <p className="text-sm text-[var(--gray-600)]">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-premium p-6">
                  <h3 className="text-lg font-semibold text-[var(--navy-deep)] mb-4">Related Policies</h3>
                  <div className="space-y-3">
                    {policyPillars
                      .filter((p) => p.id !== activePolicy)
                      .slice(0, 3)
                      .map((pillar) => (
                        <button
                          key={pillar.id}
                          onClick={() => setActivePolicy(pillar.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--gray-50)] transition-colors text-left"
                        >
                          <div className={`w-10 h-10 bg-gradient-to-br ${pillar.color} rounded-lg flex items-center justify-center`}>
                            <pillar.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-[var(--navy-deep)]">{pillar.title}</p>
                            <ChevronRight className="w-4 h-4 text-[var(--gray-400)]" />
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* All Policies Grid */}
      <section className="section-padding bg-[var(--off-white)]">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--navy-deep)] mb-4">
              Six Pillars of Progress
            </h2>
            <p className="text-lg text-[var(--gray-600)]">
              Our comprehensive approach to transforming Jigawa
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policyPillars.map((pillar) => (
              <button
                key={pillar.id}
                onClick={() => {
                  setActivePolicy(pillar.id);
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className={`card-premium p-6 text-left transition-all hover:shadow-xl ${
                  activePolicy === pillar.id ? 'ring-2 ring-[var(--gold-primary)]' : ''
                }`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${pillar.color} rounded-lg flex items-center justify-center mb-4`}>
                  <pillar.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--navy-deep)] mb-2">{pillar.title}</h3>
                <p className="text-[var(--gray-600)] text-sm mb-4">{pillar.tagline}</p>
                <div className="flex items-center gap-2 text-[var(--gold-primary)] font-medium text-sm">
                  <span>Learn More</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Commitments Section */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--navy-deep)] mb-4">
              Our Commitments
            </h2>
            <p className="text-lg text-[var(--gray-600)]">
              The principles that guide our implementation
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {commitments.map((commitment) => (
              <div key={commitment.title} className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <commitment.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--navy-deep)] mb-2">{commitment.title}</h3>
                <p className="text-[var(--gray-600)]">{commitment.description}</p>
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
              Help Us Deliver This Vision
            </h2>
            <p className="text-xl text-[var(--gray-300)] mb-8">
              Join thousands of supporters working to build a better Jigawa
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/get-involved" className="btn-primary">
                Get Involved
              </Link>
              <Link href="/donate" className="btn-secondary border-white text-white hover:bg-white hover:text-[var(--navy-deep)]">
                Donate Now
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
