'use client';

/**
 * The Sovereign Interface - Public Marketing Landing Page
 * Premium dark theme with glassmorphism effects
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ArrowRight,
  Architecture,
  Visibility,
  Gavel,
  Zap,
  ChevronRight,
  NorthEast,
  TrendingUp,
  Globe,
  Shield,
  Layers,
} from 'lucide-react';

export default function SovereignLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.floor(360 * easeOut));

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedScore(360);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1322] text-[#dde2f8] font-sans selection:bg-[#e5c466]/30 selection:text-[#e5c466]">
      {/* TopAppBar Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#0d1322]/60 backdrop-blur-xl h-20 border-b border-[#4c4637]/20 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
        <nav className="flex justify-between items-center px-4 md:px-8 h-full max-w-full mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#e5c466]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Architecture className="w-6 h-6 text-[#e5c466]" />
            <span className="text-xl font-bold tracking-tighter text-[#dde2f8]">URADI-360</span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium tracking-tight">
            <Link href="#vision" className="text-[#e5c466] font-semibold border-b-2 border-[#e5c466] pb-1">
              Vision
            </Link>
            <Link href="#strategy" className="text-[#dde2f8]/80 hover:text-[#e5c466] transition-colors">
              Strategy
            </Link>
            <Link href="#impact" className="text-[#dde2f8]/80 hover:text-[#e5c466] transition-colors">
              Impact
            </Link>
            <Link href="#governance" className="text-[#dde2f8]/80 hover:text-[#e5c466] transition-colors">
              Governance
            </Link>
          </div>

          <Link
            href="/public/donate"
            className="bg-gradient-to-r from-[#e5c466] to-[#c8a94e] text-[#0d1322] px-6 py-2.5 rounded-xl font-bold scale-95 active:scale-90 transition-transform shadow-[0_0_15px_rgba(229,196,102,0.3)]"
          >
            Donate
          </Link>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#151b2b] border-t border-[#4c4637]/20 px-4 py-4">
            <div className="flex flex-col gap-4">
              <Link href="#vision" onClick={() => setMobileMenuOpen(false)} className="text-[#e5c466] font-semibold">
                Vision
              </Link>
              <Link href="#strategy" onClick={() => setMobileMenuOpen(false)} className="text-[#dde2f8]/80">
                Strategy
              </Link>
              <Link href="#impact" onClick={() => setMobileMenuOpen(false)} className="text-[#dde2f8]/80">
                Impact
              </Link>
              <Link href="#governance" onClick={() => setMobileMenuOpen(false)} className="text-[#dde2f8]/80">
                Governance
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section id="vision" className="relative min-h-[795px] flex items-center overflow-hidden px-4 md:px-8 md:px-12">
          {/* Grid Overlay Background */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(76, 70, 55, 0.1) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(76, 70, 55, 0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1322] via-transparent to-[#0d1322]" />

          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#242a3a] border border-[#4c4637]/15 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-[#50dfa4] animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#bdc7d9]">
                System Status: Sovereign
              </span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
              ARCHITECTING <br />
              <span className="text-[#e5c466]" style={{ textShadow: '0 0 15px rgba(229, 196, 102, 0.3)' }}>
                GLOBAL RESPONSE
              </span>
            </h1>

            <p className="text-lg md:text-xl text-[#cfc5b2] max-w-2xl mb-12 font-light leading-relaxed">
              Precision-engineered governance and tactical intervention frameworks designed for the next era of sovereign impact. We don&apos;t just observe; we restructure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/public/get-involved"
                className="bg-gradient-to-r from-[#e5c466] to-[#c8a94e] text-[#241a00] font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-[#e5c466]/20 transition-all flex items-center justify-center gap-2 group"
              >
                Join the Movement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/public/strategy"
                className="border border-[#4c4637]/30 text-[#e5c466] font-bold px-10 py-4 rounded-xl hover:bg-[#e5c466]/5 transition-all text-center"
              >
                Strategic Response
              </Link>
            </div>
          </div>

          {/* Decorative glow */}
          <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e5c466]/5 blur-[120px] rounded-full pointer-events-none" />
        </section>

        {/* Strategic Protocols (Glassmorphism Cards) */}
        <section id="strategy" className="py-24 px-4 md:px-8 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <span className="text-[#e5c466] font-mono text-sm tracking-[0.3em] uppercase mb-4 block">Protocols</span>
              <h2 className="text-4xl font-bold tracking-tight">STRATEGIC INFRASTRUCTURE</h2>
            </div>
            <p className="text-[#cfc5b2]/70 font-mono text-sm uppercase">Secure Access Required [Level 4]</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 rounded-xl border border-[#4c4637]/10 group hover:border-[#e5c466]/30 transition-all duration-500"
                 style={{ background: 'rgba(47, 52, 69, 0.6)', backdropFilter: 'blur(20px)' }}>
              <div className="w-14 h-14 rounded-lg bg-[#2f3445] flex items-center justify-center mb-8 border border-[#4c4637]/20">
                <Visibility className="w-7 h-7 text-[#e5c466]" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Active Surveillance</h3>
              <p className="text-[#cfc5b2] leading-relaxed mb-8">
                Continuous data stream integration for real-time geopolitical threat assessment and response mapping.
              </p>
              <Link href="#" className="inline-flex items-center gap-2 text-[#e5c466] font-mono text-xs tracking-widest uppercase group-hover:gap-4 transition-all">
                Read Intel <NorthEast className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-xl border border-[#4c4637]/10 group hover:border-[#e5c466]/30 transition-all duration-500"
                 style={{ background: 'rgba(47, 52, 69, 0.6)', backdropFilter: 'blur(20px)' }}>
              <div className="w-14 h-14 rounded-lg bg-[#2f3445] flex items-center justify-center mb-8 border border-[#4c4637]/20">
                <Gavel className="w-7 h-7 text-[#e5c466]" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Sovereign Governance</h3>
              <p className="text-[#cfc5b2] leading-relaxed mb-8">
                Implementation of decentralized legal frameworks that ensure operational autonomy and ethical compliance.
              </p>
              <Link href="#" className="inline-flex items-center gap-2 text-[#e5c466] font-mono text-xs tracking-widest uppercase group-hover:gap-4 transition-all">
                Read Intel <NorthEast className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-xl border border-[#4c4637]/10 group hover:border-[#e5c466]/30 transition-all duration-500"
                 style={{ background: 'rgba(47, 52, 69, 0.6)', backdropFilter: 'blur(20px)' }}>
              <div className="w-14 h-14 rounded-lg bg-[#2f3445] flex items-center justify-center mb-8 border border-[#4c4637]/20">
                <Zap className="w-7 h-7 text-[#e5c466]" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Rapid Intervention</h3>
              <p className="text-[#cfc5b2] leading-relaxed mb-8">
                Mobilizing resources within 360 minutes to critical zones identified by our global intelligence engine.
              </p>
              <Link href="#" className="inline-flex items-center gap-2 text-[#e5c466] font-mono text-xs tracking-widest uppercase group-hover:gap-4 transition-all">
                Read Intel <NorthEast className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Global Operations & Data Vis */}
        <section id="impact" className="py-24 bg-[#151b2b] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#e5c466] font-mono text-sm tracking-[0.3em] uppercase mb-4 block">Analytics</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">GLOBAL OPERATIONS IMPACT</h2>
              <p className="text-[#cfc5b2] text-lg leading-relaxed mb-10">
                Our 360-degree impact score reflects live operational efficiency across 42 sovereign territories. Data is verified via cryptographically secured protocols.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-[#242a3a] border-l-4 border-[#e5c466]">
                  <span className="font-mono text-[#e5c466] font-bold">01</span>
                  <span className="text-[#dde2f8] font-medium uppercase tracking-wide text-sm">Territorial Integrity Verification</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-[#242a3a] border-l-4 border-[#e5c466]/40">
                  <span className="font-mono text-[#e5c466]/40 font-bold">02</span>
                  <span className="text-[#dde2f8] font-medium uppercase tracking-wide text-sm">Asset Allocation Optimization</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-[#242a3a] border-l-4 border-[#e5c466]/20">
                  <span className="font-mono text-[#e5c466]/20 font-bold">03</span>
                  <span className="text-[#dde2f8] font-medium uppercase tracking-wide text-sm">Ethical Resilience Monitoring</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
                {/* Impact Score Gauge */}
                <svg className="w-full h-full -rotate-90">
                  <circle className="text-[#4c4637]/10" cx="50%" cy="50%" fill="transparent" r="45%" stroke="currentColor" strokeWidth="2" />
                  <circle
                    className="text-[#e5c466]"
                    cx="50%"
                    cy="50%"
                    fill="transparent"
                    r="45%"
                    stroke="currentColor"
                    strokeDasharray="850"
                    strokeDashoffset="120"
                    strokeLinecap="round"
                    strokeWidth="12"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-mono text-[#bdc7d9] tracking-widest uppercase">Impact Score</span>
                  <span className="text-7xl font-black font-mono text-[#e5c466]">{animatedScore}</span>
                  <span className="text-[10px] font-mono text-[#50dfa4] uppercase mt-2 tracking-tighter">● LIVE STREAMING</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intelligence Feed (Alpha Priority) */}
        <section className="py-24 px-4 md:px-8 md:px-12 max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-[#e5c466] font-mono text-sm tracking-[0.3em] uppercase mb-4 block">Feed</span>
            <h2 className="text-4xl font-bold tracking-tight">ALPHA PRIORITY REPORTS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Report Cards */}
            {[1, 2, 3, 4].map((item, index) => (
              <div key={index} className="bg-[#242a3a] rounded-xl overflow-hidden border border-[#4c4637]/10 flex flex-col">
                <div className="h-48 bg-[#191f2f] flex items-center justify-center">
                  <Layers className="w-12 h-12 text-[#e5c466]/30" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-[10px] text-[#bdc7d9]">ID: 4892-X{index}</span>
                    <span className="font-mono text-[10px] text-[#bdc7d9]">14:22 GMT</span>
                  </div>
                  <h4 className="text-lg font-bold mb-4 tracking-tight leading-snug">
                    Neural Infrastructure Expansion in Latam Region
                  </h4>
                  <p className="text-sm text-[#cfc5b2]/80 mb-6 flex-1">
                    Deployment of low-latency communication grids for local governance.
                  </p>
                  <button className="text-[#e5c466] text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                    View Report <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-[#0d1322] overflow-hidden relative">
          <div className="absolute inset-0 bg-[#e5c466]/5 blur-[150px] pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 uppercase italic leading-none">
              The Future is <span className="text-[#e5c466]">Architected</span>, Not Awaited.
            </h2>
            <p className="text-lg text-[#cfc5b2] mb-12 max-w-2xl mx-auto">
              Establish your presence within the sovereign network today. Strategic alignment begins here.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/login"
                className="bg-[#e5c466] text-[#241a00] font-bold px-12 py-5 rounded-xl hover:scale-105 transition-transform"
              >
                Initialize Protocol
              </Link>
              <Link
                href="/public/contact"
                className="bg-[#2f3445] text-[#dde2f8] font-bold px-12 py-5 rounded-xl border border-[#4c4637]/20"
              >
                Secure Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0d1322] border-t border-[#4c4637]/15">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-8 md:px-12 py-16 w-full max-w-7xl mx-auto">
          <div>
            <div className="text-lg font-bold text-[#dde2f8] mb-6">URADI-360</div>
            <p className="text-[#cfc5b2] text-sm font-mono max-w-sm">
              Precision Engineered. Authority through data. Sovereignty by design.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-4 font-mono text-[11px] uppercase tracking-[0.05em]">
              <Link href="#" className="text-[#dde2f8]/60 hover:text-[#e5c466] transition-opacity">Strategic Framework</Link>
              <Link href="#" className="text-[#dde2f8]/60 hover:text-[#e5c466] transition-opacity">Legal Governance</Link>
            </div>
            <div className="flex flex-col gap-4 font-mono text-[11px] uppercase tracking-[0.05em]">
              <Link href="#" className="text-[#dde2f8]/60 hover:text-[#e5c466] transition-opacity">Privacy Protocol</Link>
              <Link href="#" className="text-[#dde2f8]/60 hover:text-[#e5c466] transition-opacity">Terms of Sovereignty</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-[#4c4637]/10 py-8 px-4 md:px-8 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#dde2f8]/40">
            © 2024 URADI-360. All rights reserved. Precision Engineered.
          </span>
          <div className="flex gap-6">
            <Globe className="text-[#e5c466]/40 w-5 h-5" />
            <Shield className="text-[#e5c466]/40 w-5 h-5" />
            <TrendingUp className="text-[#e5c466]/40 w-5 h-5" />
          </div>
        </div>
      </footer>
    </div>
  );
}
