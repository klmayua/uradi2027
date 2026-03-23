'use client';

/**
 * Citizen Portal - Sovereign Interface Design
 * Public-facing citizen engagement portal
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  HeartHandshake,
  Users,
  TrendingUp,
  ArrowRight,
  School,
  Shield,
  Leaf,
  Phone,
  Mail,
  MapPin,
  HealthAndSafety,
  Construction,
  Security,
  ChevronRight,
  Public,
  RssFeed,
} from 'lucide-react';

const LAMIDO_CONFIG = {
  name: 'Mustapha Sule Lamido',
  title: 'For Governor',
  slogan: 'Vision for Progress',
  location: 'Jigawa State',
  party: 'ADC',
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
      description: 'Transforming our schools into hubs of digital innovation and vocational mastery.',
    },
    {
      icon: TrendingUp,
      title: 'Economic Stability',
      description: 'Fostering small business growth through strategic investment and agricultural modernization.',
    },
    {
      icon: Shield,
      title: 'Total Security',
      description: 'Ensuring community safety through comprehensive policing reforms.',
    },
    {
      icon: Leaf,
      title: 'Sustainable Future',
      description: 'Investing in green energy infrastructure and preserving our natural heritage.',
    },
  ],
};

export default function CitizenPortalPage() {
  const [animatedStats, setAnimatedStats] = useState(LAMIDO_CONFIG.stats.map(() => 0));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-[#0d1322] text-[#dde2f8] font-sans selection:bg-[#e5c466]/30 selection:text-[#e5c466]">
      {/* TopAppBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0d1322]/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 h-20 border-b border-[#4c4637]/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#e5c466]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="text-[#e5c466] font-black italic text-xl tracking-tight">Command Center</span>
        </div>
        <div className="hidden md:flex items-center gap-12">
          <Link href="#campaign" className="text-[#e5c466] font-bold text-sm tracking-tight uppercase">Campaign</Link>
          <Link href="#vision" className="text-[#dde2f8] font-medium text-sm tracking-tight uppercase">Vision</Link>
          <Link href="#impact" className="text-[#dde2f8] font-medium text-sm tracking-tight uppercase">Impact</Link>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="#join"
            className="bg-gradient-to-r from-[#e5c466] to-[#c8a94e] px-6 py-2.5 rounded-xl text-[#3d2f00] font-bold text-sm transition-all uppercase tracking-wider"
          >
            Join Now
          </Link>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[795px] flex items-center justify-center overflow-hidden px-4 md:px-8">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d1322] via-transparent to-[#0d1322] z-10"></div>
            <div className="absolute inset-0 bg-[#191f2f]">
              <div className="w-full h-full opacity-30" style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(229,196,102,0.1) 0%, transparent 50%)`
              }}></div>
            </div>
          </div>

          <div className="relative z-20 max-w-5xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2f3445]/60 backdrop-blur-md border border-[#4c4637]/30 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#50dfa4] animate-pulse"></span>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#e5c466]">Live Initiative: Wave 2027</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tighter">
              FOR THE <span className="text-[#e5c466] italic">FUTURE</span>
              <br />
              WE ARCHITECT.
            </h1>

            <p className="text-lg md:text-xl text-[#cfc5b2] max-w-2xl mx-auto font-light leading-relaxed">
              Join the sovereign effort to rebuild civic engagement. Your contribution is the precision instrument that shapes tomorrow&apos;s governance.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
              <Link
                href="#join"
                className="bg-gradient-to-r from-[#e5c466] to-[#c8a94e] px-10 py-4 rounded-xl text-[#3d2f00] font-extrabold text-lg transition-all shadow-xl shadow-[#e5c466]/20 flex items-center gap-3"
              >
                <HeartHandshake className="w-5 h-5" />
                PLEDGE SUPPORT
              </Link>
              <Link
                href="#volunteer"
                className="px-10 py-4 rounded-xl border border-[#4c4637]/30 text-[#e5c466] font-bold text-lg hover:bg-[#e5c466]/5 transition-all"
              >
                BECOME A VOLUNTEER
              </Link>
            </div>
          </div>
        </section>

        {/* Bento Grid Feature Section */}
        <section className="px-4 md:px-8 py-24 bg-[#151b2b]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <span className="text-[#e5c466] font-mono text-sm tracking-[0.3em] uppercase mb-4 block">Operational Pillars</span>
              <h3 className="text-4xl font-bold tracking-tight">The Architecture of Impact</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Donate Card */}
              <div className="md:col-span-4 bg-[#080e1d] rounded-xl p-8 flex flex-col justify-between border border-[#4c4637]/10 group hover:bg-[#242a3a] transition-all duration-300">
                <div>
                  <TrendingUp className="w-10 h-10 text-[#e5c466] mb-6" />
                  <h4 className="text-2xl font-bold mb-4">Donate</h4>
                  <p className="text-[#cfc5b2] leading-relaxed">Fuel the mission with secure, transparent funding. 100% of contributions are audited.</p>
                </div>
                <div className="pt-8">
                  <Link href="#donate" className="text-[#e5c466] font-mono text-sm tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all uppercase">
                    Initiate Transfer <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Community News (Bento Center) */}
              <div className="md:col-span-5 bg-[#242a3a] rounded-xl overflow-hidden border border-[#4c4637]/10 relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-[#242a3a] via-[#242a3a]/40 to-transparent z-10"></div>
                <div className="h-full p-8 flex flex-col justify-end relative z-20">
                  <span className="text-xs font-mono text-[#50dfa4] mb-2 uppercase">Fresh Intel</span>
                  <h4 className="text-3xl font-bold mb-4 leading-tight">Civic Resilience<br />Strategy v2.4</h4>
                  <p className="text-[#cfc5b2] text-sm mb-6">Latest report on urban development and decentralized community staffing protocols.</p>
                  <button className="bg-[#e5c466]/10 hover:bg-[#e5c466]/20 text-[#e5c466] py-3 rounded-lg font-bold text-sm transition-colors border border-[#e5c466]/20 uppercase tracking-widest w-fit">
                    Read Dispatch
                  </button>
                </div>
              </div>

              {/* Volunteer Card */}
              <div className="md:col-span-3 bg-[#080e1d] rounded-xl p-8 flex flex-col justify-between border border-[#4c4637]/10 hover:bg-[#242a3a] transition-all duration-300">
                <div>
                  <Users className="w-10 h-10 text-[#e5c466] mb-6" />
                  <h4 className="text-xl font-bold mb-2">Volunteer</h4>
                  <p className="text-[#cfc5b2] text-sm leading-relaxed">Deploy your specialized skills to the field.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-mono text-[#e5c466]/60">
                    <span className="w-1 h-1 rounded-full bg-[#e5c466]"></span>
                    124 Open Deployments
                  </div>
                  <button className="w-full py-3 rounded-lg bg-[#2f3445] text-[#dde2f8] font-bold text-xs uppercase tracking-widest hover:text-[#e5c466] transition-colors">
                    Apply to Staff
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 md:px-8 py-24 bg-[#0d1322]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-[#e5c466] font-mono text-sm tracking-[0.3em] uppercase mb-4 block">Strategic Metrics</span>
              <h3 className="text-5xl font-black tracking-tight mb-8">
                Quantifying Our <span className="italic text-[#e5c466]">Sovereignty.</span>
              </h3>
              <p className="text-[#cfc5b2] text-lg mb-12 font-light leading-relaxed">
                We don&apos;t just measure noise; we measure structural shift. Transparency is our core protocol.
              </p>

              <div className="space-y-10">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#dde2f8]">Capital Deployment Goal</span>
                    <span className="text-2xl font-mono font-bold text-[#e5c466]">82%</span>
                  </div>
                  <div className="h-1 w-full bg-[#2f3445] rounded-full overflow-hidden">
                    <div className="h-full bg-[#e5c466] shadow-[0_0_10px_rgba(229,196,102,0.5)]" style={{ width: '82%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#dde2f8]">Volunteer Network Saturation</span>
                    <span className="text-2xl font-mono font-bold text-[#50dfa4]">64%</span>
                  </div>
                  <div className="h-1 w-full bg-[#2f3445] rounded-full overflow-hidden">
                    <div className="h-full bg-[#50dfa4] shadow-[0_0_10px_rgba(80,223,164,0.3)]" style={{ width: '64%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#151b2b] p-10 rounded-2xl border border-[#4c4637]/10 text-center space-y-2">
                <span className="text-5xl font-black font-mono text-[#e5c466]">$12.4M</span>
                <p className="text-xs font-mono uppercase tracking-widest text-[#cfc5b2]">Resources Allocated</p>
              </div>
              <div className="bg-[#151b2b] p-10 rounded-2xl border border-[#4c4637]/10 text-center space-y-2 translate-y-8">
                <span className="text-5xl font-black font-mono text-[#dde2f8]">15.8k</span>
                <p className="text-xs font-mono uppercase tracking-widest text-[#cfc5b2]">Active Agents</p>
              </div>
              <div className="bg-[#151b2b] p-10 rounded-2xl border border-[#4c4637]/10 text-center space-y-2">
                <span className="text-5xl font-black font-mono text-[#dde2f8]">42</span>
                <p className="text-xs font-mono uppercase tracking-widest text-[#cfc5b2]">Metropolitan Hubs</p>
              </div>
              <div className="bg-[#151b2b] p-10 rounded-2xl border border-[#4c4637]/10 text-center space-y-2 translate-y-8">
                <span className="text-5xl font-black font-mono text-[#50dfa4]">98%</span>
                <p className="text-xs font-mono uppercase tracking-widest text-[#cfc5b2]">Efficiency Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars Section */}
        <section id="vision" className="px-4 md:px-8 py-24 bg-[#151b2b]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black tracking-tight">Pillars of Progress</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {LAMIDO_CONFIG.pillars.map((pillar, index) => (
                <div
                  key={index}
                  className="bg-[#080e1d] p-8 rounded-lg border border-[#4c4637]/10 hover:border-[#e5c466]/50 transition-all"
                >
                  <pillar.icon className="w-10 h-10 text-[#e5c466] mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-[#dde2f8]">{pillar.title}</h3>
                  <p className="text-[#cfc5b2]">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter / CTA */}
        <section className="px-4 md:px-8 py-32">
          <div className="max-w-4xl mx-auto bg-[rgba(47,52,69,0.6)] backdrop-blur-xl p-12 md:p-16 rounded-[2rem] border border-[#4c4637]/10 text-center relative overflow-hidden"
          style={{ background: 'rgba(47, 52, 69, 0.6)', backdropFilter: 'blur(20px)' }}>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#e5c466]/10 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#50dfa4]/10 blur-[100px] rounded-full"></div>

            <h2 className="text-4xl font-bold mb-6 tracking-tight relative z-10">Stay Informed. Stay Sovereign.</h2>
            <p className="text-[#cfc5b2] mb-10 text-lg relative z-10">Subscribe to the command digest for weekly architectural updates.</p>
            <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto relative z-10">
              <input
                type="email"
                placeholder="ENTER_EMAIL@DOMAIN.COM"
                className="flex-1 bg-[#080e1d] border-none rounded-xl px-6 py-4 font-mono text-sm focus:ring-1 focus:ring-[#e5c466] text-[#e5c466] placeholder:text-[#e5c466]/30"
              />
              <button className="bg-gradient-to-r from-[#e5c466] to-[#c8a94e] px-8 py-4 rounded-xl text-[#3d2f00] font-bold uppercase tracking-widest text-sm transition-all shadow-lg shadow-[#e5c466]/20">
                Secure Sub
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#0d1322] border-t border-[#4c4637]/15">
        <div className="flex flex-col items-center md:items-start gap-2">
          <p className="text-[11px] uppercase tracking-widest text-[#dde2f8]/50">
            © 2024 The Sovereign Interface. All rights reserved.
          </p>
        </div>
        <div className="flex gap-8">
          <a href="#" className="text-[#dde2f8]/40 hover:text-[#e5c466] transition-colors text-[11px] uppercase tracking-widest">Privacy Policy</a>
          <a href="#" className="text-[#dde2f8]/40 hover:text-[#e5c466] transition-colors text-[11px] uppercase tracking-widest">Terms of Service</a>
          <a href="#" className="text-[#dde2f8]/40 hover:text-[#e5c466] transition-colors text-[11px] uppercase tracking-widest">Public Disclosures</a>
          <a href="#" className="text-[#dde2f8]/40 hover:text-[#e5c466] transition-colors text-[11px] uppercase tracking-widest">Security Protocols</a>
        </div>
      </footer>
    </div>
  );
}
