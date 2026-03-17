'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Phone,
  MapPin,
  Heart,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MessageSquare,
  Mail,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock voter data
interface Voter {
  id: string;
  full_name: string;
  phone: string;
  lga: string;
  ward: string;
  sentiment_score: number;
  persuadability_score: number;
  party_leaning: string;
  last_contacted: string;
  source: string;
}

const mockVoters: Voter[] = [
  { id: '1', full_name: 'Ahmad Abdullahi', phone: '+234 801 234 5678', lga: 'Dutse', ward: 'Sabuwar', sentiment_score: 75, persuadability_score: 60, party_leaning: 'PDP', last_contacted: '2 days ago', source: 'Canvass' },
  { id: '2', full_name: 'Fatima Yusuf', phone: '+234 802 345 6789', lga: 'Hadejia', ward: 'Central', sentiment_score: 85, persuadability_score: 45, party_leaning: 'PDP', last_contacted: '1 week ago', source: 'WhatsApp' },
  { id: '3', full_name: 'Usman Ibrahim', phone: '+234 803 456 7890', lga: 'Birnin Kudu', ward: 'North', sentiment_score: 45, persuadability_score: 80, party_leaning: 'APC', last_contacted: '3 days ago', source: 'USSD' },
  { id: '4', full_name: 'Aisha Mohammed', phone: '+234 804 567 8901', lga: 'Gumel', ward: 'East', sentiment_score: 90, persuadability_score: 30, party_leaning: 'PDP', last_contacted: '1 day ago', source: 'Rally' },
  { id: '5', full_name: 'Ibrahim Ali', phone: '+234 805 678 9012', lga: 'Kazaure', ward: 'West', sentiment_score: 30, persuadability_score: 70, party_leaning: 'NNPP', last_contacted: '5 days ago', source: 'Referral' },
  { id: '6', full_name: 'Halima Abubakar', phone: '+234 806 789 0123', lga: 'Ringim', ward: 'South', sentiment_score: 65, persuadability_score: 55, party_leaning: 'Undecided', last_contacted: '2 weeks ago', source: 'Canvass' },
  { id: '7', full_name: 'Yusuf Garba', phone: '+234 807 890 1234', lga: 'Maigatari', ward: 'Central', sentiment_score: 80, persuadability_score: 40, party_leaning: 'PDP', last_contacted: '4 days ago', source: 'WhatsApp' },
  { id: '8', full_name: 'Zainab Musa', phone: '+234 808 901 2345', lga: 'Sule Tankarkar', ward: 'North', sentiment_score: 55, persuadability_score: 65, party_leaning: 'ADC', last_contacted: '1 week ago', source: 'USSD' },
];

const getSentimentColor = (score: number) => {
  if (score >= 70) return 'bg-uradi-status-positive';
  if (score >= 40) return 'bg-uradi-status-warning';
  return 'bg-uradi-status-critical';
};

const getPartyColor = (party: string) => {
  switch (party) {
    case 'APC': return 'bg-uradi-party-apc';
    case 'PDP': return 'bg-uradi-party-pdp';
    case 'NNPP': return 'bg-uradi-party-nnpp';
    case 'ADC': return 'bg-uradi-party-adc';
    default: return 'bg-uradi-text-tertiary';
  }
};

