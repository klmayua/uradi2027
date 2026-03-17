'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Share2,
  ArrowLeft,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Eye,
  Calendar,
  FileText,
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

// Scorecard categories
const scorecardCategories = [
  { id: 'all', name: 'All Promises', count: 47 },
  { id: 'education', name: 'Education', count: 12 },
  { id: 'healthcare', name: 'Healthcare', count: 8 },
  { id: 'infrastructure', name: 'Infrastructure', count: 10 },
  { id: 'agriculture', name: 'Agriculture', count: 7 },
  { id: 'security', name: 'Security', count: 5 },
  { id: 'youth', name: 'Youth Empowerment', count: 5 },
];

// Promises data
const promises = [
  {
    id: 1,
    title: 'Build 50 new primary schools',
    category: 'education',
    status: 'in-progress',
    progress: 90,
    dueDate: 'Dec 2026',
    description: 'Construction of 45 schools completed, 5 under construction.',
    updates: [
      { date: 'Mar 2026', text: '5 schools completed in Birnin Kudu LGA' },
      { date: 'Feb 2026', text: '10 schools completed in Dutse LGA' },
    ],
  },
  {
    id: 2,
    title: 'Upgrade 30 primary healthcare centers',
    category: 'healthcare',
    status: 'completed',
    progress: 100,
    dueDate: 'Completed',
    description: 'All 30 healthcare centers upgraded with modern equipment.',
    updates: [
      { date: 'Mar 2026', text: 'Final 2 centers completed in Gumel' },
    ],
  },
  {
    id: 3,
    title: 'Construct 300km of rural roads',
    category: 'infrastructure',
    status: 'in-progress',
    progress: 78,
    dueDate: 'Jun 2027',
    description: '234km completed, 66km remaining across 5 LGAs.',
    updates: [
      { date: 'Mar 2026', text: '45km completed in Hadejia zone' },
    ],
  },
  {
    id: 4,
    title: 'Support 10,000 farmers with equipment',
    category: 'agriculture',
    status: 'in-progress',
    progress: 85,
    dueDate: 'Sep 2026',
    description: '8,500 farmers received equipment and training.',
    updates: [
      { date: 'Mar 2026', text: '1,500 new farmers enrolled' },
    ],
  },
  {
    id: 5,
    title: 'Reduce crime rate by 20%',
    category: 'security',
    status: 'in-progress',
    progress: 75,
    dueDate: 'Dec 2026',
    description: 'Crime reduced by 15% through community policing.',
    updates: [
      { date: 'Mar 2026', text: 'Youth employment program launched' },
    ],
  },
  {
    id: 6,
    title: 'Create 50,000 jobs for youth',
    category: 'youth',
    status: 'in-progress',
    progress: 84,
    dueDate: 'Dec 2026',
    description: '42,000 jobs created through various programs.',
    updates: [
      { date: 'Mar 2026', text: '5,000 new jobs in tech sector' },
    ],
  },
];

// Overall stats
const overallStats = [
  { label: 'Total Promises', value: 47, icon: Target },
  { label: 'Completed', value: 18, icon: CheckCircle, color: 'text-[var(--success)]' },
  { label: 'In Progress', value: 24, icon: Clock, color: 'text-[var(--warning)]' },
  { label: 'Not Started', value: 5, icon: AlertCircle, color: 'text-[var(--gray-500)]' },
];

// Status helpers
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'completed':
      return {
        icon: CheckCircle,
        color: 'text-[var(--success)]',
        bgColor: 'bg-[var(--success)]/10',
        label: 'Completed',
      };
    case 'in-progress':
      return {
        icon: Clock,
        color: 'text-[var(--warning)]',
        bgColor: 'bg-[var(--warning)]/10',
        label: 'In Progress',
      };
    case 'not-started':
      return {
        icon: AlertCircle,
        color: 'text-[var(--gray-500)]',
        bgColor: 'bg-[var(--gray-200)]',
        label: 'Not Started',
      };
    default:
      return {
        icon: Minus,
        color: 'text-[var(--gray-500)]',
        bgColor: 'bg-[var(--gray-200)]',
        label: 'Unknown',
      };
  }
};

