'use client';

import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  MoreHorizontal,
  Filter,
  Download,
  PieChart,
  BarChart3,
  FileText,
  Calendar,
  ChevronRight,
  Wallet,
  Receipt,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface BudgetItem {
  id: string;
  category: string;
  item: string;
  allocated: number;
  spent: number;
  remaining: number;
  status: 'on_track' | 'at_risk' | 'overspent' | 'pending';
  last_updated: string;
}

const mockBudget: BudgetItem[] = [
  {
    id: '1',
    category: 'Media & Advertising',
    item: 'TV & Radio Campaigns',
    allocated: 15000000,
    spent: 12800000,
    remaining: 2200000,
    status: 'on_track',
    last_updated: '2 days ago',
  },
  {
    id: '2',
    category: 'Media & Advertising',
    item: 'Social Media & Digital',
    allocated: 8000000,
    spent: 7200000,
    remaining: 800000,
    status: 'at_risk',
    last_updated: '1 day ago',
  },
  {
    id: '3',
    category: 'Field Operations',
    item: 'Rallies & Events',
    allocated: 25000000,
    spent: 18900000,
    remaining: 6100000,
    status: 'on_track',
    last_updated: '3 days ago',
  },
  {
    id: '4',
    category: 'Field Operations',
    item: 'Transportation & Logistics',
    allocated: 12000000,
    spent: 13500000,
    remaining: -1500000,
    status: 'overspent',
    last_updated: '1 day ago',
  },
  {
    id: '5',
    category: 'Personnel',
    item: 'Staff Salaries & Allowances',
    allocated: 20000000,
    spent: 15000000,
    remaining: 5000000,
    status: 'on_track',
    last_updated: '1 week ago',
  },
  {
    id: '6',
    category: 'Materials',
    item: 'Campaign Materials',
    allocated: 10000000,
    spent: 4200000,
    remaining: 5800000,
    status: 'on_track',
    last_updated: '5 days ago',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'on_track':
      return <Badge variant="success">On Track</Badge>;
    case 'at_risk':
      return <Badge variant="warning">At Risk</Badge>;
    case 'overspent':
      return <Badge variant="destructive">Overspent</Badge>;
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatCurrency = (amount: number) => {
  return `₦${(amount / 1000000).toFixed(1)}M`;
};

export default function BudgetPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const totalAllocated = mockBudget.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = mockBudget.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const burnRate = (totalSpent / totalAllocated) * 100;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Budget Tracker</h1>
          <p className="text-uradi-text-secondary mt-1">
            Monitor campaign spending and financial performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-uradi-bg-secondary border-uradi-border">
              <DialogHeader>
                <DialogTitle className="text-uradi-text-primary">Add New Expense</DialogTitle>
              </DialogHeader>
              <ExpenseForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Budget"
          value={formatCurrency(totalAllocated)}
          change="Allocated"
          icon={Wallet}
          color="uradi-status-info"
        />
        <StatCard
          title="Spent"
          value={formatCurrency(totalSpent)}
          change={`${burnRate.toFixed(1)}% used`}
          icon={Receipt}
          color="uradi-status-warning"
        />
        <StatCard
          title="Remaining"
          value={formatCurrency(totalRemaining)}
          change={`${(100 - burnRate).toFixed(1)}% left`}
          icon={DollarSign}
          color="uradi-status-positive"
        />
        <StatCard
          title="Burn Rate"
          value={`${burnRate.toFixed(1)}%`}
          change="Monthly"
          icon={TrendingUp}
          color="uradi-gold"
        />
        <StatCard
          title="At Risk"
          value="2"
          change="Categories"
          icon={AlertCircle}
          color="uradi-status-critical"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-uradi-bg-secondary border border-uradi-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Budget by Category</CardTitle>
                <CardDescription>Spending breakdown by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { category: 'Field Operations', allocated: 37000000, spent: 32400000 },
                  { category: 'Media & Advertising', allocated: 23000000, spent: 20000000 },
                  { category: 'Personnel', allocated: 20000000, spent: 15000000 },
                  { category: 'Materials', allocated: 10000000, spent: 4200000 },
                ].map((cat) => {
                  const percentage = (cat.spent / cat.allocated) * 100;
                  return (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-uradi-text-primary">{cat.category}</span>
                        <span className="text-sm font-mono text-uradi-text-secondary">
                          {formatCurrency(cat.spent)} / {formatCurrency(cat.allocated)}
                        </span>
                      </div>
                      <div className="h-3 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            percentage > 90 ? 'bg-uradi-status-critical' : percentage > 75 ? 'bg-uradi-status-warning' : 'bg-uradi-status-positive'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-uradi-text-tertiary">{percentage.toFixed(1)}% used</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Recent Alerts</CardTitle>
                <CardDescription>Budget items requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockBudget
                  .filter((item) => item.status === 'at_risk' || item.status === 'overspent')
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border ${
                        item.status === 'overspent'
                          ? 'bg-uradi-status-critical/10 border-uradi-status-critical/30'
                          : 'bg-uradi-status-warning/10 border-uradi-status-warning/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-uradi-text-primary">{item.item}</p>
                          <p className="text-xs text-uradi-text-secondary">{item.category}</p>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-uradi-text-tertiary">
                          {formatCurrency(item.spent)} of {formatCurrency(item.allocated)}
                        </span>
                        <span
                          className={`font-mono ${
                            item.remaining < 0 ? 'text-uradi-status-critical' : 'text-uradi-text-secondary'
                          }`}
                        >
                          {item.remaining < 0 ? '-' : ''}
                          {formatCurrency(Math.abs(item.remaining))} {item.remaining < 0 ? 'over' : 'left'}
                        </span>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-uradi-bg-secondary border border-uradi-border rounded-xl">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Filter className="h-4 w-4 text-uradi-text-tertiary" />
              <Input placeholder="Search budget items..." className="flex-1" />
            </div>

            <Select>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="media">Media & Advertising</SelectItem>
                <SelectItem value="field">Field Operations</SelectItem>
                <SelectItem value="personnel">Personnel</SelectItem>
                <SelectItem value="materials">Materials</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="on_track">On Track</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="overspent">Overspent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-uradi-border hover:bg-transparent">
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Allocated</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBudget.map((item) => {
                  const percentage = (item.spent / item.allocated) * 100;
                  return (
                    <TableRow key={item.id} className="border-uradi-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-uradi-gold/10 flex items-center justify-center">
                            <Receipt className="h-4 w-4 text-uradi-gold" />
                          </div>
                          <span className="font-medium text-uradi-text-primary">{item.item}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-uradi-text-secondary">{item.category}</TableCell>
                      <TableCell className="font-mono text-uradi-text-primary">
                        {formatCurrency(item.allocated)}
                      </TableCell>
                      <TableCell className="font-mono text-uradi-text-primary">
                        {formatCurrency(item.spent)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-mono ${
                            item.remaining < 0 ? 'text-uradi-status-critical' : 'text-uradi-text-primary'
                          }`}
                        >
                          {item.remaining < 0 ? '-' : ''}
                          {formatCurrency(Math.abs(item.remaining))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                percentage > 100
                                  ? 'bg-uradi-status-critical'
                                  : percentage > 80
                                    ? 'bg-uradi-status-warning'
                                    : 'bg-uradi-status-positive'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono text-uradi-text-secondary">{percentage.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="bg-uradi-bg-secondary border-uradi-border">
            <CardHeader>
              <CardTitle className="text-uradi-text-primary">Recent Transactions</CardTitle>
              <CardDescription>Latest expenses and payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { date: '2026-03-15', description: 'Radio campaign payment - Dutse', amount: 2500000, category: 'Media' },
                { date: '2026-03-14', description: 'Rally venue rental - Hadejia', amount: 1500000, category: 'Field Ops' },
                { date: '2026-03-14', description: 'Campaign materials printing', amount: 800000, category: 'Materials' },
                { date: '2026-03-13', description: 'Staff salaries - March', amount: 5000000, category: 'Personnel' },
                { date: '2026-03-12', description: 'Social media ads', amount: 1200000, category: 'Media' },
                { date: '2026-03-11', description: 'Transportation - Rally day', amount: 600000, category: 'Field Ops' },
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-uradi-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-uradi-bg-tertiary flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-uradi-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-uradi-text-primary">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-uradi-text-secondary">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs">{tx.category}</Badge>
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-uradi-text-primary">-₦{tx.amount.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Budget Projection</CardTitle>
                <CardDescription>Estimated completion by election day</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-uradi-bg-tertiary rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-uradi-text-secondary">Projected Total Spend</span>
                    <span className="text-2xl font-bold text-uradi-text-primary font-mono">
                      {formatCurrency(totalAllocated * 0.95)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-uradi-text-secondary">Current Trajectory</span>
                    <Badge variant="warning">On Track</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { month: 'January', projected: 15000000, actual: 12000000 },
                    { month: 'February', projected: 25000000, actual: 28000000 },
                    { month: 'March', projected: 35000000, actual: 31600000 },
                    { month: 'April (Est.)', projected: 25000000, actual: null },
                    { month: 'May (Est.)', projected: 15000000, actual: null },
                  ].map((month) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-uradi-text-primary">{month.month}</span>
                        <span className="text-sm font-mono text-uradi-text-secondary">
                          {formatCurrency(month.actual || month.projected)}
                        </span>
                      </div>
                      <div className="h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${month.actual ? 'bg-uradi-gold' : 'bg-uradi-text-tertiary'}`}
                          style={{ width: `${(month.projected / 35000000) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Cost Per Vote Analysis</CardTitle>
                <CardDescription>Efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { metric: 'Total Spent to Date', value: formatCurrency(totalSpent) },
                  { metric: 'Projected Total', value: formatCurrency(totalAllocated * 0.95) },
                  { metric: 'Registered Voters', value: '2.4M' },
                  { metric: 'Target Turnout', value: '45%' },
                  { metric: 'Est. Votes', value: '1.08M' },
                  { metric: 'Cost Per Vote', value: `₦${((totalAllocated * 0.95) / 1080000).toFixed(0)}` },
                ].map((item) => (
                  <div key={item.metric} className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                    <span className="text-sm text-uradi-text-secondary">{item.metric}</span>
                    <span className="font-mono text-uradi-text-primary">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ExpenseForm() {
  return (
    <div className="space-y-6 mt-4">
      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Expense Description</label>
        <Input placeholder="e.g., Radio campaign payment" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Category</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
              <SelectItem value="media">Media & Advertising</SelectItem>
              <SelectItem value="field">Field Operations</SelectItem>
              <SelectItem value="personnel">Personnel</SelectItem>
              <SelectItem value="materials">Materials</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Amount (₦)</label>
          <Input type="number" placeholder="0.00" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Date</label>
          <Input type="date" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Payment Method</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
              <SelectItem value="transfer">Bank Transfer</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="mobile">Mobile Money</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Notes</label>
        <textarea
          className="w-full min-h-[80px] rounded-lg border border-uradi-border bg-uradi-bg-primary px-3 py-2 text-sm text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50 focus:border-uradi-gold"
          placeholder="Additional details..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
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
