'use client';

import { useState, useCallback } from 'react';
import {
  Network,
  Users,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
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

interface PoliticalActor {
  id: string;
  name: string;
  title: string;
  party: string;
  lga: string;
  influence_type: string;
  influence_level: number;
  loyalty: 'strong' | 'leaning' | 'neutral' | 'opposed';
  faction: string;
  last_assessed: string;
}

const mockActors: PoliticalActor[] = [
  { id: '1', name: 'Alhaji Musa Danladi', title: 'Commissioner for Works', party: 'PDP', lga: 'Dutse', influence_type: 'Government', influence_level: 9, loyalty: 'strong', faction: 'Mainstream', last_assessed: '2 days ago' },
  { id: '2', name: 'Dr. Amina Hassan', title: 'Former Senator', party: 'PDP', lga: 'Hadejia', influence_type: 'Political', influence_level: 8, loyalty: 'strong', faction: 'Reform', last_assessed: '1 week ago' },
  { id: '3', name: 'Alhaji Abubakar Umar', title: 'Business Mogul', party: 'APC', lga: 'Gumel', influence_type: 'Economic', influence_level: 9, loyalty: 'opposed', faction: 'Legacy', last_assessed: '3 days ago' },
  { id: '4', name: 'Malam Ibrahim Sule', title: 'Religious Leader', party: 'NNPP', lga: 'Birnin Kudu', influence_type: 'Religious', influence_level: 7, loyalty: 'neutral', faction: 'Independent', last_assessed: '5 days ago' },
  { id: '5', name: 'Hajiya Fatima Abdullahi', title: 'Women Leader', party: 'PDP', lga: 'Kazaure', influence_type: 'Social', influence_level: 6, loyalty: 'leaning', faction: 'Mainstream', last_assessed: '1 week ago' },
];

const getPartyColor = (party: string) => {
  switch (party) {
    case 'APC': return 'bg-uradi-party-apc';
    case 'PDP': return 'bg-uradi-party-pdp';
    case 'NNPP': return 'bg-uradi-party-nnpp';
    case 'ADC': return 'bg-uradi-party-adc';
    default: return 'bg-uradi-text-tertiary';
  }
};

const getLoyaltyBadge = (loyalty: string) => {
  switch (loyalty) {
    case 'strong': return <Badge variant="success">Strong</Badge>;
    case 'leaning': return <Badge className="bg-uradi-status-warning/20 text-uradi-status-warning">Leaning</Badge>;
    case 'neutral': return <Badge variant="secondary">Neutral</Badge>;
    case 'opposed': return <Badge variant="destructive">Opposed</Badge>;
    default: return <Badge variant="secondary">{loyalty}</Badge>;
  }
};

export default function PoliticalAtlasPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Political Atlas</h1>
          <p className="text-uradi-text-secondary mt-1">
            Map and analyze political actors, influence networks, and power dynamics
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Network
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Actors" value="247" change="+12" icon={Users} color="uradi-status-info" />
        <StatCard title="High Influence" value="38" change="15%" icon={TrendingUp} color="uradi-status-positive" />
        <StatCard title="Strong Loyalty" value="156" change="63%" icon={Network} color="uradi-gold" />
        <StatCard title="At Risk" value="23" change="9%" icon={TrendingDown} color="uradi-status-critical" />
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="bg-uradi-bg-secondary border border-uradi-border">
          <TabsTrigger value="list">Actor List</TabsTrigger>
          <TabsTrigger value="network">Network Graph</TabsTrigger>
          <TabsTrigger value="map">LGA Power Map</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-uradi-bg-secondary border border-uradi-border rounded-xl mb-4">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-uradi-text-tertiary" />
              <Input
                placeholder="Search actors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Party" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Parties</SelectItem>
                <SelectItem value="pdp">PDP</SelectItem>
                <SelectItem value="apc">APC</SelectItem>
                <SelectItem value="nnpp">NNPP</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Loyalty" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="leaning">Leaning</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="opposed">Opposed</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Influence Type" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="political">Political</SelectItem>
                <SelectItem value="economic">Economic</SelectItem>
                <SelectItem value="religious">Religious</SelectItem>
                <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-uradi-border hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>LGA</TableHead>
                  <TableHead>Influence</TableHead>
                  <TableHead>Loyalty</TableHead>
                  <TableHead>Faction</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockActors.map((actor) => (
                  <TableRow key={actor.id} className="border-uradi-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-uradi-bg-tertiary flex items-center justify-center text-uradi-text-secondary font-medium text-sm">
                          {actor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-uradi-text-primary">{actor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-uradi-text-secondary">{actor.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getPartyColor(actor.party)}`} />
                        <Badge variant="secondary">{actor.party}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-uradi-text-secondary">{actor.lga}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-uradi-gold"
                            style={{ width: `${actor.influence_level * 10}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-uradi-text-primary">{actor.influence_level}/10</span>
                      </div>
                    </TableCell>
                    <TableCell>{getLoyaltyBadge(actor.loyalty)}</TableCell>
                    <TableCell className="text-uradi-text-secondary">{actor.faction}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="network">
          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl p-8 h-[500px] flex items-center justify-center">
            <div className="text-center">
              <Network className="h-16 w-16 text-uradi-gold mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-uradi-text-primary">Network Visualization</h3>
              <p className="text-uradi-text-secondary mt-2">
                Interactive network graph showing relationships between political actors
              </p>
              <Button className="mt-4">Load Network Data</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="map">
          <MapView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MapView() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<{ id: string; name: string } | null>(null);

  // Mock LGA data with coordinates
  const lgaData = [
    {
      id: 'dutse',
      name: 'Dutse',
      coordinates: [[[9.0, 12.0], [9.5, 12.0], [9.5, 12.5], [9.0, 12.5], [9.0, 12.0]]],
      metrics: { sentiment: 75, voters: 45000, turnout: 42 },
    },
    {
      id: 'hadejia',
      name: 'Hadejia',
      coordinates: [[[10.0, 12.5], [10.5, 12.5], [10.5, 13.0], [10.0, 13.0], [10.0, 12.5]]],
      metrics: { sentiment: 68, voters: 38000, turnout: 38 },
    },
    {
      id: 'gumel',
      name: 'Gumel',
      coordinates: [[[9.5, 12.5], [10.0, 12.5], [10.0, 13.0], [9.5, 13.0], [9.5, 12.5]]],
      metrics: { sentiment: 72, voters: 32000, turnout: 41 },
    },
    {
      id: 'kazaure',
      name: 'Kazaure',
      coordinates: [[[8.5, 12.5], [9.0, 12.5], [9.0, 13.0], [8.5, 13.0], [8.5, 12.5]]],
      metrics: { sentiment: 65, voters: 28000, turnout: 39 },
    },
  ];

  const handleMapLoad = useCallback((mapInstance: mapboxgl.Map) => {
    setMap(mapInstance);
  }, []);

  const handleLGAClick = useCallback((lga: { id: string; name: string }) => {
    setSelectedLGA(lga);
  }, []);

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
              <LGABoundaryLayer
                map={map}
                lgaData={lgaData}
                colorBy="sentiment"
                onLGAClick={handleLGAClick}
              />
            )}
          </Map>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="bg-uradi-bg-secondary border-uradi-border">
          <CardHeader>
            <CardTitle className="text-uradi-text-primary">LGA Details</CardTitle>
            <CardDescription>
              {selectedLGA ? selectedLGA.name : 'Select an LGA on the map'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLGA ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                  <span className="text-sm text-uradi-text-secondary">Dominant Party</span>
                  <Badge className="bg-uradi-party-pdp">PDP</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                  <span className="text-sm text-uradi-text-secondary">Sentiment</span>
                  <span className="text-uradi-status-positive font-mono">+75%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                  <span className="text-sm text-uradi-text-secondary">Key Actors</span>
                  <span className="text-uradi-text-primary font-mono">12</span>
                </div>
                <Button className="w-full">View Full Profile</Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-uradi-text-tertiary mx-auto mb-3" />
                <p className="text-sm text-uradi-text-secondary">
                  Click on an LGA to view detailed political intelligence
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-uradi-bg-secondary border-uradi-border">
          <CardHeader>
            <CardTitle className="text-uradi-text-primary">Map Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { color: 'bg-uradi-status-positive', label: 'Strong Support (75-100%)' },
              { color: 'bg-uradi-gold', label: 'Moderate Support (50-75%)' },
              { color: 'bg-uradi-status-warning', label: 'Weak Support (25-50%)' },
              { color: 'bg-uradi-status-critical', label: 'Opposition Strong (0-25%)' },
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
