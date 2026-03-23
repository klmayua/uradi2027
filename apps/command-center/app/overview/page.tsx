'use client';

/**
 * Command Center Overview - Sovereign Interface Design
 * Premium dark theme dashboard with glassmorphism effects
 */

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import {
  Users,
  HeartPulse,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  AlertCircle,
  MessageSquare,
  Rocket,
  Menu,
  Bell,
  Settings,
  LogOut,
  LayoutDashboard,
  Globe,
  Brain,
  Target,
  Shield,
} from 'lucide-react';

// Mock data for the dashboard
const mockKpiData = [
  {
    name: 'Voter Sentiment Index',
    value: 74.2,
    change: '+2.4%',
    trend: 'up',
    icon: HeartPulse,
    subtitle: 'Live Intelligence Stream',
  },
  {
    name: 'Total Voters',
    value: '1.2M',
    change: null,
    trend: 'neutral',
    icon: Users,
    subtitle: 'Registered Base',
  },
  {
    name: 'Campaign Spend',
    value: '$4.8M',
    change: '12% over budget',
    trend: 'down',
    icon: Activity,
    subtitle: 'Resource Allocation',
  },
  {
    name: 'Days to Election',
    value: 247,
    change: null,
    trend: 'neutral',
    icon: Calendar,
    subtitle: 'Tactical Timeline',
  },
];

const mockSentimentData = [
  { date: '2026-03-01', sentiment: 62, jigawa: 65, kano: 58 },
  { date: '2026-03-02', sentiment: 58, jigawa: 61, kano: 54 },
  { date: '2026-03-03', sentiment: 65, jigawa: 68, kano: 61 },
  { date: '2026-03-04', sentiment: 67, jigawa: 70, kano: 63 },
  { date: '2026-03-05', sentiment: 70, jigawa: 73, kano: 66 },
  { date: '2026-03-06', sentiment: 68, jigawa: 71, kano: 64 },
  { date: '2026-03-07', sentiment: 72, jigawa: 75, kano: 68 },
  { date: '2026-03-08', sentiment: 75, jigawa: 78, kano: 71 },
  { date: '2026-03-09', sentiment: 73, jigawa: 76, kano: 69 },
  { date: '2026-03-10', sentiment: 77, jigawa: 80, kano: 73 },
  { date: '2026-03-11', sentiment: 79, jigawa: 82, kano: 75 },
  { date: '2026-03-12', sentiment: 81, jigawa: 84, kano: 77 },
  { date: '2026-03-13', sentiment: 80, jigawa: 83, kano: 76 },
  { date: '2026-03-14', sentiment: 82, jigawa: 85, kano: 78 },
  { date: '2026-03-15', sentiment: 85, jigawa: 88, kano: 81 },
];

const mockActivityData = [
  { id: 1, user: 'Ahmad Abdullahi', action: 'Added 500 new voters in Dutse LGA', time: '2 min ago', type: 'voter' },
  { id: 2, user: 'Fatima Yusuf', action: 'Published Q3 Governance Scorecard', time: '15 min ago', type: 'content' },
  { id: 3, user: 'Usman Ibrahim', action: 'Sentiment alert: Ringim LGA dropped -8 points', time: '1 hour ago', type: 'alert' },
  { id: 4, user: 'Aisha Mohammed', action: 'Sent WhatsApp messages to 5,000 constituents', time: '2 hours ago', type: 'messaging' },
  { id: 5, user: 'Ibrahim Ali', action: 'Created new intelligence report on opposition', time: '3 hours ago', type: 'intelligence' },
];

const mockPartyLeaning = [
  { name: 'APC', value: 35, color: '#1E40AF' },
  { name: 'PDP', value: 25, color: '#DC2626' },
  { name: 'NNPP', value: 20, color: '#7C3AED' },
  { name: 'ADC', value: 8, color: '#059669' },
  { name: 'Undecided', value: 12, color: '#6B7280' },
];

