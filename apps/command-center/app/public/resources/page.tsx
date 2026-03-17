'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ChevronRight,
  Download,
  FileText,
  Video,
  Image,
  Mic,
  Users,
  Newspaper,
  BookOpen,
  HelpCircle,
  ArrowLeft,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Search,
  ExternalLink,
  CheckCircle,
  Lock,
  Eye,
  Share2,
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

// Resource categories
const resourceCategories = [
  {
    id: 'voters',
    title: 'For Voters',
    description: 'Everything you need to know about voting and the election process.',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
    resources: [
      { title: 'Voter Registration Guide', type: 'pdf', size: '2.4 MB' },
      { title: 'How to Check Your PVC Status', type: 'video', size: '5 min' },
      { title: 'Election Day Guide', type: 'pdf', size: '1.8 MB' },
      { title: 'Polling Unit Locator', type: 'link', size: 'Web Tool' },
    ],
  },
  {
    id: 'journalists',
    title: 'For Journalists',
    description: 'Press kits, media resources, and official statements.',
    icon: Newspaper,
    color: 'from-purple-500 to-purple-600',
    resources: [
      { title: 'Press Kit (High-Res Photos)', type: 'zip', size: '45 MB' },
      { title: 'Official Biography', type: 'pdf', size: '3.2 MB' },
      { title: 'Policy Briefs', type: 'pdf', size: '8.5 MB' },
      { title: 'Media Contact Information', type: 'pdf', size: '0.5 MB' },
    ],
  },
  {
    id: 'researchers',
    title: 'For Researchers',
    description: 'Data, reports, and academic resources.',
    icon: BookOpen,
    color: 'from-green-500 to-green-600',
    resources: [
      { title: 'Governance Scorecard Data', type: 'xlsx', size: '1.2 MB' },
      { title: 'Policy Research Papers', type: 'pdf', size: '12 MB' },
      { title: 'Campaign Finance Reports', type: 'pdf', size: '2.1 MB' },
      { title: 'API Documentation', type: 'link', size: 'Web' },
    ],
  },
  {
    id: 'party',
    title: 'For Party Members',
    description: 'Internal resources, training materials, and coordination tools.',
    icon: Users,
    color: 'from-amber-500 to-amber-600',
    resources: [
      { title: 'Campaign Strategy Guide', type: 'pdf', size: '5.6 MB' },
      { title: 'Volunteer Training Manual', type: 'pdf', size: '8.9 MB' },
      { title: 'Messaging Guidelines', type: 'pdf', size: '2.3 MB' },
      { title: 'Canvassing Scripts', type: 'pdf', size: '1.5 MB' },
    ],
  },
];

// FAQ data
const faqCategories = [
  {
    id: 'general',
    name: 'General',
    questions: [
      {
        q: 'Who is Alhaji Musa Danladi?',
        a: 'Alhaji Musa Danladi is the current Governor of Jigawa State, elected in 2023. He has a proven track record of delivering results in education, healthcare, and infrastructure development.',
      },
      {
        q: 'What is the campaign\'s main message?',
        a: 'Our campaign is built on the message of "Leadership That Delivers" - focusing on proven results, transparency, and inclusive governance that benefits all citizens of Jigawa.',
      },
      {
        q: 'How can I get involved?',
        a: 'You can volunteer, donate, host events, or simply spread the word. Visit our Get Involved page to find the opportunity that suits you best.',
      },
    ],
  },
  {
    id: 'voting',
    name: 'Voting',
    questions: [
      {
        q: 'When is the election?',
        a: 'The gubernatorial election is scheduled for March 2027. Make sure you have your PVC and know your polling unit.',
      },
      {
        q: 'How do I check my voter registration?',
        a: 'You can check your registration status on the INEC website or via their mobile app. You\'ll need your VIN from your PVC.',
      },
      {
        q: 'What should I bring on election day?',
        a: 'Bring your Permanent Voter Card (PVC) and arrive early at your polling unit. Follow all COVID-19 protocols if still in place.',
      },
    ],
  },
  {
    id: 'volunteer',
    name: 'Volunteering',
    questions: [
      {
        q: 'What volunteer opportunities are available?',
        a: 'We need door-to-door canvassers, phone bank volunteers, event coordinators, digital ambassadors, drivers, and polling unit agents.',
      },
      {
        q: 'Do I need experience to volunteer?',
        a: 'No experience is necessary! We provide training for all roles. Your enthusiasm and commitment are what matter most.',
      },
      {
        q: 'How much time do I need to commit?',
        a: 'It\'s flexible - from a few hours a week to full-time. You choose the role and schedule that works for you.',
      },
    ],
  },
  {
    id: 'donate',
    name: 'Donations',
    questions: [
      {
        q: 'How can I donate?',
        a: 'You can donate online via our secure donation page using card, bank transfer, USSD, or international payment methods.',
      },
      {
        q: 'Is my donation secure?',
        a: 'Yes, all donations are processed through secure, encrypted channels. We never store your card details.',
      },
      {
        q: 'Will my donation be public?',
        a: 'You can choose to remain anonymous or have your name displayed on our donor wall. It\'s entirely up to you.',
      },
    ],
  },
];

