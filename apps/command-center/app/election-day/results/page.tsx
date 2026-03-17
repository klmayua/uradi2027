'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Filter,
  ChevronRight,
  Trophy,
  Percent,
  Vote,
} from 'lucide-react';
import { Map, LGABoundaryLayer } from '@/components/Map';
import type mapboxgl from 'mapbox-gl';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LGAResult {
  id: string;
  name: string;
  total_pus: number;
  reporting_pus: number;
  turnout: number;
  votes: {
    pdp: number;
    apc: number;
    nnpp: number;
    others: number;
  };
  leading: string;
  margin: number;
  status: 'reporting' | 'complete' | 'pending';
}

const mockResults: LGAResult[] = [
  {
    id: '1',
    name: 'Dutse',
    total_pus: 245,
    reporting_pus: 198,
    turnout: 42.3,
    votes: { pdp: 45230, apc: 28900, nnpp: 12340, others: 4530 },
    leading: 'PDP',
    margin: 16330,
    status: 'reporting',
  },
  {
    id: '2',
    name: 'Hadejia',
    total_pus: 189,
    reporting_pus: 189,
    turnout: 38.7,
    votes: { pdp: 32100, apc: 28400, nnpp: 8900, others: 3200 },
    leading: 'PDP',
    margin: 3700,
    status: 'complete',
  },
  {
    id: '3',
    name: 'Gumel',
    total_pus: 156,
    reporting_pus: 134,
    turnout: 41.2,
    votes: { pdp: 28900, apc: 31200, nnpp: 5600, others: 2100 },
    leading: 'APC',
    margin: 2300,
    status: 'reporting',
  },
  {
    id: '4',
    name: 'Kazaure',
    total_pus: 134,
    reporting_pus: 0,
    turnout: 0,
    votes: { pdp: 0, apc: 0, nnpp: 0, others: 0 },
    leading: '-',
    margin: 0,
    status: 'pending',
  },
  {
    id: '5',
    name: 'Birnin Kudu',
    total_pus: 178,
    reporting_pus: 156,
    turnout: 39.8,
    votes: { pdp: 28900, apc: 23400, nnpp: 11200, others: 3400 },
    leading: 'PDP',
    margin: 5500,
    status: 'reporting',
  },
];

