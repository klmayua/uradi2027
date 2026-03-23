'use client';

/**
 * Campaign Micro-targeting - Sovereign Interface Design
 * Precision voter targeting and outreach management
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Target,
  Users,
  MapPin,
  Filter,
  Zap,
  Send,
  Plus,
  TrendingUp,
  ChevronRight,
  Download,
  Rocket,
  Search,
  CheckCircle,
  AlertCircle,
  Eye,
  Smartphone,
  MessageSquare,
  Menu,
  Shield,
  Settings,
  Globe,
  Brain,
  FileText,
} from 'lucide-react';

// Mock voter data
const mockVoters = [
  {
    id: 'VR-90221',
    name: 'Kamsi Okoro',
    initials: 'KO',
    lga: 'Lagos Island',
    ward: 'Ward 04',
    sentiment: 88,
    reach: 65,
  },
  {
    id: 'VR-81002',
    name: 'Babatunde Musa',
    initials: 'BM',
    lga: 'Eti-Osa',
    ward: 'Ward 01',
    sentiment: 52,
    reach: 20,
  },
  {
    id: 'VR-77291',
    name: 'Aminu Yakubu',
    initials: 'AY',
    lga: 'Ikeja',
    ward: 'Ward 09',
    sentiment: 12,
    reach: 5,
  },
  {
    id: 'VR-88011',
    name: 'Sarah Chima',
    initials: 'SC',
    lga: 'Surulere',
    ward: 'Ward 02',
    sentiment: 91,
    reach: 89,
  },
];

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: false },
  { icon: Users, label: 'Voter Database', active: true },
  { icon: Globe, label: 'Analytics', active: false },
  { icon: MapPin, label: 'Campaign Maps', active: false },
  { icon: FileText, label: 'Narrative', active: false },
  { icon: Zap, label: 'Polling', active: false },
  { icon: Shield, label: 'Security', active: false },
];

const getSentimentColor = (sentiment: number) => {
  if (sentiment >= 70) return 'bg-[#50dfa4]';
  if (sentiment >= 40) return 'bg-[#e5c466]';
  return 'bg-[#ffb4ab]';
};

const getSentimentText = (sentiment: number) => {
  if (sentiment >= 70) return 'text-[#50dfa4]';
  if (sentiment >= 40) return 'text-[#e5c466]';
  return 'text-[#ffb4ab]';
};

export default function MicroTargetingPage() {
  const [activeTab, setActiveTab] = useState('voters');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#0d1322] text-[#dde2f8] font-sans">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-72 z-40 bg-[#151b2b] border-r border-[#4c4637]/15 shadow-2xl hidden md:flex flex-col">
        <div className="px-8 py-10">
          <div className="text-xl font-bold text-[#e5c466] tracking-tighter mb-12">SOVEREIGN</div>
          <nav className="space-y-1">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href="#"
                className={`flex items-center gap-4 py-3 px-6 transition-colors rounded-lg ${
                  item.active
                    ? 'bg-[#2f3445]/60 text-[#e5c466] font-bold border-l-4 border-[#e5c466]'
                    : 'text-[#dde2f8]/60 hover:text-[#dde2f8] hover:bg-[#242a3a]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm tracking-tight">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-8 border-t border-[#4c4637]/10 bg-[#0d1322]/40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#c8a94e] flex items-center justify-center text-[#3d2f00] font-bold">DS</div>
            <div>
              <div className="font-medium text-sm tracking-tight text-[#e5c466]">Director Smith</div>
              <div className="text-[10px] uppercase tracking-widest text-[#dde2f8]/40">Elite Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-72 min-h-screen">
        {/* TopAppBar */}
        <header className="fixed top-0 right-0 left-0 md:left-72 z-50 bg-[#0d1322]/80 backdrop-blur-xl border-b border-[#4c4637]/10 px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-[#e5c466]">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold tracking-tight text-[#e5c466]">Command Center</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#50dfa4]/10 text-[#50dfa4] uppercase tracking-widest hidden sm:block">Live System</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Eye className="w-5 h-5 text-[#dde2f8]/60" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ffb4ab] rounded-full animate-pulse"></span>
            </div>
            <div className="h-8 w-[1px] bg-[#4c4637]/20 hidden sm:block"></div>
            <button className="bg-gradient-to-br from-[#e5c466] to-[#c8a94e] text-[#3d2f00] px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-[#e5c466]/10 hover:shadow-[#e5c466]/20 transition-all active:scale-95 flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="pt-28 pb-12 px-6 md:px-10 max-w-[1600px] mx-auto space-y-8">
          {/* Header & Filter Tabs */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black italic text-[#e5c466] tracking-tighter">Campaign Micro-targeting</h2>
                <p className="text-[#cfc5b2] font-medium mt-1">Surgical data segmentation for strategic mobilization.</p>
              </div>
              <div className="flex items-center gap-2 bg-[#151b2b] p-1.5 rounded-xl border border-[#4c4637]/10">
                {['voters', 'youth', 'anchors'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeTab === tab
                        ? 'bg-[#2f3445] text-[#e5c466]'
                        : 'text-[#dde2f8]/60 hover:text-[#dde2f8]'
                    }`}
                  >
                    {tab === 'voters' ? 'Voters' : tab === 'youth' ? 'Youth Ambassadors' : 'Anchor Citizens'}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Filters Bento */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#151b2b] p-5 rounded-xl border border-[#4c4637]/5">
                <label className="text-[10px] uppercase tracking-widest text-[#dde2f8]/40 block mb-3">Demographic</label>
                <select className="w-full bg-[#242a3a] border-none rounded-lg text-sm text-[#dde2f8] h-10 px-4">
                  <option>All Ages</option>
                  <option>18-25 (Gen Z)</option>
                  <option>26-40 (Millennials)</option>
                  <option>41+</option>
                </select>
              </div>
              <div className="bg-[#151b2b] p-5 rounded-xl border border-[#4c4637]/5">
                <label className="text-[10px] uppercase tracking-widest text-[#dde2f8]/40 block mb-3">Alignment</label>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-[#e5c466]/10 text-[#e5c466] border border-[#e5c466]/20 rounded-lg text-xs font-bold">APC</button>
                  <button className="flex-1 py-2 bg-[#242a3a] text-[#dde2f8]/40 rounded-lg text-xs font-bold">PDP</button>
                  <button className="flex-1 py-2 bg-[#242a3a] text-[#dde2f8]/40 rounded-lg text-xs font-bold">LP</button>
                </div>
              </div>
              <div className="bg-[#151b2b] p-5 rounded-xl border border-[#4c4637]/5">
                <label className="text-[10px] uppercase tracking-widest text-[#dde2f8]/40 block mb-3">Sentiment Range</label>
                <div className="flex items-center gap-4">
                  <input type="range" className="w-full accent-[#e5c466] bg-[#242a3a] h-1.5 rounded-full cursor-pointer" />
                  <span className="font-mono text-[#e5c466] text-xs font-bold">75%+</span>
                </div>
              </div>
              <div className="bg-[#151b2b] p-5 rounded-xl border border-[#4c4637]/5 flex items-end">
                <button className="w-full h-10 bg-[#2f3445] hover:bg-[#3a4050] text-[#dde2f8] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Filter className="w-4 h-4" />
                  Apply Precision Filter
                </button>
              </div>
            </div>
          </section>

          {/* Data Ecosystem Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Table Section */}
            <div className="lg:col-span-8 bg-[#151b2b] rounded-2xl overflow-hidden border border-[#4c4637]/5 shadow-xl">
              <div className="px-6 md:px-8 py-6 border-b border-[#4c4637]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-lg text-[#dde2f8]">Target Audience Registry</h3>
                  <p className="text-xs text-[#dde2f8]/40 font-mono">SEGMENT_ID: ARCHITECT_BETA_09</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-[10px] uppercase tracking-widest text-[#dde2f8]/40">Filtered Pool</div>
                  <div className="font-mono text-[#e5c466] font-bold">12,402 Voters</div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#242a3a]">
                    <tr>
                      <th className="p-5 border-b border-[#4c4637]/10">
                        <input type="checkbox" className="rounded bg-[#080e1d] border-[#4c4637] text-[#e5c466]" />
                      </th>
                      <th className="p-5 border-b border-[#4c4637]/10 text-[10px] uppercase tracking-widest text-[#dde2f8]/50">Voter Profile</th>
                      <th className="p-5 border-b border-[#4c4637]/10 text-[10px] uppercase tracking-widest text-[#dde2f8]/50">LGA / Ward</th>
                      <th className="p-5 border-b border-[#4c4637]/10 text-[10px] uppercase tracking-widest text-[#dde2f8]/50">Sentiment</th>
                      <th className="p-5 border-b border-[#4c4637]/10 text-[10px] uppercase tracking-widest text-[#dde2f8]/50">Reach</th>
                      <th className="p-5 border-b border-[#4c4637]/10 text-[10px] uppercase tracking-widest text-[#dde2f8]/50 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#4c4637]/5">
                    {mockVoters.map((voter) => (
                      <tr key={voter.id} className="hover:bg-[#242a3a]/30 transition-colors">
                        <td className="p-5">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(voter.id)}
                            onChange={() => toggleRow(voter.id)}
                            className="rounded bg-[#080e1d] border-[#4c4637] text-[#e5c466]"
                          />
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#2f3445] flex items-center justify-center text-xs font-bold text-[#e5c466]">
                              {voter.initials}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-[#dde2f8]">{voter.name}</div>
                              <div className="text-[10px] text-[#dde2f8]/40">ID: #{voter.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="text-xs font-medium">{voter.lga}</div>
                          <div className="text-[10px] text-[#dde2f8]/40">{voter.ward}</div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getSentimentColor(voter.sentiment)}`}></div>
                            <span className={`font-mono text-xs font-bold ${getSentimentText(voter.sentiment)}`}>{voter.sentiment}%</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="w-24 bg-[#080e1d] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#e5c466] h-full" style={{ width: `${voter.reach}%` }}></div>
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-2 rounded-lg bg-[#2f3445] text-[#25D366] hover:bg-[#25D366]/10 transition-colors">
                              <Smartphone className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg bg-[#2f3445] text-[#34B7F1] hover:bg-[#34B7F1]/10 transition-colors">
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-4 bg-[#080e1d]/50 flex items-center justify-between border-t border-[#4c4637]/10">
                <span className="text-[10px] uppercase tracking-widest text-[#dde2f8]/40 px-4">Showing 4 of 12,402 entries</span>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-[#2f3445] text-[#dde2f8]/60">
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-[#e5c466] text-[#3d2f00] font-bold text-xs">1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-[#2f3445] text-[#dde2f8]/60">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Strategic Summary Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Campaign Reach Card */}
              <div className="bg-[#151b2b] p-8 rounded-2xl border border-[#4c4637]/5">
                <h4 className="text-[10px] uppercase tracking-widest text-[#dde2f8]/40 mb-6">Reach Efficiency</h4>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold">Total Target Conversion</span>
                      <span className="font-mono text-xl font-bold text-[#e5c466]">72.4%</span>
                    </div>
                    <div className="w-full h-2 bg-[#080e1d] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#e5c466] to-[#c8a94e]" style={{ width: '72.4%' }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#080e1d] p-4 rounded-xl">
                      <div className="text-[10px] text-[#dde2f8]/40 uppercase tracking-tighter">Messaged</div>
                      <div className="font-mono text-lg font-bold">8.9K</div>
                    </div>
                    <div className="bg-[#080e1d] p-4 rounded-xl">
                      <div className="text-[10px] text-[#dde2f8]/40 uppercase tracking-tighter">Engaged</div>
                      <div className="font-mono text-lg font-bold text-[#50dfa4]">6.1K</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="bg-[rgba(47,52,69,0.6)] backdrop-blur-xl p-8 rounded-2xl border border-[#e5c466]/10">
                <h4 className="text-sm font-bold text-[#e5c466] mb-4 flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Bulk Action Broadcast
                </h4>
                <p className="text-xs text-[#dde2f8]/60 mb-6">Initiate immediate communication with selected cohort ({selectedRows.length} selected).</p>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] group hover:bg-[#25D366] hover:text-white transition-all">
                    <span className="font-bold text-sm">WhatsApp Broadcast</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[#34B7F1]/10 border border-[#34B7F1]/20 text-[#34B7F1] group hover:bg-[#34B7F1] hover:text-white transition-all">
                    <span className="font-bold text-sm">SMS Direct Protocol</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[#2f3445] text-[#dde2f8] group hover:bg-[#dde2f8] hover:text-[#0d1322] transition-all">
                    <span className="font-bold text-sm">Direct Voice IVR</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Geographic Heatmap Placeholder */}
              <div className="bg-[#151b2b] rounded-2xl border border-[#4c4637]/5 overflow-hidden">
                <div className="p-6">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#dde2f8]/40">Density Map</h4>
                </div>
                <div className="h-48 w-full bg-[#080e1d] relative flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full" style={{
                      backgroundImage: `radial-gradient(circle at 30% 40%, rgba(229,196,102,0.3) 0%, transparent 50%),
                                        radial-gradient(circle at 70% 60%, rgba(229,196,102,0.2) 0%, transparent 40%)`
                    }}></div>
                  </div>
                  <div className="w-12 h-12 bg-[#e5c466]/20 rounded-full animate-ping absolute"></div>
                </div>
                <div className="p-6 flex justify-between items-center bg-[#2f3445]/20">
                  <span className="text-xs font-bold">Lagos Metropolitan</span>
                  <span className="text-[10px] font-mono text-[#e5c466]">LIVE UPDATES</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-[#4c4637]/15 bg-[#0d1322]">
          <div className="font-mono text-[11px] uppercase tracking-widest text-[#dde2f8]/50 text-center md:text-left">
            © 2024 The Sovereign Interface. All rights reserved.
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-[#dde2f8]/40 hover:text-[#e5c466] transition-colors font-mono text-[11px]">Privacy Policy</a>
            <a href="#" className="text-[#dde2f8]/40 hover:text-[#e5c466] transition-colors font-mono text-[11px]">Terms of Service</a>
            <a href="#" className="text-[#dde2f8]/40 hover:text-[#e5c466] transition-colors font-mono text-[11px]">Security Protocols</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