// Quick links
const quickLinks = [
  { title: 'Download Manifesto', icon: FileText, href: '#' },
  { title: 'Watch Campaign Videos', icon: Video, href: '#' },
  { title: 'View Photo Gallery', icon: Image, href: '#' },
  { title: 'Listen to Speeches', icon: Mic, href: '#' },
];

export default function ResourcesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('voters');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqCategories.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0);

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
                    item.href === '/resources'
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
              Resource Center
            </h1>
            <p className="text-xl text-[var(--gray-300)]">
              Download materials, access data, and find answers to common questions.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-[var(--off-white)] border-b">
        <div className="container-premium">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <a
                key={link.title}
                href={link.href}
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-[var(--gold-light)] rounded-lg flex items-center justify-center">
                  <link.icon className="w-5 h-5 text-[var(--gold-dark)]" />
                </div>
                <span className="font-medium text-[var(--navy-deep)]">{link.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Resources by Category */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-bold text-[var(--navy-deep)] mb-4">Resources by Category</h2>
            <p className="text-[var(--gray-600)]">
              Find the resources you need, organized by audience type.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resourceCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`card-premium p-6 cursor-pointer transition-all ${
                  activeCategory === cat.id ? 'ring-2 ring-[var(--gold-primary)]' : ''
                }`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-lg flex items-center justify-center mb-4`}>
                  <cat.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--navy-deep)] mb-2">{cat.title}</h3>
                <p className="text-sm text-[var(--gray-600)] mb-4">{cat.description}</p>
                <div className="flex items-center gap-2 text-[var(--gold-primary)] text-sm font-medium">
                  <span>{cat.resources.length} resources</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          {/* Active Category Resources */}
          <div className="mt-12">
            {resourceCategories.map((cat) => (
              activeCategory === cat.id && (
                <div key={cat.id} className="card-premium p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-lg flex items-center justify-center`}>
                      <cat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-[var(--navy-deep)]">{cat.title}</h3>
                      <p className="text-[var(--gray-600)]">{cat.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {cat.resources.map((resource) => (
                      <div
                        key={resource.title}
                        className="flex items-center justify-between p-4 bg-[var(--gray-50)] rounded-lg hover:bg-[var(--gray-100)] transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            {resource.type === 'pdf' && <FileText className="w-5 h-5 text-red-500" />}
                            {resource.type === 'video' && <Video className="w-5 h-5 text-blue-500" />}
                            {resource.type === 'link' && <ExternalLink className="w-5 h-5 text-green-500" />}
                            {resource.type === 'zip' && <Lock className="w-5 h-5 text-purple-500" />}
                            {resource.type === 'xlsx' && <FileText className="w-5 h-5 text-green-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--navy-deep)] group-hover:text-[var(--gold-primary)] transition-colors">
                              {resource.title}
                            </p>
                            <p className="text-sm text-[var(--gray-500)]">
                              {resource.type.toUpperCase()} · {resource.size}
                            </p>
                          </div>
                        </div>
                        <Download className="w-5 h-5 text-[var(--gray-400)] group-hover:text-[var(--gold-primary)] transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-[var(--off-white)]">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-bold text-[var(--navy-deep)] mb-4">Frequently Asked Questions</h2>
            <p className="text-[var(--gray-600)]">
              Find answers to common questions about the campaign, voting, and getting involved.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--gray-400)]" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
              />
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="grid md:grid-cols-2 gap-8">
            {filteredFaqs.map((category) => (
              <div key={category.id}>
                <h3 className="text-xl font-semibold text-[var(--navy-deep)] mb-4">{category.name}</h3>
                <div className="space-y-3">
                  {category.questions.map((faq, index) => {
                    const faqId = `${category.id}-${index}`;
                    const isOpen = openFaq === faqId;
                    return (
                      <div key={index} className="bg-white rounded-lg overflow-hidden">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : faqId)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <span className="font-medium text-[var(--navy-deep)]">{faq.q}</span>
                          <ChevronRight
                            className={`w-5 h-5 text-[var(--gray-400)] transition-transform ${
                              isOpen ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4">
                            <p className="text-[var(--gray-600)]">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-[var(--gray-300)] mx-auto mb-4" />
              <p className="text-[var(--gray-600)]">No FAQs found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="card-premium p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-[var(--navy-deep)] mb-4">Still Need Help?</h2>
            <p className="text-[var(--gray-600)] mb-6">
              Can\'t find what you\'re looking for? Contact us directly and we\'ll be happy to assist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary">
                Contact Us
              </Link>
              <a href="mailto:info@musadanladi.com" className="btn-secondary">
                Email Support
              </a>
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
                <li><Link href="/events">Events</Link></li>
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
