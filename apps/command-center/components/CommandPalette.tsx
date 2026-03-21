'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from 'cmdk';
import {
  Search,
  Users,
  MapPin,
  FileText,
  LayoutDashboard,
  Brain,
  Megaphone,
  Target,
  Calendar,
  Building2,
  Settings,
  ArrowRight,
  Radio,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface SearchItem {
  id: string;
  name: string;
  type: 'voter' | 'lga' | 'ward' | 'report' | 'page';
  href?: string;
  icon?: React.ElementType;
  shortcut?: string;
}

const pages: SearchItem[] = [
  { id: 'overview', name: 'Dashboard Overview', type: 'page', href: '/overview', icon: LayoutDashboard },
  { id: 'voters', name: 'Voter CRM', type: 'page', href: '/constituents/voters', icon: Users },
  { id: 'sentiment', name: 'Sentiment Dashboard', type: 'page', href: '/constituents/sentiment', icon: Brain },
  { id: 'political-atlas', name: 'Political Atlas', type: 'page', href: '/intelligence/political-atlas', icon: MapPin },
  { id: 'scenarios', name: 'Scenarios', type: 'page', href: '/intelligence/scenarios', icon: Brain },
  { id: 'coalition', name: 'Coalition', type: 'page', href: '/intelligence/coalition', icon: Building2 },
  { id: 'osint', name: 'OSINT Intelligence Center', type: 'page', href: '/intelligence/osint', icon: Radio },
  { id: 'osint-mentions', name: 'OSINT Mentions', type: 'page', href: '/intelligence/osint/mentions', icon: FileText },
  { id: 'osint-alerts', name: 'OSINT Alerts', type: 'page', href: '/intelligence/osint/alerts', icon: AlertTriangle },
  { id: 'osint-briefs', name: 'Daily Briefs', type: 'page', href: '/intelligence/osint/briefs', icon: TrendingUp },
  { id: 'scorecards', name: 'Scorecards', type: 'page', href: '/narrative/scorecards', icon: FileText },
  { id: 'content', name: 'Content', type: 'page', href: '/narrative/content', icon: Megaphone },
  { id: 'messaging', name: 'Messaging', type: 'page', href: '/narrative/messaging', icon: Megaphone },
  { id: 'micro-targeting', name: 'Micro-targeting', type: 'page', href: '/campaign/micro-targeting', icon: Target },
  { id: 'election-day', name: 'Election Day', type: 'page', href: '/election-day', icon: Calendar },
  { id: 'settings', name: 'Settings', type: 'page', href: '/settings', icon: Settings },
];

// Mock data - will be replaced with API search
const mockVoters: SearchItem[] = [
  { id: 'v1', name: 'Ahmad Abdullahi', type: 'voter' },
  { id: 'v2', name: 'Fatima Yusuf', type: 'voter' },
  { id: 'v3', name: 'Usman Ibrahim', type: 'voter' },
  { id: 'v4', name: 'Aisha Mohammed', type: 'voter' },
  { id: 'v5', name: 'Ibrahim Ali', type: 'voter' },
];

const mockLGAs: SearchItem[] = [
  { id: 'l1', name: 'Dutse', type: 'lga' },
  { id: 'l2', name: 'Hadejia', type: 'lga' },
  { id: 'l3', name: 'Birnin Kudu', type: 'lga' },
  { id: 'l4', name: 'Gumel', type: 'lga' },
  { id: 'l5', name: 'Kazaure', type: 'lga' },
];

const mockReports: SearchItem[] = [
  { id: 'r1', name: 'Weekly Intelligence Brief - Week 12', type: 'report' },
  { id: 'r2', name: 'Opposition Analysis - March 2026', type: 'report' },
  { id: 'r3', name: 'Sentiment Report - Q1 2026', type: 'report' },
];

export default function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [search, setSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('uradi-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Keyboard shortcut: Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const handleSelect = (item: SearchItem) => {
    // Add to recent searches
    const newRecent = [item, ...recentSearches.filter((r) => r.id !== item.id)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('uradi-recent-searches', JSON.stringify(newRecent));

    // Navigate
    if (item.href) {
      router.push(item.href);
    } else if (item.type === 'voter') {
      router.push(`/constituents/voters/${item.id}`);
    } else if (item.type === 'lga') {
      router.push(`/constituents/voters?lga=${item.id}`);
    } else if (item.type === 'report') {
      router.push(`/intelligence/reports/${item.id}`);
    }

    setCommandPaletteOpen(false);
    setSearch('');
  };

  // Filter items based on search
  const filteredPages = pages.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredVoters = mockVoters.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredLGAs = mockLGAs.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredReports = mockReports.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
    >
      <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden shadow-2xl">
        <CommandInput
          placeholder="Search voters, LGAs, reports, or pages..."
          value={search}
          onValueChange={setSearch}
          className="border-0 border-b border-uradi-border bg-uradi-bg-secondary text-uradi-text-primary placeholder:text-uradi-text-tertiary px-4 py-3 focus:ring-0"
        />
        <CommandList className="max-h-[60vh] overflow-y-auto bg-uradi-bg-secondary">
          <CommandEmpty className="py-6 text-center text-uradi-text-secondary">
            No results found for "{search}"
          </CommandEmpty>

          {/* Recent Searches */}
          {!search && recentSearches.length > 0 && (
            <CommandGroup heading="Recent">
              {recentSearches.map((item) => {
                const Icon = item.icon || Search;
                return (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSelect(item)}
                    className="px-4 py-2.5 text-uradi-text-primary hover:bg-uradi-bg-tertiary cursor-pointer flex items-center gap-3"
                  >
                    <Icon className="h-4 w-4 text-uradi-text-tertiary" />
                    <span>{item.name}</span>
                    <span className="ml-auto text-xs text-uradi-text-tertiary capitalize">
                      {item.type}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Pages */}
          {filteredPages.length > 0 && (
            <CommandGroup heading="Pages">
              {filteredPages.map((page) => {
                const Icon = page.icon || ArrowRight;
                return (
                  <CommandItem
                    key={page.id}
                    value={page.id}
                    onSelect={() => handleSelect(page)}
                    className="px-4 py-2.5 text-uradi-text-primary hover:bg-uradi-bg-tertiary cursor-pointer flex items-center gap-3"
                  >
                    <Icon className="h-4 w-4 text-uradi-gold" />
                    <span>{page.name}</span>
                    <span className="ml-auto text-xs text-uradi-text-tertiary">
                      Page
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Voters */}
          {filteredVoters.length > 0 && (
            <>
              <CommandSeparator className="bg-uradi-border" />
              <CommandGroup heading="Voters">
                {filteredVoters.map((voter) => (
                  <CommandItem
                    key={voter.id}
                    value={voter.id}
                    onSelect={() => handleSelect(voter)}
                    className="px-4 py-2.5 text-uradi-text-primary hover:bg-uradi-bg-tertiary cursor-pointer flex items-center gap-3"
                  >
                    <Users className="h-4 w-4 text-uradi-status-info" />
                    <span>{voter.name}</span>
                    <span className="ml-auto text-xs text-uradi-text-tertiary">
                      Voter
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* LGAs */}
          {filteredLGAs.length > 0 && (
            <>
              <CommandSeparator className="bg-uradi-border" />
              <CommandGroup heading="LGAs">
                {filteredLGAs.map((lga) => (
                  <CommandItem
                    key={lga.id}
                    value={lga.id}
                    onSelect={() => handleSelect(lga)}
                    className="px-4 py-2.5 text-uradi-text-primary hover:bg-uradi-bg-tertiary cursor-pointer flex items-center gap-3"
                  >
                    <MapPin className="h-4 w-4 text-uradi-status-positive" />
                    <span>{lga.name}</span>
                    <span className="ml-auto text-xs text-uradi-text-tertiary">
                      LGA
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Reports */}
          {filteredReports.length > 0 && (
            <>
              <CommandSeparator className="bg-uradi-border" />
              <CommandGroup heading="Reports">
                {filteredReports.map((report) => (
                  <CommandItem
                    key={report.id}
                    value={report.id}
                    onSelect={() => handleSelect(report)}
                    className="px-4 py-2.5 text-uradi-text-primary hover:bg-uradi-bg-tertiary cursor-pointer flex items-center gap-3"
                  >
                    <FileText className="h-4 w-4 text-uradi-status-warning" />
                    <span className="truncate">{report.name}</span>
                    <span className="ml-auto text-xs text-uradi-text-tertiary">
                      Report
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>

        {/* Footer */}
        <div className="border-t border-uradi-border px-4 py-2 flex items-center justify-between text-xs text-uradi-text-tertiary bg-uradi-bg-primary">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-uradi-bg-tertiary">↑↓</span>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-uradi-bg-tertiary">↵</span>
              <span>Select</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-uradi-bg-tertiary">Esc</span>
            <span>Close</span>
          </div>
        </div>
      </div>
    </CommandDialog>
  );
}
