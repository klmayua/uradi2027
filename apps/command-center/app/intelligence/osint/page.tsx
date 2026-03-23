'use client';

/**
 * Intelligence Atlas - Sovereign Interface Design
 * Political intelligence and OSINT monitoring dashboard
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Shield,
  Globe,
  Brain,
  Search,
  Layers,
  AlertCircle,
  ChevronRight,
  Target,
  Radio,
  FileText,
  Clock,
  Filter,
  Download,
  Eye,
  Zap,
} from 'lucide-react';

// Mock intelligence reports
const mockReports = [
  {
    id: '4892-X',
    title: 'Neural Infrastructure Expansion in Latam Region',
    category: 'URGENT',
    time: '14:22 GMT',
    description: 'Deployment of low-latency communication grids for local governance.',
    hasImage: true,
  },
  {
    id: '1102-A',
    title: 'Quantum Cryptography Layer Implementation',
    category: 'INTEL',
    time: '08:45 GMT',
    description: 'Upgrading sovereign communication channels to post-quantum standards.',
    hasImage: true,
  },
  {
    id: '9934-M',
    title: 'Structural Reform in Core Governance Units',
    category: 'INTEL',
    time: 'YESTERDAY',
    description: 'Optimizing decision-making hierarchies using AI oversight protocols.',
    hasImage: true,
  },
  {
    id: '2281-Z',
    title: 'Energy Grid Decentralization Success',
    category: 'RESOLVED',
    time: '2 DAYS AGO',
    description: 'Complete transition of target sector to renewable autonomy.',
    hasImage: true,
  },
];

const navItems = [
  { icon: Globe, label: 'Dashboard', active: false },
  { icon: Target, label: 'Analytics', active: false },
  { icon: Brain, label: 'Intelligence', active: true },
  { icon: Layers, label: 'Campaign Maps', active: false },
  { icon: FileText, label: 'Voter Database', active: false },
  { icon: Zap, label: 'Polling', active: false },
  { icon: Shield, label: 'Security', active: false },
];

const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'URGENT':
      return 'bg-[#e5c466] text-[#241a00]';
    case 'RESOLVED':
      return 'bg-[#50dfa4] text-[#003824]';
    default:
      return 'bg-[#242a3a] text-[#bdc7d9]';
  }
};

export default function IntelligenceAtlasPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#0d1322] text-[#dde2f8] font-sans">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#0d1322]/80 backdrop-blur-xl flex justify-between items-center px-8 h-20 border-b border-[#4c4637]/10">
        <div className="flex items-center gap-4">
          <button className="text-[#e5c466] cursor-pointer hover:opacity-80 transition-opacity">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-[#e5c466]">Command Center</h1>
          <div className="hidden md:flex items-center gap-4">
            <span className="text-[#e5c466] font-mono text-sm tracking-tighter">SECURE CHANNEL ALPHA</span>
            <div className="h-2 w-2 rounded-full bg-[#50dfa4] shadow-[0_0_8px_#50dfa4]"></div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-full bg-[#c8a94e] flex items-center justify-center border border-[#e5c466]/20 overflow-hidden">
            <span className="text-[#3d2f00] font-bold text-sm">DS</span>
          </div>
        </div>
      </header>

      {/* Navigation Drawer */}
      <aside className="fixed left-0 top-0 h-full w-72 z-40 bg-[#151b2b] border-r border-[#4c4637]/15 shadow-2xl pt-24 overflow-y-auto">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-[#2f3445] rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#e5c466]" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#e5c466] tracking-tighter">Director Smith</p>
            <p className="text-sm text-[#dde2f8]/60 uppercase">Elite Admin</p>
          </div>
        </div>

        <nav className="flex flex-col">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href="#"
              className={`py-3 px-6 transition-colors flex items-center gap-4 ${
                item.active
                  ? 'bg-[#2f3445]/60 text-[#e5c466] font-bold border-l-4 border-[#e5c466]'
                  : 'text-[#dde2f8]/60 hover:text-[#dde2f8] hover:bg-[#242a3a]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-72 pt-20 min-h-screen">
        {/* Map Interface */}
        <section className="flex-grow relative h-[calc(100vh-14rem)] bg-[#080e1d] overflow-hidden">
          {/* Map Background */}
          <div className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
              <path d="M200 100L250 150L300 120L400 200L350 300L200 350L150 250L200 100Z" fill="#e5c466" fillOpacity="0.1" stroke="#e5c466" strokeWidth="0.5"/>
              <circle className="animate-pulse" cx="270" cy="180" r="4" fill="#e5c466"/>
              <path d="M0 400C300 400 400 100 800 100" stroke="#4c4637" strokeDasharray="4 4"/>
            </svg>
          </div>

          {/* Map Controls */}
          <div className="absolute top-6 left-6 z-10 space-y-4">
            <div className="bg-[rgba(47,52,69,0.6)] backdrop-blur-md p-6 rounded-xl border border-[#4c4637]/15 shadow-2xl w-80">
              <h2 className="text-xs uppercase tracking-widest text-[#e5c466] mb-1">Active Region</h2>
              <h3 className="text-2xl font-bold text-[#dde2f8] mb-2">Northwest Bloc</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-[#2f3445] text-[10px] font-mono rounded text-[#bdc7d9]">KANO / JIGAWA</span>
                <span className="px-2 py-0.5 bg-[#50dfa4]/20 text-[10px] font-mono rounded text-[#50dfa4]">STABLE</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#dde2f8]/60">Registered Voters</span>
                  <span className="font-mono text-[#e5c466]">5,412,809</span>
                </div>
                <div className="w-full bg-[#080e1d] h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-[#e5c466]" style={{ width: '72%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="bg-[#e5c466] px-4 py-2 rounded-lg text-[#3d2f00] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#e5c466]/20">
                <Layers className="w-4 h-4" />
                LGA OVERLAY
              </button>
              <button className="bg-[#2f3445] px-4 py-2 rounded-lg text-[#dde2f8] font-bold text-xs flex items-center gap-2 border border-[#4c4637]/20">
                <Filter className="w-4 h-4" />
                FILTERS
              </button>
            </div>
          </div>

          {/* Floating Data Indicators */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="relative">
              <div className="w-4 h-4 bg-[#e5c466] rounded-full animate-ping absolute inset-0"></div>
              <div className="w-4 h-4 bg-[#e5c466] rounded-full relative z-10 border-2 border-[#0d1322]"></div>
              <div className="absolute left-6 top-0 bg-[rgba(47,52,69,0.9)] backdrop-blur-sm p-3 rounded-lg border border-[#e5c466]/20 whitespace-nowrap">
                <p className="text-[10px] uppercase text-[#c8a94e]">High Impact Zone</p>
                <p className="text-xs font-bold">Kano Metropolitan</p>
              </div>
            </div>
          </div>

          {/* Alert FAB */}
          <button className="absolute bottom-12 right-12 z-20 group">
            <div className="flex items-center gap-4 bg-[#93000a]/20 hover:bg-[#93000a]/40 backdrop-blur-xl p-4 rounded-2xl border border-[#ffb4ab]/30 transition-all duration-300"
              style={{ animation: 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
            >
              <div className="w-12 h-12 bg-[#e5c466] flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(229,196,102,0.4)]">
                <AlertCircle className="w-6 h-6 text-[#3d2f00]" />
              </div>
              <div className="pr-4">
                <p className="text-[10px] uppercase tracking-tighter text-[#e5c466] font-bold">Priority Action</p>
                <p className="text-sm font-bold text-[#dde2f8]">Rapid Response Alert</p>
              </div>
            </div>
          </button>
        </section>

        {/* Search & Intelligence Feed */}
        <section className="p-8 bg-[#151b2b] border-t border-[#4c4637]/10">
          <div className="mb-8">
            <span className="text-[#e5c466] font-mono text-sm tracking-[0.3em] uppercase mb-4 block">Feed</span>
            <h2 className="text-4xl font-bold tracking-tight">ALPHA PRIORITY REPORTS</h2>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 mb-8">
            <div className="flex-grow relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#dde2f8]/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search intelligence reports, IDs, or keywords..."
                className="w-full bg-[#242a3a] border-none rounded-xl py-4 pl-12 pr-4 font-mono text-sm focus:ring-1 focus:ring-[#e5c466] text-[#dde2f8] placeholder:text-[#dde2f8]/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button className="h-14 px-6 bg-[#242a3a] flex items-center rounded-xl border border-[#4c4637]/10 cursor-pointer hover:bg-[#2f3445] transition-colors">
                <span className="text-xs font-mono text-[#e5c466] uppercase">Jigawa.json</span>
              </button>
              <button className="h-14 px-6 bg-[#242a3a] flex items-center rounded-xl border border-[#4c4637]/10 cursor-pointer hover:bg-[#2f3445] transition-colors">
                <span className="text-xs font-mono text-[#e5c466] uppercase">Kano.json</span>
              </button>
              <button className="h-14 px-4 bg-[#e5c466] flex items-center rounded-xl text-[#3d2f00]">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Report Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockReports.map((report, index) => (
              <div key={index} className="bg-[#242a3a] rounded-xl overflow-hidden border border-[#4c4637]/10 flex flex-col">
                <div className="h-48 bg-[#191f2f] relative flex items-center justify-center">
                  <Layers className="w-12 h-12 text-[#e5c466]/30" />
                  {report.category !== 'INTEL' && (
                    <div className={`absolute top-4 left-4 font-mono text-[10px] font-bold px-2 py-0.5 rounded ${getCategoryStyle(report.category)}`}>
                      {report.category}
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-[10px] text-[#bdc7d9]">ID: {report.id}</span>
                    <span className="font-mono text-[10px] text-[#bdc7d9]">{report.time}</span>
                  </div>
                  <h4 className="text-lg font-bold mb-4 tracking-tight leading-snug">{report.title}</h4>
                  <p className="text-sm text-[#cfc5b2]/80 mb-6 flex-1">{report.description}</p>
                  <button className="text-[#e5c466] text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                    View Report <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Intelligence Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-[#242a3a] p-6 rounded-xl border border-[#4c4637]/15">
              <h4 className="text-xs uppercase tracking-widest text-[#dde2f8]/40 mb-4">Demographic Trend</h4>
              <div className="text-3xl font-bold leading-none mb-1">68.4%</div>
              <p className="text-xs text-[#50dfa4] font-mono">Youth Mobilization Peak</p>
              <div className="mt-8 flex gap-1 h-12 items-end">
                {[30, 50, 40, 70, 60, 85, 100, 90, 65, 75, 80, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#e5c466]/30 rounded-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>

            <div className="bg-[#242a3a] p-6 rounded-xl border border-[#4c4637]/15">
              <h4 className="text-xs uppercase tracking-widest text-[#dde2f8]/40 mb-4">Intelligence Feed</h4>
              <div className="space-y-4">
                {[
                  'New voter registration surge in Dutse LGA.',
                  'Satellite data confirms political rally assembly point Kano South.',
                  'Compliance report generated for Ward 04 monitoring.',
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className={`mt-1 w-2 h-2 rounded-full ${i === 0 ? 'bg-[#e5c466]' : 'bg-[#dde2f8]/20'}`}></div>
                    <div>
                      <p className="text-xs font-medium">{item}</p>
                      <p className="text-[10px] text-[#dde2f8]/40 font-mono mt-1">{['14:02', '13:45', '12:20'][i]} GMT+1</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#c8a94e]/10 p-6 rounded-xl border border-[#e5c466]/20 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Globe className="w-32 h-32 text-[#e5c466]" />
              </div>
              <h4 className="text-xs uppercase tracking-widest text-[#e5c466] mb-4">Sentiment Map</h4>
              <p className="text-sm leading-relaxed mb-6">Social media intelligence suggests a +12% shift in neutral sentiment across the northern corridor.</p>
              <div className="flex justify-between items-end">
                <div className="font-mono text-xs text-[#e5c466]">SCANNING...</div>
                <button className="text-xs font-bold text-[#e5c466] underline underline-offset-4">VIEW FULL OSINT</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="ml-72 bg-[#0d1322] py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-[#4c4637]/15">
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#dde2f8]/50">
          © 2024 The Sovereign Interface. All rights reserved.
        </p>
        <div className="flex gap-8">
          <a href="#" className="text-[#dde2f8]/40 hover:text-[#e5c466] transition-colors font-mono text-[11px]">Privacy Policy</a>
          <a href="#" className="text-[#dde2f8]/40 hover:text-[#e5c466] transition-colors font-mono text-[11px]">Terms of Service</a>
          <a href="#" className="text-[#dde2f8]/40 hover:text-[#e5c466] transition-colors font-mono text-[11px]">Security Protocols</a>
        </div>
      </footer>
    </div>
  );
}
