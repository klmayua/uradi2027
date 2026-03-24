'use client';

/**
 * URADI-360 Corporate Website
 * Political Intelligence & Campaign Management Platform
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  BarChart3,
  Users,
  Target,
  Megaphone,
  ShieldCheck,
  Brain,
  MapPin,
  TrendingUp,
  MessageSquare,
  FileText,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Mail,
  Phone,
} from 'lucide-react';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Voter Intelligence',
    description: '360° voter profiles with real-time sentiment tracking, demographic analysis, and predictive modeling to understand every constituency.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Analytics',
    description: 'Machine learning-driven insights from social media, news, and field data. Sentiment analysis, narrative tracking, and risk assessment.',
  },
  {
    icon: Target,
    title: 'Micro-Targeting',
    description: 'Precision voter segmentation using AI recommendations. Target the right voters with the right message at the right time.',
  },
  {
    icon: Megaphone,
    title: 'Multi-Channel Outreach',
    description: 'Integrated SMS, WhatsApp, USSD, and email campaigns. Track engagement and optimize messaging across all channels.',
  },
  {
    icon: Users,
    title: 'Field Operations',
    description: 'Mobile-first canvassing app with offline sync. Track field agents, manage contacts, and monitor grassroots activities in real-time.',
  },
  {
    icon: MapPin,
    title: 'Election Day Command',
    description: 'GPS-verified monitor check-ins, parallel vote tabulation (PVT), incident reporting, and real-time results aggregation.',
  },
  {
    icon: ShieldCheck,
    title: 'Security Coordination',
    description: 'Incident mapping, pattern analysis, and rapid response coordination. Keep your operations safe and informed.',
  },
  {
    icon: FileText,
    title: 'Governance Mode',
    description: 'Post-election citizen service CRM, budget tracking, and feedback management. Transition seamlessly from campaign to governance.',
  },
];

const STATS = [
  { value: '27', label: 'LGAs', suffix: '' },
  { value: '5000+', label: 'Polling Units', suffix: '' },
  { value: '13500', label: 'Active Volunteers', suffix: '' },
  { value: '100%', label: 'Data Security', suffix: '' },
];

const TENANTS = [
  {
    name: 'Mustapha Sule Lamido',
    title: 'Jigawa Governorship Candidate',
    party: 'ADC',
    description: 'Intelligence. Governance. Victory.',
    link: 'https://lamido.nyamabo.com',
    color: 'from-[#00113a] to-[#006d35]',
  },
];

export default function UradiCorporatePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [animatedStats, setAnimatedStats] = useState(STATS.map(() => 0));

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedStats(STATS.map((stat) => Math.floor(parseInt(stat.value.replace(/\D/g, '')) * easeOut)));

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedStats(STATS.map((stat) => parseInt(stat.value.replace(/\D/g, ''))));
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] to-[#0d1322] text-[#dde2f8] font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-[#C8A94E]/20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C8A94E] to-[#A0843C] flex items-center justify-center">
                <span className="text-[#0a0f1e] font-black text-xl">U</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">URADI-360</span>
                <p className="text-xs text-[#C8A94E]">Political Intelligence Platform</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#platform" className="text-[#dde2f8] hover:text-[#C8A94E] transition-colors text-sm font-medium">Platform</a>
              <a href="#features" className="text-[#dde2f8] hover:text-[#C8A94E] transition-colors text-sm font-medium">Features</a>
              <a href="#campaigns" className="text-[#dde2f8] hover:text-[#C8A94E] transition-colors text-sm font-medium">Campaigns</a>
              <a href="#contact" className="text-[#dde2f8] hover:text-[#C8A94E] transition-colors text-sm font-medium">Contact</a>
              <a href="/portal" className="bg-gradient-to-r from-[#C8A94E] to-[#A0843C] px-6 py-2.5 rounded-lg text-[#0a0f1e] font-semibold text-sm hover:from-[#D4B55A] hover:to-[#B09044] transition-all">
                Command Center
              </a>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#C8A94E]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0f1e] border-t border-[#C8A94E]/20">
            <div className="px-4 py-4 space-y-4">
              <a href="#platform" className="block text-[#dde2f8] hover:text-[#C8A94E] py-2">Platform</a>
              <a href="#features" className="block text-[#dde2f8] hover:text-[#C8A94E] py-2">Features</a>
              <a href="#campaigns" className="block text-[#dde2f8] hover:text-[#C8A94E] py-2">Campaigns</a>
              <a href="#contact" className="block text-[#dde2f8] hover:text-[#C8A94E] py-2">Contact</a>
              <a href="/portal" className="block bg-gradient-to-r from-[#C8A94E] to-[#A0843C] px-6 py-3 rounded-lg text-[#0a0f1e] font-semibold text-center">
                Command Center
              </a>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 md:px-8">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#C8A94E]/5 via-transparent to-[#0a0f1e]"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C8A94E]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#006d35]/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C8A94E]/10 border border-[#C8A94E]/30 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#50dfa4] animate-pulse"></span>
              <span className="text-xs font-mono uppercase tracking-widest text-[#C8A94E]">Trusted by Winning Campaigns</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Political Intelligence
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8A94E] to-[#A0843C]">
                Redefined for Victory
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-[#cfc5b2] max-w-3xl mx-auto font-light leading-relaxed">
              URADI-360 is Nigeria&apos;s most advanced campaign management platform. 
              Real-time voter intelligence, AI-powered analytics, field operations, 
              and election day command — all in one secure system.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
              <a
                href="#platform"
                className="bg-gradient-to-r from-[#C8A94E] to-[#A0843C] px-8 py-4 rounded-xl text-[#0a0f1e] font-bold text-lg transition-all shadow-xl shadow-[#C8A94E]/20 hover:shadow-2xl hover:shadow-[#C8A94E]/30 hover:scale-105"
              >
                Explore Platform
              </a>
              <a
                href="/portal"
                className="px-8 py-4 rounded-xl border border-[#C8A94E]/30 text-[#C8A94E] font-bold text-lg hover:bg-[#C8A94E]/10 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                Secure Login
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-[#C8A94E] mb-2">
                    {animatedStats[index].toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-sm text-[#8b8891] uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What is URADI-360 */}
        <section id="platform" className="py-24 px-4 md:px-8 bg-[#0f1629]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#C8A94E] font-mono text-sm tracking-[0.3em] uppercase mb-4 block">Platform Overview</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                What is URADI-360?
              </h2>
              <p className="text-xl text-[#cfc5b2] max-w-3xl mx-auto leading-relaxed">
                A comprehensive political intelligence and governance technology platform designed for 
                Nigerian campaigns. From grassroots mobilization to election day operations — 
                we provide the data, tools, and insights you need to win.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#0a0f1e] p-8 rounded-2xl border border-[#C8A94E]/10 hover:border-[#C8A94E]/30 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C8A94E]/20 to-[#C8A94E]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-[#C8A94E]" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Campaign Intelligence</h3>
                <p className="text-[#8b8891] leading-relaxed">
                  Real-time voter sentiment analysis, demographic profiling, and predictive modeling. 
                  Know your electorate better than ever before.
                </p>
              </div>

              <div className="bg-[#0a0f1e] p-8 rounded-2xl border border-[#C8A94E]/10 hover:border-[#C8A94E]/30 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C8A94E]/20 to-[#C8A94E]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-7 h-7 text-[#C8A94E]" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Multi-Channel Outreach</h3>
                <p className="text-[#8b8891] leading-relaxed">
                  SMS, WhatsApp, USSD, and email campaigns integrated into one platform. 
                  Track engagement and optimize messaging across all channels.
                </p>
              </div>

              <div className="bg-[#0a0f1e] p-8 rounded-2xl border border-[#C8A94E]/10 hover:border-[#C8A94E]/30 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C8A94E]/20 to-[#C8A94E]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-7 h-7 text-[#C8A94E]" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Field Operations</h3>
                <p className="text-[#8b8891] leading-relaxed">
                  Mobile canvassing app with offline sync. Track field agents, manage contacts, 
                  and monitor grassroots activities in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#C8A94E] font-mono text-sm tracking-[0.3em] uppercase mb-4 block">Capabilities</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                Complete Campaign Toolkit
              </h2>
              <p className="text-xl text-[#cfc5b2] max-w-3xl mx-auto">
                Every tool you need to run a data-driven, intelligent campaign.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature, index) => (
                <div
                  key={index}
                  className="bg-[#0f1629] p-6 rounded-xl border border-[#C8A94E]/10 hover:border-[#C8A94E]/30 transition-all group hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#C8A94E]/20 to-[#C8A94E]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-[#C8A94E]" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-[#8b8891] text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Active Campaigns */}
        <section id="campaigns" className="py-24 px-4 md:px-8 bg-[#0f1629]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#C8A94E] font-mono text-sm tracking-[0.3em] uppercase mb-4 block">Powered by URADI-360</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                Active Campaigns
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {TENANTS.map((tenant, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-2xl border border-[#C8A94E]/20 group hover:border-[#C8A94E]/40 transition-all"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${tenant.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                  <div className="relative p-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tenant.color} flex items-center justify-center`}>
                        <span className="text-white font-black text-2xl">{tenant.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{tenant.name}</h3>
                        <p className="text-[#C8A94E]">{tenant.party}</p>
                      </div>
                    </div>
                    <p className="text-[#8b8891]">{tenant.description}</p>
                    <a
                      href={tenant.link}
                      className="inline-flex items-center gap-2 text-[#C8A94E] font-semibold hover:gap-4 transition-all"
                    >
                      Visit Campaign Site <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-[#C8A94E]/10 to-[#C8A94E]/5 border border-[#C8A94E]/20 rounded-3xl p-12 md:p-16">
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Ready to Transform Your Campaign?
              </h2>
              <p className="text-xl text-[#cfc5b2] mb-8 max-w-2xl mx-auto">
                Join the campaigns that trust URADI-360 for intelligence, operations, and victory.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <a
                  href="#contact"
                  className="bg-gradient-to-r from-[#C8A94E] to-[#A0843C] px-8 py-4 rounded-xl text-[#0a0f1e] font-bold text-lg transition-all shadow-xl shadow-[#C8A94E]/20 hover:shadow-2xl"
                >
                  Contact Sales
                </a>
                <a
                  href="/portal"
                  className="px-8 py-4 rounded-xl border border-[#C8A94E]/30 text-[#C8A94E] font-bold text-lg hover:bg-[#C8A94E]/10 transition-all"
                >
                  Access Command Center
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 px-4 md:px-8 bg-[#0f1629]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#C8A94E] font-mono text-sm tracking-[0.3em] uppercase mb-4 block">Get in Touch</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                Contact URADI-360
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C8A94E]/20 to-[#C8A94E]/5 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-[#C8A94E]" />
                </div>
                <h3 className="text-lg font-bold mb-2">Email</h3>
                <a href="mailto:info@uradi360.com" className="text-[#8b8891] hover:text-[#C8A94E] transition-colors">
                  info@uradi360.com
                </a>
              </div>

              <div className="text-center p-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C8A94E]/20 to-[#C8A94E]/5 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-[#C8A94E]" />
                </div>
                <h3 className="text-lg font-bold mb-2">Phone</h3>
                <a href="tel:+234800URADI360" className="text-[#8b8891] hover:text-[#C8A94E] transition-colors">
                  +234 800 URADI 360
                </a>
              </div>

              <div className="text-center p-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C8A94E]/20 to-[#C8A94E]/5 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-[#C8A94E]" />
                </div>
                <h3 className="text-lg font-bold mb-2">Location</h3>
                <p className="text-[#8b8891]">Jigawa State, Nigeria</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-[#C8A94E]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C8A94E] to-[#A0843C] flex items-center justify-center">
                <span className="text-[#0a0f1e] font-black text-xl">U</span>
              </div>
              <div>
                <span className="text-lg font-bold text-white">URADI-360</span>
                <p className="text-xs text-[#8b8891]">Political Intelligence Platform</p>
              </div>
            </div>

            <div className="flex gap-8 text-sm text-[#8b8891]">
              <span>© 2026 URADI-360. All rights reserved.</span>
              <a href="#" className="hover:text-[#C8A94E] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#C8A94E] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