export default function ScorecardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPromise, setSelectedPromise] = useState<typeof promises[0] | null>(null);

  const filteredPromises = activeCategory === 'all'
    ? promises
    : promises.filter((p) => p.category === activeCategory);

  const completionRate = Math.round((18 / 47) * 100);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--gray-200)]">
        <div className="container-premium">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-display font-bold text-[var(--navy-deep)] text-lg leading-tight">Musa Danladi</p>
                <p className="text-xs text-[var(--gray-500)]">For Jigawa 2027</p>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    item.href === '/scorecard'
                      ? 'text-[var(--gold-primary)]'
                      : 'text-[var(--gray-700)] hover:text-[var(--gold-primary)]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <Link href="/get-involved" className="btn-secondary text-sm py-2.5 px-5">
                Volunteer
              </Link>
              <Link href="/donate" className="btn-primary text-sm py-2.5 px-5">
                Donate
              </Link>
            </div>

            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[var(--gray-200)]">
            <div className="container-premium py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-[var(--gray-700)] hover:text-[var(--gold-primary)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[var(--navy-deep)] via-[var(--navy-royal)] to-[var(--navy-deep)]">
        <div className="container-premium">
          <div className="max-w-3xl">
            <Link href="/" className="inline-flex items-center gap-2 text-[var(--gold-light)] hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              Governance Scorecard
            </h1>
            <p className="text-xl text-[var(--gray-300)]">
              Real-time tracking of our campaign promises and delivery progress.
              Transparency in action.
            </p>
          </div>
        </div>
      </section>

      {/* Overall Progress */}
      <section className="py-12 bg-[var(--off-white)] border-b">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-[var(--gold-primary)]" />
                <span className="font-semibold text-[var(--navy-deep)]">Live Transparency Dashboard</span>
              </div>
              <h2 className="text-3xl font-display font-bold text-[var(--navy-deep)] mb-4">
                {completionRate}% Overall Completion
              </h2>
              <div className="w-full h-4 bg-[var(--gray-200)] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-full transition-all duration-1000"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="text-[var(--gray-600)]">
                Last updated: {new Date().toLocaleDateString('en-NG', { dateStyle: 'long' })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {overallStats.map((stat) => (
                <div key={stat.label} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color || 'text-[var(--navy-royal)]'}`} />
                    <span className="text-sm text-[var(--gray-500)]">{stat.label}</span>
                  </div>
                  <p className={`text-2xl font-display font-bold ${stat.color || 'text-[var(--navy-deep)]'}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-20 z-40 bg-white border-b shadow-sm">
        <div className="container-premium">
          <div className="flex overflow-x-auto gap-2 py-4 no-scrollbar">
            {scorecardCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[var(--navy-deep)] text-white'
                    : 'bg-[var(--gray-100)] text-[var(--gray-700)] hover:bg-[var(--gray-200)]'
                }`}
              >
                <span className="text-sm font-medium">{cat.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeCategory === cat.id ? 'bg-white/20' : 'bg-[var(--gray-200)]'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Promises Grid */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromises.map((promise) => {
              const statusConfig = getStatusConfig(promise.status);
              return (
                <div
                  key={promise.id}
                  onClick={() => setSelectedPromise(promise)}
                  className="card-premium p-6 cursor-pointer hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                      <statusConfig.icon className="w-3.5 h-3.5" />
                      <span>{statusConfig.label}</span>
                    </div>
                    <span className="text-xs text-[var(--gray-400)]">Due: {promise.dueDate}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-[var(--navy-deep)] mb-2">{promise.title}</h3>
                  <p className="text-sm text-[var(--gray-600)] mb-4">{promise.description}</p>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[var(--gray-500)]">Progress</span>
                      <span className="font-semibold text-[var(--navy-deep)]">{promise.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--gray-200)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          promise.status === 'completed'
                            ? 'bg-[var(--success)]'
                            : 'bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-dark)]'
                        }`}
                        style={{ width: `${promise.progress}%` }}
                      />
                    </div>
                  </div>

                  <button className="text-sm text-[var(--gold-primary)] font-medium hover:underline">
                    View Details →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Promise Detail Modal */}
      {selectedPromise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                    getStatusConfig(selectedPromise.status).bgColor
                  } ${getStatusConfig(selectedPromise.status).color}`}>
                    {getStatusConfig(selectedPromise.status).label}
                  </div>
                  <h2 className="text-2xl font-display font-bold text-[var(--navy-deep)]">{selectedPromise.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedPromise(null)}
                  className="p-2 hover:bg-[var(--gray-100)] rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-[var(--gray-700)]">{selectedPromise.description}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[var(--navy-deep)]">Progress</span>
                  <span className="text-2xl font-display font-bold text-[var(--gold-primary)]">{selectedPromise.progress}%</span>
                </div>
                <div className="w-full h-3 bg-[var(--gray-200)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-full"
                    style={{ width: `${selectedPromise.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--gray-50)] rounded-lg">
                  <div className="flex items-center gap-2 text-[var(--gray-500)] mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Due Date</span>
                  </div>
                  <p className="font-semibold text-[var(--navy-deep)]">{selectedPromise.dueDate}</p>
                </div>
                <div className="p-4 bg-[var(--gray-50)] rounded-lg">
                  <div className="flex items-center gap-2 text-[var(--gray-500)] mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">Category</span>
                  </div>
                  <p className="font-semibold text-[var(--navy-deep)] capitalize">{selectedPromise.category}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[var(--navy-deep)] mb-3">Recent Updates</h4>
                <div className="space-y-3">
                  {selectedPromise.updates.map((update, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-2 h-2 bg-[var(--gold-primary)] rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-[var(--gray-400)]">{update.date}</span>
                        <p className="text-sm text-[var(--gray-700)]">{update.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[var(--navy-deep)] to-[var(--navy-royal)]">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-white mb-6">Hold Us Accountable</h2>
            <p className="text-xl text-[var(--gray-300)] mb-8">
              This scorecard is updated weekly. Download the full report or share with your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary inline-flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download Report
              </button>
              <button className="btn-secondary border-white text-white hover:bg-white hover:text-[var(--navy-deep)] inline-flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Scorecard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--navy-deep)] text-white py-16">
        <div className="container-premium">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <p className="font-display font-bold">Musa Danladi</p>
                  <p className="text-xs text-[var(--gray-400)]">For Jigawa 2027</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-[var(--gray-400)]">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/vision">Vision</Link></li>
                <li><Link href="/scorecard">Scorecard</Link></li>
                <li><Link href="/news">News</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Get Involved</h4>
              <ul className="space-y-2 text-sm text-[var(--gray-400)]">
                <li><Link href="/get-involved">Volunteer</Link></li>
                <li><Link href="/donate">Donate</Link></li>
                <li><Link href="/get-involved">Host Event</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-[var(--gray-400)]">
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Dutse, Jigawa</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +234 800 123 4567</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> contact@musadanladi.com</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-sm text-[var(--gray-500)]">
            © 2026 Musa Danladi Campaign. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
