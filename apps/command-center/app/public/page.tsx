'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ChevronRight,
  Users,
  Heart,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  Award,
  Building2,
  GraduationCap,
  HeartPulse,
  Shield,
  Sprout,
  Briefcase,
  ArrowRight,
  Play,
  Pause,
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

// Policy areas
const policyAreas = [
  {
    icon: GraduationCap,
    title: 'Education',
    description: 'Free primary education and teacher training for every child in Jigawa.',
    stat: '45 Schools',
    progress: 87,
  },
  {
    icon: HeartPulse,
    title: 'Healthcare',
    description: 'Upgrading 30 primary healthcare centers with modern equipment.',
    stat: '28 Centers',
    progress: 93,
  },
  {
    icon: Building2,
    title: 'Infrastructure',
    description: 'Building 300km of roads and 12 bridges to connect communities.',
    stat: '234km Built',
    progress: 78,
  },
  {
    icon: Sprout,
    title: 'Agriculture',
    description: 'Supporting 10,000 farmers with modern equipment and training.',
    stat: '8,500 Farmers',
    progress: 85,
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Community policing initiatives and youth employment programs.',
    stat: '15% Reduction',
    progress: 82,
  },
  {
    icon: Briefcase,
    title: 'Youth Empowerment',
    description: 'Skills training and job creation for 50,000 young people.',
    stat: '42,000 Jobs',
    progress: 84,
  },
];

// Latest news
const latestNews = [
  {
    date: 'March 15, 2026',
    category: 'Policy',
    title: 'Free Primary Education Initiative Launches',
    excerpt: 'Over 45,000 children enrolled in the first month of our free education program.',
    image: '/images/news-education.jpg',
  },
  {
    date: 'March 12, 2026',
    category: 'Event',
    title: 'Campaign Rally Draws 10,000 Supporters in Dutse',
    excerpt: 'The largest gathering yet as citizens show their support for progress.',
    image: '/images/news-rally.jpg',
  },
  {
    date: 'March 10, 2026',
    category: 'Endorsement',
    title: 'Traditional Leaders Unite Behind the Vision',
    excerpt: 'Council of Chiefs and Emirs endorse the campaign for progress.',
    image: '/images/news-endorsement.jpg',
  },
];

// Upcoming events
const upcomingEvents = [
  {
    date: 'Mar 25',
    title: 'Town Hall Meeting',
    location: 'Dutse Central Mosque',
    time: '2:00 PM',
  },
  {
    date: 'Mar 28',
    title: 'Youth Empowerment Summit',
    location: 'Jigawa State Polytechnic',
    time: '10:00 AM',
  },
  {
    date: 'Apr 02',
    title: 'Farmers Forum',
    location: 'Hadejia Stadium',
    time: '9:00 AM',
  },
];