const getActivityIcon = (type: string) => {
  const iconClass = "w-4 h-4";
  switch (type) {
    case 'voter':
      return <Users className={`${iconClass} text-[#50dfa4]`} />;
    case 'content':
      return <FileText className={`${iconClass} text-[#e5c466]`} />;
    case 'alert':
      return <AlertCircle className={`${iconClass} text-[#ffb4ab]`} />;
    case 'messaging':
      return <MessageSquare className={`${iconClass} text-[#50dfa4]`} />;
    case 'intelligence':
      return <Activity className={`${iconClass} text-[#bdc7d9]`} />;
    default:
      return <Activity className={`${iconClass} text-[#6B7280]`} />;
  }
};

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Globe, label: 'Analytics', active: false },
  { icon: Brain, label: 'Intelligence', active: false },
  { icon: MapPin, label: 'Campaign Maps', active: false },
  { icon: Users, label: 'Voter Database', active: false },
  { icon: Target, label: 'Polling', active: false },
  { icon: Shield, label: 'Security', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

export default function OverviewPage() {
  const [mounted, setMounted] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Animate the score
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.floor(74.2 * easeOut));

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedScore(74.2);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0d1322] flex items-center justify-center">
        <div className="animate-pulse text-[#e5c466]">Initializing...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1322] text-[#dde2f8] font-sans">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d1322]/80 backdrop-blur-xl border-b border-[#4c4637]/10 h-20 flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          <button className="text-[#e5c466] hover:opacity-80 transition-opacity">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-[#e5c466]">Command Center</h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#50dfa4]/10 text-[#50dfa4] uppercase tracking-widest">Live System</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Bell className="w-5 h-5 text-[#dde2f8]/60 group-hover:text-[#e5c466] cursor-pointer transition-colors" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ffb4ab] rounded-full animate-pulse"></span>
          </div>
          <div className="h-8 w-[1px] bg-[#4c4637]/20"></div>
          <button className="bg-gradient-to-br from-[#e5c466] to-[#c8a94e] text-[#3d2f00] px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-[#e5c466]/10 hover:shadow-[#e5c466]/20 transition-all active:scale-95 flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 h-full w-20 bg-[#151b2b] border-r border-[#4c4637]/15 z-40 hidden md:flex flex-col items-center py-8 gap-8 pt-24">
        <div className="text-[#e5c466] text-2xl font-black italic tracking-tighter">S</div>
        <div className="flex flex-col gap-6">
          {navItems.slice(0, 5).map((item, index) => (
            <button
              key={index}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                item.active
                  ? 'bg-[#2f3445]/60 text-[#e5c466] border-l-4 border-[#e5c466]'
                  : 'text-[#dde2f8]/60 hover:text-[#e5c466]'
              }`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-6 pb-8">
          {navItems.slice(5).map((item, index) => (
            <button
              key={index}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-[#dde2f8]/60 hover:text-[#e5c466] transition-colors"
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-0 md:ml-20 pt-24 pb-12 px-4 md:px-10 max-w-[1600px] mx-auto">
        {/* Hero Intelligence Section */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#50dfa4] animate-pulse"></div>
            <span className="text-[10px] uppercase tracking-widest text-[#50dfa4] font-bold">Live Intelligence Stream</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tighter mb-6">Strategic Overview</h2>

          {/* Asymmetric Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large Primary Stat Card */}
            <div className="md:col-span-2 relative overflow-hidden rounded-xl bg-[#151b2b] p-8 border border-[#4c4637]/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#e5c466]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="relative z-10">
                <p className="text-[10px] uppercase tracking-widest text-[#cfc5b2] font-medium mb-1">Voter Sentiment Index</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="font-mono text-5xl font-bold text-[#e5c466] tracking-tighter">{animatedScore.toFixed(1)}</span>
                  <span className="text-[#50dfa4] flex items-center text-sm font-bold">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +2.4%
                  </span>
                </div>
                {/* Sparkline */}
                <div className="w-full h-24 flex items-end gap-1.5">
                  {[40, 55, 45, 70, 60, 85, 100, 90, 65, 75, 80, 95].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-sm transition-all duration-500 ${
                        i === 11 ? 'bg-gradient-to-t from-[#e5c466] to-[#c8a94e]' : 'bg-[#e5c466]/20'
                      }`}
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-[rgba(47,52,69,0.6)] backdrop-blur-xl border border-[#4c4637]/15 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <Rocket className="text-[#e5c466] mb-4 w-8 h-8" />
                <h3 className="font-bold text-lg leading-tight mb-2">Rapid Response Protocol</h3>
                <p className="text-sm text-[#cfc5b2] leading-relaxed">Media control identifies negative shift in District 4. Deploy counter-narrative assets?</p>
              </div>
              <button className="bg-gradient-to-r from-[#e5c466] to-[#c8a94e] text-[#3d2f00] font-bold py-3 px-6 rounded-lg text-sm transition-all hover:shadow-[0_0_15px_rgba(229,196,102,0.3)] flex items-center justify-center gap-2">
                Execute Strategy
                <Rocket className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Secondary Stats - Density Focus */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {mockKpiData.slice(1).map((kpi, index) => {
            const Icon = kpi.icon;
            const isNegative = kpi.trend === 'down';
            return (
              <div key={index} className="bg-[#151b2b] p-5 rounded-xl border border-[#4c4637]/5">
                <p className="text-[10px] uppercase tracking-widest text-[#cfc5b2] mb-3">{kpi.name}</p>
                <p className="font-mono text-xl font-bold text-[#dde2f8]">{kpi.value}</p>
                {kpi.change && (
                  <p className={`text-[10px] mt-2 ${isNegative ? 'text-[#ffb4ab]' : 'text-[#50dfa4]'}`}>
                    {kpi.change}
                  </p>
                )}
                <div className="mt-3 h-1 w-full bg-[#0d1322] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#e5c466]"
                    style={{ width: `${[88, 65, 20][index]}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </section>

        {/* District Intelligence Map & List */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-3 rounded-xl overflow-hidden bg-[#080e1d] border border-[#4c4637]/10 min-h-[400px] relative">
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
                <path d="M200 100L250 150L300 120L400 200L350 300L200 350L150 250L200 100Z" fill="#e5c466" fillOpacity="0.1" stroke="#e5c466" strokeWidth="0.5"/>
                <path d="M450 150L550 120L650 200L600 350L450 400L400 300L450 150Z" fill="#e5c466" fillOpacity="0.05" stroke="#e5c466" strokeWidth="0.5"/>
                <circle className="animate-pulse" cx="270" cy="180" r="4" fill="#e5c466"/>
                <circle cx="520" cy="220" r="3" fill="#e5c466"/>
              </svg>
            </div>

            {/* Map Overlays */}
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
            </div>

            {/* Alert FAB */}
            <button className="absolute bottom-12 right-12 z-20 group">
              <div className="flex items-center gap-4 bg-[#93000a]/20 hover:bg-[#93000a]/40 backdrop-blur-xl p-4 rounded-2xl border border-[#ffb4ab]/30 transition-all duration-300">
                <div className="w-12 h-12 bg-[#e5c466] flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(229,196,102,0.4)]">
                  <AlertCircle className="w-6 h-6 text-[#3d2f00]" />
                </div>
                <div className="pr-4">
                  <p className="text-[10px] uppercase tracking-tighter text-[#e5c466] font-bold">Priority Action</p>
                  <p className="text-sm font-bold text-[#dde2f8]">Rapid Response Alert</p>
                </div>
              </div>
            </button>
          </div>

          {/* Critical Alerts List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#dde2f8]/50 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Critical Alerts
            </h3>

            <div className="space-y-3">
              {mockActivityData.slice(0, 3).map((activity, index) => (
                <div
                  key={activity.id}
                  className="bg-[#242a3a]/40 p-4 rounded-xl flex gap-4 items-start border-l-2 border-[#e5c466]"
                >
                  <div className="bg-[#e5c466]/10 p-2 rounded-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-sm font-bold mb-1">{activity.action}</p>
                    <p className="text-[10px] text-[#e5c466] mt-2 font-mono">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Sentiment Trend */}
          <div className="lg:col-span-2 bg-[#151b2b] rounded-xl p-6 border border-[#4c4637]/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Sentiment Trend</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#e5c466]"></span>
                  <span className="text-[#cfc5b2]">Overall</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#3B82F6]"></span>
                  <span className="text-[#cfc5b2]">Jigawa</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockSentimentData}>
                  <defs>
                    <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e5c466" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e5c466" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4c4637" />
                  <XAxis
                    dataKey="date"
                    stroke="#98907e"
                    tick={{ fill: '#98907e', fontSize: 11 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#98907e" tick={{ fill: '#98907e', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151b2b',
                      borderColor: '#4c4637',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: '#dde2f8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sentiment"
                    stroke="#e5c466"
                    strokeWidth={2}
                    fill="url(#sentimentGradient)"
                  />
                  <Line type="monotone" dataKey="jigawa" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Party Leaning */}
          <div className="bg-[#151b2b] rounded-xl p-6 border border-[#4c4637]/10">
            <h2 className="text-lg font-semibold mb-4">Party Leaning</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockPartyLeaning}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {mockPartyLeaning.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151b2b',
                      borderColor: '#4c4637',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {mockPartyLeaning.map((party) => (
                <div key={party.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: party.color }}></span>
                  <span className="text-xs text-[#cfc5b2]">{party.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="ml-0 md:ml-20 bg-[#0d1322] py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-[#4c4637]/15">
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#dde2f8]/50">
          © 2024 The Sovereign Interface. All rights reserved.
        </p>
        <div className="flex gap-8">
          <a href="#" className="text-[#dde2f8]/40 hover:text-[#e5c466] transition-colors font-mono text-[11px] uppercase tracking-widest">Privacy</a>
          <a href="#" className="text-[#dde2f8]/40 hover:text-[#e5c466] transition-colors font-mono text-[11px] uppercase tracking-widest">Terms</a>
          <a href="#" className="text-[#dde2f8]/40 hover:text-[#e5c466] transition-colors font-mono text-[11px] uppercase tracking-widest">Security</a>
        </div>
      </footer>
    </div>
  );
}
