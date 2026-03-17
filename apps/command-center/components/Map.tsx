'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LoadingSpinner } from './LoadingSpinner';

// Set Mapbox access token from environment
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  children?: React.ReactNode;
  onLoad?: (map: mapboxgl.Map) => void;
  interactive?: boolean;
}

export function Map({
  center = [9.5, 12.5], // Default to Jigawa/Kano region
  zoom = 8,
  className = '',
  children,
  onLoad,
  interactive = true,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    // Check if token is set
    if (!mapboxgl.accessToken) {
      setError('Mapbox access token not configured. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.');
      setIsLoading(false);
      return;
    }

    try {
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11', // Dark theme matching URADI
        center,
        zoom,
        interactive,
        attributionControl: false,
      });

      // Add navigation controls
      if (interactive) {
        mapInstance.addControl(
          new mapboxgl.NavigationControl({
            showCompass: false,
          }),
          'top-right'
        );
      }

      // Add attribution
      mapInstance.addControl(new mapboxgl.AttributionControl(), 'bottom-right');

      mapInstance.on('load', () => {
        setIsLoading(false);
        map.current = mapInstance;
        onLoad?.(mapInstance);
      });

      mapInstance.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Failed to load map');
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize map');
      setIsLoading(false);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [center, zoom, interactive, onLoad]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-uradi-bg-tertiary rounded-lg ${className}`}>
        <div className="text-center p-6">
          <div className="text-uradi-status-critical mb-2">⚠️</div>
          <p className="text-uradi-text-secondary text-sm">{error}</p>
          <p className="text-uradi-text-tertiary text-xs mt-2">
            Add your Mapbox token to .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-uradi-bg-tertiary rounded-lg">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && children}
    </div>
  );
}

// Hook to access map instance
export function useMap() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  return mapRef.current;
}

// LGA Boundary Layer Component
interface LGABoundaryLayerProps {
  map: mapboxgl.Map;
  lgaData: Array<{
    id: string;
    name: string;
    coordinates: number[][][];
    metrics?: {
      sentiment?: number;
      voters?: number;
      turnout?: number;
    };
  }>;
  colorBy?: 'sentiment' | 'voters' | 'turnout';
  onLGAClick?: (lga: { id: string; name: string }) => void;
}

export function LGABoundaryLayer({
  map,
  lgaData,
  colorBy = 'sentiment',
  onLGAClick,
}: LGABoundaryLayerProps) {
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
    if (!map.getSource('lgas')) {
      map.addSource('lgas', {
        type: 'geojson',
        data: geojson,
      });
    } else {
      (map.getSource('lgas') as mapboxgl.GeoJSONSource).setData(geojson);
    }

    // Add fill layer
    if (!map.getLayer('lga-fills')) {
      map.addLayer({
        id: 'lga-fills',
        type: 'fill',
        source: 'lgas',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', colorBy],
            0,
            '#EF4444', // Critical - red
            50,
            '#F59E0B', // Warning - amber
            75,
            '#C8A94E', // Gold
            100,
            '#10B981', // Positive - green
          ],
          'fill-opacity': 0.6,
        },
      });
    }

    // Add border layer
    if (!map.getLayer('lga-borders')) {
      map.addLayer({
        id: 'lga-borders',
        type: 'line',
        source: 'lgas',
        paint: {
          'line-color': '#374151',
          'line-width': 1,
        },
      });
    }

    // Add labels
    if (!map.getLayer('lga-labels')) {
      map.addLayer({
        id: 'lga-labels',
        type: 'symbol',
        source: 'lgas',
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

    map.on('click', 'lga-fills', handleClick);

    // Hover effects
    map.on('mouseenter', 'lga-fills', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'lga-fills', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      map.off('click', 'lga-fills', handleClick);
      if (map.getLayer('lga-fills')) map.removeLayer('lga-fills');
      if (map.getLayer('lga-borders')) map.removeLayer('lga-borders');
      if (map.getLayer('lga-labels')) map.removeLayer('lga-labels');
      if (map.getSource('lgas')) map.removeSource('lgas');
    };
  }, [map, lgaData, colorBy, onLGAClick]);

  return null;
}

// Polling Unit Markers Component
interface PollingUnitMarkerProps {
  map: mapboxgl.Map;
  units: Array<{
    id: string;
    name: string;
    coordinates: [number, number];
    status: 'open' | 'closed' | 'issue';
    voters?: number;
  }>;
  onUnitClick?: (unit: { id: string; name: string }) => void;
}

export function PollingUnitMarkers({ map, units, onUnitClick }: PollingUnitMarkerProps) {
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    units.forEach((unit) => {
      const color =
        unit.status === 'open' ? '#10B981' : unit.status === 'issue' ? '#EF4444' : '#6B7280';

      const el = document.createElement('div');
      el.className = 'w-3 h-3 rounded-full cursor-pointer';
      el.style.backgroundColor = color;
      el.style.boxShadow = `0 0 0 2px #0B1120, 0 0 0 4px ${color}`;

      const marker = new mapboxgl.Marker(el)
        .setLngLat(unit.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 8 }).setHTML(`
            <div class="p-2">
              <p class="font-medium text-gray-900">${unit.name}</p>
              <p class="text-sm text-gray-600 capitalize">Status: ${unit.status}</p>
              ${unit.voters ? `<p class="text-sm text-gray-600">Voters: ${unit.voters.toLocaleString()}</p>` : ''}
            </div>
          `)
        )
        .addTo(map);

      el.addEventListener('click', () => {
        onUnitClick?.({ id: unit.id, name: unit.name });
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [map, units, onUnitClick]);

  return null;
}
