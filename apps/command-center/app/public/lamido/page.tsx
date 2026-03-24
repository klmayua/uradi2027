'use client';

/**
 * THE STATESMAN - Mustapha Sule Lamido Landing Page
 * A premium campaign landing page inspired by the provided design
 * Adapted for Uradi-360's dark theme with gold accents
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  X,
  ChevronRight,
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  ArrowRight,
  School,
  ShieldAlert,
  Leaf,
  HeartHandshake,
  Phone,
  Mail,
  Support,
  Construction,
  Stethoscope,
  Globe,
  Rss,
  Droplets,
} from 'lucide-react';
import { DynamicNavigation } from '@/components/public/DynamicNavigation';
import { DynamicButton } from '@/components/public/DynamicButton';
import {
  useBranding,
  useCandidateInfo,
  useBrandingContent,
} from '@/components/public/BrandingProvider';
import { cn } from '@/lib/utils';

// Campaign-specific configuration for Lamido
const LAMIDO_CONFIG = {
  name: 'Mustapha Sule Lamido',
  title: 'For Governor',
  slogan: 'Vision for Progress',
  location: 'Jigawa State',
  party: 'ADC',
  theme: {
    primary: '#00113a', // Deep navy
    secondary: '#006d35', // Green (progress)
    accent: '#C8A94E', // Gold (from Uradi)
  },
  stats: [
    { value: 368726, suffix: '', label: 'Votes in 2023' },
    { value: 27, suffix: '', label: 'LGAs Covered' },
    { value: 13500, suffix: '', label: 'Anchor Citizens' },
    { value: 1350, suffix: '', label: 'Youth Ambassadors' },
  ],
  pillars: [
    {
      icon: School,
      title: 'Education Reimagined',
      description:
        'Transforming our schools into hubs of digital innovation and vocational mastery, ensuring every child has a path to success.',
    },
    {
      icon: TrendingUp,
      title: 'Economic Stability',
      description:
        'Fostering small business growth through strategic investment, agricultural modernization, and direct capital access.',
    },
    {
      icon: ShieldAlert,
      title: 'Total Security',
      description:
        'Ensuring community safety through comprehensive policing reforms, agricultural security, and expanded community resources.',
    },
    {
      icon: Leaf,
      title: 'Sustainable Future',
      description:
        'Investing in green energy infrastructure, agricultural sustainability, and preserving our natural heritage for future generations.',
    },
  ],
  initiatives: [
    {
      title: 'Clean Water Initiative',
      description:
        'Securing regional water security for thousands of households through modern filtration and infrastructure.',
      location: 'Rural Jigawa',
    },
    {
      title: 'Digital Literacy Program',
      description:
        'Equipping the next generation with modern tech skills through new regional computer hubs and training centers.',
      location: 'All 27 LGAs',
    },
    {
      title: 'Rural Healthcare Expansion',
      description:
        'Expanding clinic access to remote communities with mobile health units and local diagnostic centers.',
      location: 'Remote Communities',
    },
  ],
  news: [
    {
      date: 'March 15, 2026',
      title: 'Strategic Plan for Jigawa Infrastructure Unveiled',
      excerpt:
        'Mustapha Sule Lamido outlines a comprehensive plan to revitalize regional infrastructure and bridge the development gap, promising thousands of new jobs.',
      image: '/images/news/infrastructure.jpg',
    },
    {
      date: 'March 10, 2026',
      title: 'Record-Breaking Town Hall: A Mandate for Change',
      excerpt:
        'Over 2,500 citizens gathered to discuss the Future of Jigawa. "We are here to collaborate on the solutions that will define our decade."',
      image: '/images/news/townhall.jpg',
    },
  ],
};

export default function StatesmanLandingPage() {
  const [animatedStats, setAnimatedStats] = useState(LAMIDO_CONFIG.stats.map(() => 0));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      setAnimatedStats(LAMIDO_CONFIG.stats.map((stat) => Math.floor(stat.value * easeOut)));

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedStats(LAMIDO_CONFIG.stats.map((stat) => stat.value));
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return num.toLocaleString();
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-uradi-bg-primary">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-uradi-bg-primary/90 backdrop-blur-md border-b border-uradi-border">
        <nav className="flex justify-between items-center px-4 md:px-8 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-uradi-gold"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/public" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-uradi-gold to-uradi-gold-dark flex items-center justify-center">
                <span className="text-uradi-bg-primary font-bold text-sm">M</span>
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter text-uradi-text-primary">
                THE STATESMAN
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              href="#vision"
              className="text-uradi-gold font-bold border-b-2 border-uradi-gold hover:text-uradi-gold-light transition-colors"
            >
              Vision
            </Link>
            <Link
              href="#history"
              className="text-uradi-text-secondary font-medium hover:text-uradi-gold transition-colors"
            >
              History
            </Link>
            <Link
              href="#impact"
              className="text-uradi-text-secondary font-medium hover:text-uradi-gold transition-colors"
            >
              Impact
            </Link>
            <Link
              href="#journal"
              className="text-uradi-text-secondary font-medium hover:text-uradi-gold transition-colors"
            >
              Journal
            </Link>
          </div>

          <Link
            href="#donate"
            className="px-5 py-2 bg-uradi-gold text-uradi-bg-primary font-bold tracking-tight rounded-md hover:bg-uradi-gold-light transition-colors text-sm"
          >
            DONATE
          </Link>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-uradi-bg-secondary border-t border-uradi-border px-4 py-4">
            <div className="flex flex-col gap-4">
              <Link
                href="#vision"
                onClick={() => setMobileMenuOpen(false)}
                className="text-uradi-gold font-bold"
              >
                Vision
              </Link>
              <Link
                href="#history"
                onClick={() => setMobileMenuOpen(false)}
                className="text-uradi-text-secondary"
              >
                History
              </Link>
              <Link
                href="#impact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-uradi-text-secondary"
              >
                Impact
              </Link>
              <Link
                href="#journal"
                onClick={() => setMobileMenuOpen(false)}
                className="text-uradi-text-secondary"
              >
                Journal
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-14">
        {/* Hero Section */}
        <section
          className="relative bg-gradient-to-br from-[#00113a] via-[#0B1120] to-[#002366] flex flex-col items-center pt-8 overflow-hidden"
          id="vision"
        >
          <div className="w-full max-w-lg px-6 z-10 text-center md:text-left md:max-w-7xl md:grid md:grid-cols-2 md:items-center md:gap-12 md:py-24">
            <div className="md:order-1">
              <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl mb-8 md:mb-0 transform md:rotate-2 bg-uradi-bg-tertiary">
                {/* Placeholder for candidate portrait */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-uradi-bg-secondary to-uradi-bg-tertiary">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-full bg-uradi-gold/20 flex items-center justify-center mb-4">
                      <span className="text-6xl font-bold text-uradi-gold">M</span>
                    </div>
                    <p className="text-uradi-text-secondary text-sm">Candidate Portrait</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:order-2">
              <span className="inline-block text-uradi-gold font-bold tracking-[0.2em] text-xs mb-4 uppercase">
                Leadership for Tomorrow
              </span>
              <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-tight mb-6">
                VISION FOR <br />
                <span className="text-uradi-gold">PROGRESS</span>
              </h1>
              <p className="text-lg text-uradi-text-secondary mb-8 leading-relaxed max-w-md mx-auto md:mx-0">
                Architecture of a better Jigawa requires more than promises. It demands a proven
                history of service, leadership, and commitment to the people.
              </p>
              <div className="flex flex-col gap-4 mb-12 md:flex-row">
                <Link
                  href="#join"
                  className="px-8 py-4 bg-uradi-gold text-uradi-bg-primary font-bold text-center rounded-md hover:bg-uradi-gold-light transition-all"
                >
                  Join the Movement
                </Link>
                <Link
                  href="#donate"
                  className="px-8 py-4 border-2 border-uradi-gold/50 text-uradi-gold font-bold text-center rounded-md hover:bg-uradi-gold/10 transition-all"
                >
                  Support the Campaign
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-uradi-bg-primary to-transparent" />
        </section>

        {/* Biography Section */}
        <section className="py-20 bg-uradi-bg-primary" id="history">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="mb-12">
              <div className="w-full rounded-xl bg-uradi-bg-tertiary shadow-xl mb-10 overflow-hidden aspect-video md:aspect-[21/9] flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-16 h-16 text-uradi-gold/40 mx-auto mb-4" />
                  <p className="text-uradi-text-tertiary">Community Engagement Photo</p>
                </div>
              </div>
              <span className="text-uradi-gold/60 font-bold tracking-widest text-xs uppercase mb-3 block">
                Candidate Profile
              </span>
              <h2 className="text-4xl md:text-5xl font-black font-headline text-uradi-text-primary mb-6 tracking-tighter">
                History of Service
              </h2>
              <div className="space-y-6 text-uradi-text-secondary text-lg leading-relaxed">
                <p>
                  Mustapha Sule Lamido is not just a candidate — he is a movement. With a legacy of
                  public service inherited from his father, former Governor Sule Lamido, he has
                  dedicated his life to the people of Jigawa State.
                </p>
                <p>
                  As a <span className="text-uradi-gold font-bold">former diplomat</span> and{' '}
                  <span className="text-uradi-gold font-bold">community organizer</span>, he has
                  navigated complex challenges and delivered results. In the 2023 election, he earned
                  the trust of{' '}
                  <span className="text-uradi-gold font-bold">368,726 voters</span> — the strongest
                  opposition base in Jigawa history.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mt-10 pt-10 border-t border-uradi-border">
                <div>
                  <h4 className="text-4xl font-black text-uradi-gold">368K+</h4>
                  <p className="text-xs font-bold uppercase tracking-wide text-uradi-text-tertiary">
                    Votes in 2023
                  </p>
                </div>
                <div>
                  <h4 className="text-4xl font-black text-uradi-gold">27</h4>
                  <p className="text-xs font-bold uppercase tracking-wide text-uradi-text-tertiary">
                    Local Governments
                  </p>
                </div>
              </div>

              {/* Signature */}
              <div className="h-10 mt-10 flex items-center">
                <span className="text-uradi-text-tertiary font-script text-2xl italic">
                  Mustapha Sule Lamido
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars of Progress */}
        <section className="py-20 bg-uradi-bg-secondary">
          <div className="container mx-auto px-6 text-center mb-12">
            <h2 className="text-4xl font-black text-uradi-text-primary tracking-tighter">
              Pillars of Progress
            </h2>
          </div>
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-6 max-w-4xl">
            {LAMIDO_CONFIG.pillars.map((pillar, index) => (
              <div
                key={index}
                className="bg-uradi-bg-primary p-8 rounded-lg border border-uradi-border hover:border-uradi-gold/50 transition-all"
              >
                <pillar.icon className="w-10 h-10 text-uradi-gold mb-4" />
                <h3 className="text-xl font-bold mb-3 text-uradi-text-primary">{pillar.title}</h3>
                <p className="text-uradi-text-secondary">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Action in the Field */}
        <section className="py-20 bg-uradi-bg-primary" id="impact">
          <div className="container mx-auto px-6 mb-10">
            <span className="text-uradi-gold/60 font-bold tracking-widest text-xs uppercase mb-3 block">
              Proven Results
            </span>
            <h2 className="text-4xl font-black text-uradi-text-primary tracking-tighter mb-4">
              Action in the Field
            </h2>
            <Link
              href="#"
              className="text-uradi-gold font-bold flex items-center gap-2 text-sm hover:underline"
            >
              Explore All Impacts <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-col">
            {LAMIDO_CONFIG.initiatives.map((initiative, index) => (
              <div key={index} className="relative group h-96 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-uradi-bg-secondary to-uradi-bg-tertiary flex items-center justify-center">
                  <div className="text-center">
                    <HeartHandshake className="w-20 h-20 text-uradi-gold/30 mx-auto mb-4" />
                    <p className="text-uradi-text-tertiary">{initiative.title} Image</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-uradi-bg-primary/95 via-uradi-bg-primary/50 to-transparent flex flex-col justify-end p-8">
                  <span className="text-uradi-gold/60 text-xs uppercase tracking-widest mb-2">
                    {initiative.location}
                  </span>
                  <h4 className="text-white text-2xl font-bold mb-2">{initiative.title}</h4>
                  <p className="text-uradi-text-secondary text-sm mb-4">{initiative.description}</p>
                  <span className="text-uradi-gold font-bold text-xs tracking-widest uppercase">
                    View Impact
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-uradi-bg-secondary">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {LAMIDO_CONFIG.stats.map((stat, index) => (
                <div key={stat.label}>
                  <div className="text-4xl md:text-5xl font-black text-uradi-gold mb-2">
                    {formatNumber(animatedStats[index])}
                    {stat.suffix}
                  </div>
                  <div className="text-sm font-medium uppercase tracking-wider text-uradi-text-tertiary">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Donation Center */}
        <section className="py-20 bg-[#00113a] text-white" id="donate">
          <div className="container mx-auto px-6 max-w-xl text-center">
            <h2 className="text-4xl font-black tracking-tighter mb-6">Fuel the Progress</h2>
            <p className="text-uradi-text-secondary text-lg mb-10">
              Your support directly powers our grassroots efforts across Jigawa State. Every
              contribution is an investment in our collective future.
            </p>
            <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button className="py-4 border-2 border-white/20 rounded-md font-bold text-xl hover:bg-uradi-gold hover:text-uradi-bg-primary hover:border-uradi-gold transition-all">
                  ₦5,000
                </button>
                <button className="py-4 border-2 border-uradi-gold bg-uradi-gold text-uradi-bg-primary rounded-md font-bold text-xl">
                  ₦10,000
                </button>
                <button className="py-4 border-2 border-white/20 rounded-md font-bold text-xl hover:bg-uradi-gold hover:text-uradi-gold hover:border-uradi-gold transition-all">
                  ₦50,000
                </button>
              </div>
              <div className="mb-6">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">₦</span>
                  <input
                    type="number"
                    placeholder="Other Amount"
                    className="w-full bg-white/10 border border-white/20 rounded-md py-4 pl-10 pr-4 text-lg focus:ring-uradi-gold focus:border-uradi-gold text-white placeholder:text-white/30"
                  />
                </div>
              </div>
              <button className="w-full py-5 bg-uradi-gold text-uradi-bg-primary font-black text-lg rounded-md hover:bg-uradi-gold-light transition-all uppercase tracking-widest">
                Contribute Now
              </button>
              <p className="text-white/40 text-[10px] mt-6 uppercase tracking-widest leading-relaxed">
                Secure encrypted transaction. All contributions comply with electoral regulations.
                Paid for by the Committee to Elect Mustapha Sule Lamido.
              </p>
            </div>
          </div>
        </section>

        {/* Citizen's Hotline & Complaint Portal */}
        <section className="py-20 bg-uradi-bg-secondary">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="text-4xl font-black text-uradi-text-primary tracking-tighter mb-4 text-center">
              The People's Voice
            </h2>
            <p className="text-uradi-text-secondary text-center mb-10 leading-relaxed">
              Direct accountability is our foundation. Use this portal to report issues, request
              aid, or message the candidate directly.
            </p>

            {/* Contact Cards */}
            <div className="flex flex-col gap-4 mb-10">
              <div className="flex items-center gap-4 p-5 bg-uradi-bg-primary rounded-lg border-l-4 border-uradi-gold">
                <Phone className="w-8 h-8 text-uradi-gold" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-uradi-text-tertiary">
                    24/7 Hotline
                  </p>
                  <p className="text-uradi-text-primary font-black text-lg">0800-LAMIDO</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 bg-uradi-bg-primary rounded-lg border-l-4 border-uradi-gold">
                <Mail className="w-8 h-8 text-uradi-gold" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-uradi-text-tertiary">
                    Email Portal
                  </p>
                  <p className="text-uradi-text-primary font-black text-lg">
                    voice@lamido2027.ng
                  </p>
                </div>
              </div>
            </div>

            {/* Complaint Form */}
            <div className="bg-uradi-bg-primary p-8 rounded-xl border border-uradi-border">
              <form className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uradi-text-tertiary">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      className="flex flex-col items-center p-3 border-2 border-uradi-border rounded-md hover:border-uradi-gold transition-all group"
                    >
                      <Stethoscope className="w-6 h-6 text-uradi-text-tertiary group-hover:text-uradi-gold" />
                      <span className="text-[10px] font-bold mt-1 text-uradi-text-tertiary group-hover:text-uradi-gold">
                        Health
                      </span>
                    </button>
                    <button
                      type="button"
                      className="flex flex-col items-center p-3 border-2 border-uradi-gold rounded-md bg-uradi-gold/5"
                    >
                      <Construction className="w-6 h-6 text-uradi-gold" />
                      <span className="text-[10px] font-bold mt-1 text-uradi-gold">Infra</span>
                    </button>
                    <button
                      type="button"
                      className="flex flex-col items-center p-3 border-2 border-uradi-border rounded-md hover:border-uradi-gold transition-all group"
                    >
                      <ShieldAlert className="w-6 h-6 text-uradi-text-tertiary group-hover:text-uradi-gold" />
                      <span className="text-[10px] font-bold mt-1 text-uradi-text-tertiary group-hover:text-uradi-gold">
                        Safety
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uradi-text-tertiary">
                    Request Type
                  </label>
                  <select className="w-full border-uradi-border rounded-md bg-uradi-bg-secondary p-4 text-sm font-medium text-uradi-text-primary focus:ring-uradi-gold focus:border-uradi-gold">
                    <option>Submit a Complaint</option>
                    <option>Request Community Aid</option>
                    <option>Policy Inquiry</option>
                    <option>Volunteer Request</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uradi-text-tertiary">
                    Your Message
                  </label>
                  <textarea
                    placeholder="Describe the issue in detail..."
                    rows={4}
                    className="w-full border-uradi-border rounded-md bg-uradi-bg-secondary p-4 text-sm focus:ring-uradi-gold focus:border-uradi-gold text-uradi-text-primary placeholder:text-uradi-text-tertiary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-uradi-gold text-uradi-bg-primary font-black text-sm rounded-md hover:bg-uradi-gold-light transition-colors uppercase tracking-widest"
                >
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Volunteer & Outreach */}
        <section className="py-20 bg-uradi-bg-primary" id="join">
          <div className="container mx-auto px-6 max-w-xl">
            <div className="rounded-xl bg-uradi-bg-tertiary shadow-2xl mb-10 w-full overflow-hidden aspect-[4/3] flex items-center justify-center">
              <div className="text-center">
                <Users className="w-20 h-20 text-uradi-gold/30 mx-auto mb-4" />
                <p className="text-uradi-text-tertiary">Volunteers in Action</p>
              </div>
            </div>
            <span className="text-uradi-gold font-bold tracking-widest text-xs uppercase mb-3 block">
              Be The Change
            </span>
            <h2 className="text-4xl font-black text-uradi-text-primary tracking-tighter mb-8">
              Join the Movement
            </h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-uradi-bg-secondary border-none rounded-md p-4 focus:ring-2 focus:ring-uradi-gold text-uradi-text-primary text-sm placeholder:text-uradi-text-tertiary"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-uradi-bg-secondary border-none rounded-md p-4 focus:ring-2 focus:ring-uradi-gold text-uradi-text-primary text-sm placeholder:text-uradi-text-tertiary"
              />
              <input
                type="text"
                placeholder="LGA / Ward"
                className="w-full bg-uradi-bg-secondary border-none rounded-md p-4 focus:ring-2 focus:ring-uradi-gold text-uradi-text-primary text-sm placeholder:text-uradi-text-tertiary"
              />
              <select className="w-full bg-uradi-bg-secondary border-none rounded-md p-4 focus:ring-2 focus:ring-uradi-gold text-sm font-medium text-uradi-text-tertiary">
                <option disabled selected>
                  Area of Interest
                </option>
                <option>Canvassing</option>
                <option>Social Media Outreach</option>
                <option>Event Planning</option>
                <option>Phone Banking</option>
                <option>Door Knocking</option>
              </select>
              <button
                type="submit"
                className="w-full py-5 bg-uradi-gold text-uradi-bg-primary font-black text-sm rounded-md hover:bg-uradi-gold-light transition-all uppercase tracking-widest mt-4"
              >
                Sign Up to Volunteer
              </button>
            </form>
          </div>
        </section>

        {/* Latest Dispatch (News) */}
        <section className="py-20 bg-uradi-bg-secondary" id="journal">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-uradi-gold/60 font-bold tracking-widest text-xs uppercase mb-3 block">
                Official Feed
              </span>
              <h2 className="text-4xl font-black text-uradi-text-primary tracking-tighter">
                The Statesman's Journal
              </h2>
            </div>
            <div className="flex flex-col gap-12 max-w-4xl mx-auto">
              {LAMIDO_CONFIG.news.map((item, index) => (
                <article
                  key={index}
                  className={`flex flex-col ${index > 0 ? 'pt-12 border-t border-uradi-border' : ''}`}
                >
                  <div className="aspect-video overflow-hidden rounded-xl mb-6 shadow-md bg-uradi-bg-tertiary flex items-center justify-center">
                    <div className="text-center">
                      <Globe className="w-16 h-16 text-uradi-gold/30 mx-auto mb-2" />
                      <p className="text-uradi-text-tertiary text-sm">News Image</p>
                    </div>
                  </div>
                  <time className="text-uradi-gold font-bold text-xs uppercase tracking-widest mb-3">
                    {item.date}
                  </time>
                  <h3 className="text-2xl font-black text-uradi-text-primary mb-4 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-uradi-text-secondary mb-6 line-clamp-3">{item.excerpt}</p>
                  <Link
                    href="#"
                    className="text-uradi-gold font-bold flex items-center gap-2 group text-sm hover:underline"
                  >
                    Read Full Story{' '}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Coalition Branding */}
        <section className="py-16 border-t border-uradi-border">
          <div className="container mx-auto px-6">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-uradi-text-tertiary mb-10">
              Guardians of Progress
            </p>
            <div className="grid grid-cols-2 gap-8 opacity-40 grayscale items-center md:flex md:justify-center md:gap-16">
              <div className="flex items-center gap-2 justify-center">
                <HeartHandshake className="w-6 h-6 text-uradi-text-secondary" />
                <span className="text-xs font-bold text-uradi-text-secondary">ADC ALLIANCE</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Users className="w-6 h-6 text-uradi-text-secondary" />
                <span className="text-xs font-bold text-uradi-text-secondary">UNITY COUNCIL</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <TrendingUp className="w-6 h-6 text-uradi-text-secondary" />
                <span className="text-xs font-bold text-uradi-text-secondary">PROGRESSIVE GROUP</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <ShieldAlert className="w-6 h-6 text-uradi-text-secondary" />
                <span className="text-xs font-bold text-uradi-text-secondary">VANGUARD</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-uradi-bg-secondary text-white py-16 px-6 border-t border-uradi-border">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <span className="text-2xl font-black tracking-tighter text-uradi-text-primary">
              THE STATESMAN
            </span>
            <p className="text-uradi-text-secondary max-w-sm text-sm leading-relaxed">
              Architecting a future defined by integrity, stability, and unyielding service to the
              public good. Together, we build the progress Jigawa deserves.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 border-t border-uradi-border pt-10">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-uradi-gold">
                Platform
              </span>
              <nav className="flex flex-col gap-3 text-sm text-uradi-text-secondary">
                <Link href="#" className="hover:text-uradi-gold transition-colors">
                  Education
                </Link>
                <Link href="#" className="hover:text-uradi-gold transition-colors">
                  Economy
                </Link>
                <Link href="#" className="hover:text-uradi-gold transition-colors">
                  Infrastructure
                </Link>
                <Link href="#" className="hover:text-uradi-gold transition-colors">
                  Environment
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-uradi-gold">
                Campaign
              </span>
              <nav className="flex flex-col gap-3 text-sm text-uradi-text-secondary">
                <Link href="#join" className="hover:text-uradi-gold transition-colors">
                  Volunteer
                </Link>
                <Link href="#donate" className="hover:text-uradi-gold transition-colors">
                  Donate
                </Link>
                <Link href="#history" className="hover:text-uradi-gold transition-colors">
                  Biography
                </Link>
                <Link href="#" className="hover:text-uradi-gold transition-colors">
                  Contact
                </Link>
              </nav>
            </div>
          </div>

          <div className="pt-10 border-t border-uradi-border flex flex-col items-center gap-8">
            <div className="flex gap-8">
              <Link href="#" className="text-uradi-text-tertiary hover:text-uradi-gold transition-colors">
                <Globe className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-uradi-text-tertiary hover:text-uradi-gold transition-colors">
                <Rss className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-uradi-text-tertiary hover:text-uradi-gold transition-colors">
                <Mail className="w-5 h-5" />
              </Link>
            </div>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-[10px] text-uradi-text-tertiary">
                <span>Powered by</span>
                <a href="https://uradi.nyamabo.com" className="text-uradi-gold hover:text-uradi-gold-light transition-colors font-bold">
                  URADI-360
                </a>
                <span>Platform</span>
              </div>
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-uradi-text-tertiary max-w-xs mx-auto">
                © 2027 COMMITTEE TO ELECT MUSTAPHA SULE LAMIDO. ALL RIGHTS RESERVED. PAID FOR BY THE
                CAMPAIGN FUND.
              </p>
              <nav className="flex justify-center gap-6 text-[10px] uppercase font-bold tracking-widest text-uradi-text-tertiary">
                <Link href="#" className="hover:text-uradi-gold">
                  Privacy
                </Link>
                <Link href="#" className="hover:text-uradi-gold">
                  Legal
                </Link>
                <Link href="#" className="hover:text-uradi-gold">
                  Compliance
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