const getPartyColor = (party: string) => {
  switch (party) {
    case 'PDP':
      return 'bg-uradi-party-pdp';
    case 'APC':
      return 'bg-uradi-party-apc';
    case 'NNPP':
      return 'bg-uradi-party-nnpp';
    default:
      return 'bg-uradi-text-tertiary';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'complete':
      return <Badge variant="success">Complete</Badge>;
    case 'reporting':
      return <Badge className="bg-uradi-gold/20 text-uradi-gold animate-pulse">Reporting</Badge>;
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const totalVotes = mockResults.reduce((sum, lga) =>
    sum + lga.votes.pdp + lga.votes.apc + lga.votes.nnpp + lga.votes.others, 0
  );

  const totalPDP = mockResults.reduce((sum, lga) => sum + lga.votes.pdp, 0);
  const totalAPC = mockResults.reduce((sum, lga) => sum + lga.votes.apc, 0);
  const totalNNPP = mockResults.reduce((sum, lga) => sum + lga.votes.nnpp, 0);
  const totalOthers = mockResults.reduce((sum, lga) => sum + lga.votes.others, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Election Results</h1>
          <p className="text-uradi-text-secondary mt-1">
            Real-time results tracking and analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Results
          </Button>
          <Badge variant="success" className="animate-pulse gap-1">
            <Clock className="h-3 w-3" />
            Live Updates
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Votes"
          value={totalVotes.toLocaleString()}
          change="Counting"
          icon={Vote}
          color="uradi-status-info"
        />
        <StatCard
          title="Reporting"
          value="78%"
          change="198/254 LGAs"
          icon={CheckCircle}
          color="uradi-status-positive"
        />
        <StatCard
          title="Turnout"
          value="40.2%"
          change="+2.1% vs 2023"
          icon={Users}
          color="uradi-gold"
        />
        <StatCard
          title="Leading"
          value="PDP"
          change="+45,230 votes"
          icon={Trophy}
          color="uradi-party-pdp"
        />
        <StatCard
          title="Margin"
          value="8.4%"
          change="+12,450 votes"
          icon={Percent}
          color="uradi-status-neutral"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-uradi-bg-secondary border border-uradi-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="map">Results Map</TabsTrigger>
          <TabsTrigger value="by-lga">By LGA</TabsTrigger>
          <TabsTrigger value="by-ward">By Ward</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Vote Distribution</CardTitle>
                <CardDescription>Current vote count by party</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center py-8">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#1F2937"
                        strokeWidth="20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#DC2626"
                        strokeWidth="20"
                        strokeDasharray={`${(totalPDP / totalVotes) * 251.2} 251.2`}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#1E40AF"
                        strokeWidth="20"
                        strokeDasharray={`${(totalAPC / totalVotes) * 251.2} 251.2`}
                        strokeDashoffset={-(totalPDP / totalVotes) * 251.2}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#7C3AED"
                        strokeWidth="20"
                        strokeDasharray={`${(totalNNPP / totalVotes) * 251.2} 251.2`}
                        strokeDashoffset={-((totalPDP + totalAPC) / totalVotes) * 251.2}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-uradi-text-primary font-mono">
                          {((totalPDP / totalVotes) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-uradi-text-secondary">PDP Lead</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { party: 'PDP', votes: totalPDP, color: 'bg-uradi-party-pdp' },
                    { party: 'APC', votes: totalAPC, color: 'bg-uradi-party-apc' },
                    { party: 'NNPP', votes: totalNNPP, color: 'bg-uradi-party-nnpp' },
                    { party: 'Others', votes: totalOthers, color: 'bg-uradi-text-tertiary' },
                  ].map((item) => (
                    <div key={item.party} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm text-uradi-text-primary">{item.party}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono text-uradi-text-primary">
                          {item.votes.toLocaleString()}
                        </span>
                        <span className="text-xs text-uradi-text-tertiary ml-2">
                          ({((item.votes / totalVotes) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Key Metrics</CardTitle>
                <CardDescription>Important election statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Total Registered Voters', value: '2,456,789', change: '+12% vs 2023' },
                  { label: 'Votes Cast', value: totalVotes.toLocaleString(), change: 'Counting' },
                  { label: 'Rejected Ballots', value: '12,456', change: '2.1% of votes' },
                  { label: 'Polling Units Reporting', value: '198/254', change: '78%' },
                  { label: 'LGAs Complete', value: '1/27', change: 'Hadejia' },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                    <div>
                      <p className="text-sm text-uradi-text-secondary">{metric.label}</p>
                      <p className="text-xs text-uradi-text-tertiary">{metric.change}</p>
                    </div>
                    <p className="text-lg font-bold text-uradi-text-primary font-mono">{metric.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map">
          <ResultsMapView results={mockResults} />
        </TabsContent>

        <TabsContent value="by-lga" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-uradi-bg-secondary border border-uradi-border rounded-xl">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Filter className="h-4 w-4 text-uradi-text-tertiary" />
              <Input placeholder="Search LGAs..." className="flex-1" />
            </div>

            <select className="bg-uradi-bg-primary border border-uradi-border rounded-lg px-3 py-2 text-sm text-uradi-text-primary">
              <option value="all">All Status</option>
              <option value="complete">Complete</option>
              <option value="reporting">Reporting</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-uradi-border hover:bg-transparent">
                  <TableHead>LGA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reporting</TableHead>
                  <TableHead>Turnout</TableHead>
                  <TableHead>PDP</TableHead>
                  <TableHead>APC</TableHead>
                  <TableHead>NNPP</TableHead>
                  <TableHead>Leading</TableHead>
                  <TableHead>Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockResults.map((lga) => {
                  const total = lga.votes.pdp + lga.votes.apc + lga.votes.nnpp + lga.votes.others;
                  return (
                    <TableRow key={lga.id} className="border-uradi-border">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-uradi-gold" />
                          <span className="font-medium text-uradi-text-primary">{lga.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(lga.status)}</TableCell>
                      <TableCell className="font-mono text-uradi-text-primary">
                        {lga.reporting_pus}/{lga.total_pus}
                      </TableCell>
                      <TableCell className="font-mono text-uradi-text-secondary">
                        {lga.turnout > 0 ? `${lga.turnout}%` : '-'}
                      </TableCell>
                      <TableCell>
                        {total > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-uradi-text-primary">
                              {lga.votes.pdp.toLocaleString()}
                            </span>
                            <span className="text-xs text-uradi-text-tertiary">
                              ({((lga.votes.pdp / total) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {total > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-uradi-text-primary">
                              {lga.votes.apc.toLocaleString()}
                            </span>
                            <span className="text-xs text-uradi-text-tertiary">
                              ({((lga.votes.apc / total) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {total > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-uradi-text-primary">
                              {lga.votes.nnpp.toLocaleString()}
                            </span>
                            <span className="text-xs text-uradi-text-tertiary">
                              ({((lga.votes.nnpp / total) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {lga.leading !== '-' ? (
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${getPartyColor(lga.leading)}`} />
                            <span className="font-medium text-uradi-text-primary">{lga.leading}</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-uradi-text-secondary">
                        {lga.margin > 0 ? lga.margin.toLocaleString() : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="by-ward">
          <Card className="bg-uradi-bg-secondary border-uradi-border">
            <CardContent className="p-8 text-center">
              <MapPin className="h-16 w-16 text-uradi-gold mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-uradi-text-primary">Ward-Level Results</h3>
              <p className="text-uradi-text-secondary mt-2">
                Detailed results by ward will be available once counting is complete
              </p>
              <Button className="mt-4">Load Ward Data</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="bg-uradi-bg-secondary border-uradi-border">
            <CardHeader>
              <CardTitle className="text-uradi-text-primary">Vote Trends</CardTitle>
              <CardDescription>How results have evolved over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { time: '10:00', pdp: 12500, apc: 8900, nnpp: 3400 },
                  { time: '12:00', pdp: 28900, apc: 21200, nnpp: 7800 },
                  { time: '14:00', pdp: 52300, apc: 38900, nnpp: 14500 },
                  { time: '16:00', pdp: 78900, apc: 52300, nnpp: 19800 },
                  { time: '18:00', pdp: 106200, apc: 83500, nnpp: 26840 },
                ].map((point, i, arr) => {
                  const prev = i > 0 ? arr[i - 1] : null;
                  const pdpChange = prev ? ((point.pdp - prev.pdp) / prev.pdp * 100).toFixed(1) : '0';

                  return (
                    <div key={point.time} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-uradi-text-primary">{point.time}</span>
                        <span className="text-xs text-uradi-status-positive">+{pdpChange}% PDP</span>
                      </div>
                      <div className="h-8 bg-uradi-bg-tertiary rounded-lg overflow-hidden flex">
                        <div
                          className="h-full bg-uradi-party-pdp flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${(point.pdp / (point.pdp + point.apc + point.nnpp)) * 100}%` }}
                        >
                          {((point.pdp / (point.pdp + point.apc + point.nnpp)) * 100).toFixed(0)}%
                        </div>
                        <div
                          className="h-full bg-uradi-party-apc flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${(point.apc / (point.pdp + point.apc + point.nnpp)) * 100}%` }}
                        >
                          {((point.apc / (point.pdp + point.apc + point.nnpp)) * 100).toFixed(0)}%
                        </div>
                        <div
                          className="h-full bg-uradi-party-nnpp flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${(point.nnpp / (point.pdp + point.apc + point.nnpp)) * 100}%` }}
                        >
                          {((point.nnpp / (point.pdp + point.apc + point.nnpp)) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResultsMapView({ results }: { results: LGAResult[] }) {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<LGAResult | null>(null);

  // LGA data with coordinates and results
  const lgaData = results.map((lga) => ({
    id: lga.id,
    name: lga.name,
    coordinates: getLGACoordinates(lga.name),
    metrics: {
      leading: lga.leading,
      margin: lga.margin,
      turnout: lga.turnout,
      reporting: (lga.reporting_pus / lga.total_pus) * 100,
      pdpShare: lga.votes.pdp > 0
        ? (lga.votes.pdp / (lga.votes.pdp + lga.votes.apc + lga.votes.nnpp + lga.votes.others)) * 100
        : 0,
      apcShare: lga.votes.apc > 0
        ? (lga.votes.apc / (lga.votes.pdp + lga.votes.apc + lga.votes.nnpp + lga.votes.others)) * 100
        : 0,
    },
  }));

  const handleMapLoad = useCallback((mapInstance: mapboxgl.Map) => {
    setMap(mapInstance);
  }, []);

  const handleLGAClick = useCallback((lga: { id: string; name: string }) => {
    const lgaResult = results.find((r) => r.id === lga.id || r.name === lga.name);
    setSelectedLGA(lgaResult || null);
  }, [results]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
          <Map
            center={[9.5, 12.5]}
            zoom={8}
            className="h-[500px]"
            onLoad={handleMapLoad}
          >
            {map && (
              <ResultsBoundaryLayer
                map={map}
                lgaData={lgaData}
                onLGAClick={handleLGAClick}
              />
            )}
          </Map>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="bg-uradi-bg-secondary border-uradi-border">
          <CardHeader>
            <CardTitle className="text-uradi-text-primary">LGA Results</CardTitle>
            <CardDescription>
              {selectedLGA ? selectedLGA.name : 'Select an LGA on the map'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLGA ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                  <span className="text-sm text-uradi-text-secondary">Status</span>
                  {getStatusBadge(selectedLGA.status)}
                </div>
                <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                  <span className="text-sm text-uradi-text-secondary">Leading</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getPartyColor(selectedLGA.leading)}`} />
                    <span className="font-medium text-uradi-text-primary">{selectedLGA.leading}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                  <span className="text-sm text-uradi-text-secondary">Margin</span>
                  <span className="text-uradi-text-primary font-mono">{selectedLGA.margin.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                  <span className="text-sm text-uradi-text-secondary">Turnout</span>
                  <span className="text-uradi-text-primary font-mono">{selectedLGA.turnout}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                  <span className="text-sm text-uradi-text-secondary">Reporting</span>
                  <span className="text-uradi-text-primary font-mono">{selectedLGA.reporting_pus}/{selectedLGA.total_pus}</span>
                </div>

                {selectedLGA.status !== 'pending' && (
                  <div className="space-y-2 pt-2">
                    <p className="text-sm text-uradi-text-secondary">Vote Distribution</p>
                    <div className="h-4 bg-uradi-bg-tertiary rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-uradi-party-pdp"
                        style={{
                          width: `${(selectedLGA.votes.pdp /
                            (selectedLGA.votes.pdp + selectedLGA.votes.apc + selectedLGA.votes.nnpp + selectedLGA.votes.others)) * 100}%`
                        }}
                      />
                      <div
                        className="h-full bg-uradi-party-apc"
                        style={{
                          width: `${(selectedLGA.votes.apc /
                            (selectedLGA.votes.pdp + selectedLGA.votes.apc + selectedLGA.votes.nnpp + selectedLGA.votes.others)) * 100}%`
                        }}
                      />
                      <div
                        className="h-full bg-uradi-party-nnpp"
                        style={{
                          width: `${(selectedLGA.votes.nnpp /
                            (selectedLGA.votes.pdp + selectedLGA.votes.apc + selectedLGA.votes.nnpp + selectedLGA.votes.others)) * 100}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-uradi-text-tertiary">
                      <span>PDP: {selectedLGA.votes.pdp.toLocaleString()}</span>
                      <span>APC: {selectedLGA.votes.apc.toLocaleString()}</span>
                      <span>NNPP: {selectedLGA.votes.nnpp.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-uradi-text-tertiary mx-auto mb-3" />
                <p className="text-sm text-uradi-text-secondary">
                  Click on an LGA to view detailed election results
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-uradi-bg-secondary border-uradi-border">
          <CardHeader>
            <CardTitle className="text-uradi-text-primary">Map Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-uradi-text-secondary mb-2">Leading Party</p>
            {[
              { color: 'bg-uradi-party-pdp', label: 'PDP Leading' },
              { color: 'bg-uradi-party-apc', label: 'APC Leading' },
              { color: 'bg-uradi-party-nnpp', label: 'NNPP Leading' },
              { color: 'bg-uradi-text-tertiary', label: 'No Results Yet' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${item.color}`} />
                <span className="text-sm text-uradi-text-secondary">{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to get LGA coordinates
function getLGACoordinates(name: string): number[][][] {
  const coordinates: Record<string, number[][][]> = {
    'Dutse': [[[9.0, 12.0], [9.5, 12.0], [9.5, 12.5], [9.0, 12.5], [9.0, 12.0]]],
    'Hadejia': [[[10.0, 12.5], [10.5, 12.5], [10.5, 13.0], [10.0, 13.0], [10.0, 12.5]]],
    'Gumel': [[[9.5, 12.5], [10.0, 12.5], [10.0, 13.0], [9.5, 13.0], [9.5, 12.5]]],
    'Kazaure': [[[8.5, 12.5], [9.0, 12.5], [9.0, 13.0], [8.5, 13.0], [8.5, 12.5]]],
    'Birnin Kudu': [[[9.0, 11.5], [9.5, 11.5], [9.5, 12.0], [9.0, 12.0], [9.0, 11.5]]],
  };
  return coordinates[name] || [[[9.0, 12.0], [9.5, 12.0], [9.5, 12.5], [9.0, 12.5], [9.0, 12.0]]];
}

// Results boundary layer with party colors
interface ResultsBoundaryLayerProps {
  map: mapboxgl.Map;
  lgaData: Array<{
    id: string;
    name: string;
    coordinates: number[][][];
    metrics: {
      leading: string;
      margin: number;
      turnout: number;
      reporting: number;
      pdpShare: number;
      apcShare: number;
    };
  }>;
  onLGAClick?: (lga: { id: string; name: string }) => void;
}

function ResultsBoundaryLayer({ map, lgaData, onLGAClick }: ResultsBoundaryLayerProps) {
  useEffect(() => {
    if (!map) return;

    // Convert LGA data to GeoJSON
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: lgaData.map((lga) => ({
        type: 'Feature',
        properties: {
          id: lga.id,
          name: lga.name,
          ...lga.metrics,
        },
        geometry: {
          type: 'Polygon',
          coordinates: lga.coordinates,
        },
      })),
    };

    // Add source
    if (!map.getSource('results-lgas')) {
      map.addSource('results-lgas', {
        type: 'geojson',
        data: geojson,
      });
    } else {
      (map.getSource('results-lgas') as mapboxgl.GeoJSONSource).setData(geojson);
    }

    // Add fill layer with party colors
    if (!map.getLayer('results-lga-fills')) {
      map.addLayer({
        id: 'results-lga-fills',
        type: 'fill',
        source: 'results-lgas',
        paint: {
          'fill-color': [
            'match',
            ['get', 'leading'],
            'PDP', '#DC2626', // Red for PDP
            'APC', '#1E40AF', // Blue for APC
            'NNPP', '#7C3AED', // Purple for NNPP
            '#6B7280', // Gray for no results
          ],
          'fill-opacity': 0.7,
        },
      });
    }

    // Add border layer
    if (!map.getLayer('results-lga-borders')) {
      map.addLayer({
        id: 'results-lga-borders',
        type: 'line',
        source: 'results-lgas',
        paint: {
          'line-color': '#374151',
          'line-width': 1,
        },
      });
    }

    // Add labels
    if (!map.getLayer('results-lga-labels')) {
      map.addLayer({
        id: 'results-lga-labels',
        type: 'symbol',
        source: 'results-lgas',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#F9FAFB',
          'text-halo-color': '#0B1120',
          'text-halo-width': 2,
        },
      });
    }

    // Click handler
    const handleClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (e.features?.[0]) {
        const feature = e.features[0];
        onLGAClick?.({
          id: feature.properties?.id,
          name: feature.properties?.name,
        });
      }
    };

    map.on('click', 'results-lga-fills', handleClick);

    // Hover effects
    map.on('mouseenter', 'results-lga-fills', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'results-lga-fills', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      map.off('click', 'results-lga-fills', handleClick);
      if (map.getLayer('results-lga-fills')) map.removeLayer('results-lga-fills');
      if (map.getLayer('results-lga-borders')) map.removeLayer('results-lga-borders');
      if (map.getLayer('results-lga-labels')) map.removeLayer('results-lga-labels');
      if (map.getSource('results-lgas')) map.removeSource('results-lgas');
    };
  }, [map, lgaData, onLGAClick]);

  return null;
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