// Statistics
const stats = [
  { label: 'Supporters', value: 50000, suffix: '+' },
  { label: 'Days to Election', value: 247, suffix: '' },
  { label: 'LGAs Covered', value: 27, suffix: '' },
  { label: 'Projects Completed', value: 156, suffix: '' },
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [animatedStats, setAnimatedStats] = useState(stats.map(() => 0));

  // Handle scroll for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate stats on load
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats(
        stats.map((stat) => Math.floor(stat.value * easeOut))
      );

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedStats(stats.map((stat) => stat.value));
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md py-3'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="container-premium">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/public" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl font-display">M</span>
              </div>
              <div className="hidden sm:block">
                <span
                  className={`font-display font-bold text-xl ${
                    isScrolled ? 'text-[#0A1628]' : 'text-white'
                  }`}
                >
                  Musa Danladi
                </span>
                <p
                  className={`text-xs ${
                    isScrolled ? 'text-gray-600' : 'text-white/80'
                  }`}
                >
                  For Jigawa
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-[#D4AF37] ${
                    isScrolled ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/donate"
                className="btn-primary text-sm px-6 py-3"
              >
                Donate
              </Link>
              <Link
                href="/get-involved"
                className={`text-sm font-medium transition-colors ${
                  isScrolled
                    ? 'text-[#0A1628] hover:text-[#D4AF37]'
                    : 'text-white hover:text-[#D4AF37]'
                }`}
              >
                Volunteer
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2"
            >
              {isMenuOpen ? (
                <X
                  className={`w-6 h-6 ${
                    isScrolled ? 'text-[#0A1628]' : 'text-white'
                  }`}
                />
              ) : (
                <Menu
                  className={`w-6 h-6 ${
                    isScrolled ? 'text-[#0A1628]' : 'text-white'
                  }`}
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100">
            <nav className="container-premium py-6 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 font-medium py-2 hover:text-[#D4AF37] transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                <Link href="/donate" className="btn-primary text-center">
                  Donate Now
                </Link>
                <Link
                  href="/get-involved"
                  className="text-center text-[#0A1628] font-medium py-2"
                >
                  Volunteer
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/images/hero-candidate.jpg')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/95 via-[#0A1628]/70 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 container-premium pt-32 pb-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-white/90 text-sm font-medium">
                Official Campaign 2027
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Leadership That{' '}
              <span className="text-[#D4AF37]">Delivers</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl">
              Join Alhaji Musa Danladi in building a Jigawa where every citizen
              thrives. Together, we create progress, prosperity, and pride.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="#join" className="btn-primary text-lg px-8 py-4">
                Join the Movement
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="#vision"
                className="inline-flex items-center justify-center px-8 py-4 text-white font-semibold border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch the Vision
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                <span>Proven Track Record</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                <span>Transparent Governance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                <span>For All Jigawans</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-white/20">
          <div className="container-premium py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="font-mono text-3xl md:text-4xl font-bold text-[#0A1628]">
                    {animatedStats[index].toLocaleString()}
                    {stat.suffix}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-padding section-off-white">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-[#1E3A5F] to-[#0A1628] flex items-center justify-center">
                  <span className="text-white/30 text-6xl font-display">
                    Portrait
                  </span>
                </div>
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-6 max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-8 h-8 text-[#D4AF37]" />
                  <span className="font-display font-bold text-[#0A1628]">
                    15+ Years
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  Of dedicated public service and community development
                </p>
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">
                Meet the Candidate
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0A1628] mt-3 mb-6">
                Alhaji Musa Danladi
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                A visionary leader committed to transforming Jigawa State through
                transparent governance, sustainable development, and inclusive
                policies that put citizens first.
              </p>
              <p className="text-gray-600 mb-8">
                Born and raised in Dutse, Alhaji Musa has dedicated his life to
                public service. From his early days as a community organizer to
                his tenure as Commissioner for Works, he has consistently
                delivered results that improve the lives of ordinary citizens.
              </p>

              {/* Key Points */}
              <div className="space-y-4 mb-8">
                {[
                  'Former Commissioner for Works (2019-2023)',
                  'Built 200+ kilometers of rural roads',
                  'Trained 5,000+ teachers',
                  'Award-winning infrastructure projects',
                ].map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    <span className="text-gray-700">{point}</span>
                  </div>
                ))}
              </div>

              <Link
                href="#full-bio"
                className="inline-flex items-center text-[#0A1628] font-semibold hover:text-[#D4AF37] transition-colors"
              >
                Read Full Biography
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vision/Policy Section */}
      <section id="vision" className="section-padding">
        <div className="container-premium">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">
              Our Vision
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0A1628] mt-3 mb-6">
              A Plan for Progress
            </h2>
            <p className="text-lg text-gray-600">
              Six pillars guiding our journey to transform Jigawa into a model
              state for Nigeria and Africa.
            </p>
          </div>

          {/* Policy Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {policyAreas.map((policy, index) => (
              <div
                key={policy.title}
                className="card-premium p-8 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#B8941F]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <policy.icon className="w-7 h-7 text-[#D4AF37]" />
                </div>

                {/* Content */}
                <h3 className="font-display text-2xl font-bold text-[#0A1628] mb-3">
                  {policy.title}
                </h3>
                <p className="text-gray-600 mb-6">{policy.description}</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-mono font-bold text-[#0A1628]">
                      {policy.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] rounded-full transition-all duration-1000"
                      style={{ width: `${policy.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stat */}
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-mono font-bold text-[#0A1628]">
                    {policy.stat}
                  </span>
                  <span className="text-gray-500">delivered</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              href="#full-platform"
              className="btn-secondary"
            >
              View Complete Platform
              <Download className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Scorecard Section */}
      <section id="scorecard" className="section-padding section-navy">
        <div className="container-premium">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 live-indicator" />
              <span className="text-white/90 text-sm font-medium">
                Live Updates
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 mb-6">
              Governance Scorecard
            </h2>
            <p className="text-lg text-gray-300">
              Transparent accountability. Real results. Every promise tracked.
            </p>
          </div>

          {/* Scorecard Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { label: 'Overall Score', value: '87%', color: '#D4AF37' },
              { label: 'Promises Kept', value: '42/50', color: '#10B981' },
              { label: 'Projects Active', value: '156', color: '#3B82F6' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20"
              >
                <div
                  className="font-mono text-5xl font-bold mb-2"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Detailed Scorecard */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <h3 className="font-display text-2xl font-bold text-white mb-4 md:mb-0">
                Promise Tracker
              </h3>
              <div className="flex gap-2">
                {['All', 'Completed', 'In Progress', 'Upcoming'].map(
                  (filter) => (
                    <button
                      key={filter}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Promise Items */}
            <div className="space-y-4">
              {[
                {
                  status: 'completed',
                  title: 'Free Primary Education',
                  description:
                    'Eliminated school fees for all primary school students',
                  impact: '45,000 children enrolled',
                },
                {
                  status: 'in-progress',
                  title: 'Healthcare Center Upgrades',
                  description:
                    'Modernizing 30 primary healthcare centers across the state',
                  impact: '28/30 completed (93%)',
                },
                {
                  status: 'upcoming',
                  title: 'Agricultural Equipment Program',
                  description:
                    'Providing modern farming equipment to 10,000 farmers',
                  impact: 'Launching Q2 2026',
                },
              ].map((promise) => (
                <div
                  key={promise.title}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      promise.status === 'completed'
                        ? 'bg-green-500/20'
                        : promise.status === 'in-progress'
                        ? 'bg-blue-500/20'
                        : 'bg-gray-500/20'
                    }`}
                  >
                    {promise.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : promise.status === 'in-progress' ? (
                      <Clock className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Calendar className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">
                      {promise.title}
                    </h4>
                    <p className="text-white/60 text-sm mb-2">
                      {promise.description}
                    </p>
                    <span className="text-[#D4AF37] text-sm font-medium">
                      {promise.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="#full-scorecard"
                className="inline-flex items-center text-white font-semibold hover:text-[#D4AF37] transition-colors"
              >
                View Full Scorecard
                <ExternalLink className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="section-padding section-off-white">
        <div className="container-premium">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">
                Latest Updates
              </span>
              <h2 className="font-display text-4xl font-bold text-[#0A1628] mt-2">
                Campaign News
              </h2>
            </div>
            <Link
              href="#all-news"
              className="mt-4 md:mt-0 inline-flex items-center text-[#0A1628] font-semibold hover:text-[#D4AF37] transition-colors"
            >
              View All News
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          {/* News Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {latestNews.map((news, index) => (
              <article
                key={news.title}
                className="card-premium overflow-hidden group"
              >
                {/* Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-[#1E3A5F] to-[#0A1628] flex items-center justify-center">
                  <span className="text-white/30 font-display text-2xl">
                    Image {index + 1}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                      {news.category}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{news.date}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#0A1628] mb-3 group-hover:text-[#D4AF37] transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{news.excerpt}</p>
                  <Link
                    href="#"
                    className="inline-flex items-center text-[#0A1628] font-medium text-sm hover:text-[#D4AF37] transition-colors"
                  >
                    Read More
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="section-padding">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">
                Join Us
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0A1628] mt-3 mb-6">
                Upcoming Events
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Meet Alhaji Musa in person, ask questions, and connect with
                fellow supporters at events across Jigawa State.
              </p>

              {/* Event List */}
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.title}
                    className="flex gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:border-[#D4AF37] hover:shadow-lg transition-all cursor-pointer"
                  >
                    {/* Date */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-[#0A1628] to-[#1E3A5F] flex flex-col items-center justify-center text-white">
                      <span className="text-xs font-medium">
                        {event.date.split(' ')[0]}
                      </span>
                      <span className="text-lg font-bold">
                        {event.date.split(' ')[1]}
                      </span>
                    </div>
                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#0A1628] mb-1">
                        {event.title}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </span>
                      </div>
                    </div>
                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-gray-400 self-center" />
                  </div>
                ))}
              </div>

              <Link
                href="#all-events"
                className="inline-flex items-center mt-8 text-[#0A1628] font-semibold hover:text-[#D4AF37] transition-colors"
              >
                View All Events
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            {/* Map Placeholder */}
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#0A1628] flex items-center justify-center shadow-2xl">
                <div className="text-center text-white/50">
                  <MapPin className="w-16 h-16 mx-auto mb-4" />
                  <span className="font-display text-2xl">Interactive Map</span>
                  <p className="mt-2">Event locations across Jigawa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0A1628] to-[#1E3A5F]">
        <div className="container-premium text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Be Part of the Change
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            This campaign belongs to the people of Jigawa. Join thousands of
            supporters working together for progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#donate" className="btn-primary text-lg px-10 py-4">
              Donate Now
            </Link>
            <Link
              href="#volunteer"
              className="inline-flex items-center justify-center px-10 py-4 text-white font-semibold border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all text-lg"
            >
              <Users className="mr-2 w-5 h-5" />
              Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding section-off-white">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">
                Get in Touch
              </span>
              <h2 className="font-display text-4xl font-bold text-[#0A1628] mt-3 mb-6">
                Contact Us
              </h2>
              <p className="text-gray-600 mb-8">
                Have questions or want to get involved? Reach out to our team.
                We&apos;re here to help.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0A1628]">
                      Campaign Headquarters
                    </h4>
                    <p className="text-gray-600">
                      123 Main Street, Dutse, Jigawa State
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0A1628]">Phone</h4>
                    <p className="text-gray-600">+234 800 123 4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0A1628]">Email</h4>
                    <p className="text-gray-600">contact@musadanladi.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0A1628]">WhatsApp</h4>
                    <p className="text-gray-600">+234 800 123 4567</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="font-display text-2xl font-bold text-[#0A1628] mb-6">
                Send a Message
              </h3>
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A1628] text-white py-16">
        <div className="container-premium">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center">
                  <span className="text-white font-bold text-xl font-display">
                    M
                  </span>
                </div>
                <span className="font-display font-bold text-2xl">
                  Musa Danladi
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Leadership that delivers for Jigawa. Together, we build a state
                where every citizen thrives.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {['About', 'Vision', 'Scorecard', 'News', 'Events'].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href={`#${link.toLowerCase()}`}
                        className="text-gray-400 hover:text-[#D4AF37] transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Get Involved */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Get Involved</h4>
              <ul className="space-y-2">
                {['Donate', 'Volunteer', 'Host an Event', 'Store', 'Contact'].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href={`#${link.toLowerCase().replace(' ', '-')}`}
                        className="text-gray-400 hover:text-[#D4AF37] transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 Musa Danladi Campaign. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