const columns: ColumnDef<Voter>[] = [
  {
    accessorKey: 'full_name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-uradi-bg-tertiary flex items-center justify-center text-uradi-text-secondary font-medium text-sm">
          {row.original.full_name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="font-medium text-uradi-text-primary">{row.original.full_name}</p>
          <p className="text-xs text-uradi-text-tertiary">{row.original.phone}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'lga',
    header: 'Location',
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-uradi-text-secondary">
        <MapPin className="h-3.5 w-3.5" />
        <span>{row.original.lga}, {row.original.ward}</span>
      </div>
    ),
  },
  {
    accessorKey: 'sentiment_score',
    header: 'Sentiment',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
          <div
            className={`h-full ${getSentimentColor(row.original.sentiment_score)}`}
            style={{ width: `${row.original.sentiment_score}%` }}
          />
        </div>
        <span className="text-sm font-mono text-uradi-text-primary w-8">
          {row.original.sentiment_score}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'persuadability_score',
    header: 'Persuadable',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-uradi-gold"
            style={{ width: `${row.original.persuadability_score}%` }}
          />
        </div>
        <span className="text-sm font-mono text-uradi-text-primary w-8">
          {row.original.persuadability_score}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'party_leaning',
    header: 'Party',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${getPartyColor(row.original.party_leaning)}`} />
        <Badge variant="secondary" className="text-xs">
          {row.original.party_leaning}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'last_contacted',
    header: 'Last Contact',
    cell: ({ row }) => (
      <span className="text-uradi-text-secondary text-sm">{row.original.last_contacted}</span>
    ),
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.original.source}
      </Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export default function VotersPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLGA, setSelectedLGA] = useState('all');
  const [selectedParty, setSelectedParty] = useState('all');

  const table = useReactTable({
    data: mockVoters,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Voter CRM</h1>
          <p className="text-uradi-text-secondary mt-1">
            Manage and engage with {mockVoters.length.toLocaleString()} registered voters
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Voter
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[500px] bg-uradi-bg-secondary border-uradi-border">
              <SheetHeader>
                <SheetTitle className="text-uradi-text-primary">Add New Voter</SheetTitle>
              </SheetHeader>
              <AddVoterForm />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Voters"
          value="142,387"
          change="+2,456"
          icon={Users}
          color="uradi-status-info"
        />
        <StatCard
          title="Avg Sentiment"
          value="+68"
          change="+4.2%"
          icon={Heart}
          color="uradi-status-positive"
        />
        <StatCard
          title="High Persuadable"
          value="24,521"
          change="18%"
          icon={Filter}
          color="uradi-gold"
        />
        <StatCard
          title="Contacted Today"
          value="1,234"
          change="+89"
          icon={Phone}
          color="uradi-status-neutral"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-uradi-bg-secondary border border-uradi-border rounded-xl">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-uradi-text-tertiary" />
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        <Select value={selectedLGA} onValueChange={setSelectedLGA}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by LGA" />
          </SelectTrigger>
          <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
            <SelectItem value="all">All LGAs</SelectItem>
            <SelectItem value="dutse">Dutse</SelectItem>
            <SelectItem value="hadejia">Hadejia</SelectItem>
            <SelectItem value="birnin-kudu">Birnin Kudu</SelectItem>
            <SelectItem value="gumel">Gumel</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedParty} onValueChange={setSelectedParty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Party" />
          </SelectTrigger>
          <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
            <SelectItem value="all">All Parties</SelectItem>
            <SelectItem value="pdp">PDP</SelectItem>
            <SelectItem value="apc">APC</SelectItem>
            <SelectItem value="nnpp">NNPP</SelectItem>
            <SelectItem value="adc">ADC</SelectItem>
            <SelectItem value="undecided">Undecided</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Mail className="h-4 w-4" />
            Send SMS
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Tag className="h-4 w-4" />
            Add Tag
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-uradi-border hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-uradi-border cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-uradi-text-secondary">
                  No voters found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-uradi-border">
          <div className="text-sm text-uradi-text-secondary">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              mockVoters.length
            )}{' '}
            of {mockVoters.length} voters
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-uradi-text-secondary">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
}) {
  const colorClasses: Record<string, { text: string; bg: string }> = {
    'uradi-status-info': { text: 'text-uradi-status-info', bg: 'bg-uradi-status-info/10' },
    'uradi-status-positive': { text: 'text-uradi-status-positive', bg: 'bg-uradi-status-positive/10' },
    'uradi-status-critical': { text: 'text-uradi-status-critical', bg: 'bg-uradi-status-critical/10' },
    'uradi-status-warning': { text: 'text-uradi-status-warning', bg: 'bg-uradi-status-warning/10' },
    'uradi-gold': { text: 'text-uradi-gold', bg: 'bg-uradi-gold/10' },
    'uradi-status-neutral': { text: 'text-uradi-status-neutral', bg: 'bg-uradi-status-neutral/10' },
    'uradi-party-pdp': { text: 'text-uradi-party-pdp', bg: 'bg-uradi-party-pdp/10' },
    'uradi-party-apc': { text: 'text-uradi-party-apc', bg: 'bg-uradi-party-apc/10' },
    'uradi-party-nnpp': { text: 'text-uradi-party-nnpp', bg: 'bg-uradi-party-nnpp/10' },
  };
  const colors = colorClasses[color] || colorClasses['uradi-status-info'];

  return (
    <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-uradi-text-secondary text-sm">{title}</p>
          <p className="text-2xl font-bold text-uradi-text-primary font-mono mt-1">{value}</p>
          <p className={`text-sm mt-1 ${colors.text}`}>{change}</p>
        </div>
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
}

function AddVoterForm() {
  return (
    <form className="space-y-4 mt-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Full Name *</label>
          <Input placeholder="Enter full name" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Phone Number *</label>
          <Input placeholder="+234..." />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">LGA</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select LGA" />
            </SelectTrigger>
            <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
              <SelectItem value="dutse">Dutse</SelectItem>
              <SelectItem value="hadejia">Hadejia</SelectItem>
              <SelectItem value="birnin-kudu">Birnin Kudu</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Ward</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Ward" />
            </SelectTrigger>
            <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
              <SelectItem value="ward1">Ward 1</SelectItem>
              <SelectItem value="ward2">Ward 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Party Leaning</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select party" />
            </SelectTrigger>
            <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
              <SelectItem value="pdp">PDP</SelectItem>
              <SelectItem value="apc">APC</SelectItem>
              <SelectItem value="nnpp">NNPP</SelectItem>
              <SelectItem value="adc">ADC</SelectItem>
              <SelectItem value="undecided">Undecided</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Source</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
              <SelectItem value="canvass">Canvass</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="ussd">USSD</SelectItem>
              <SelectItem value="rally">Rally</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Notes</label>
        <textarea
          className="w-full min-h-[100px] rounded-lg border border-uradi-border bg-uradi-bg-primary px-3 py-2 text-sm text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50 focus:border-uradi-gold"
          placeholder="Additional notes about this voter..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Add Voter</Button>
      </div>
    </form>
  );
}
