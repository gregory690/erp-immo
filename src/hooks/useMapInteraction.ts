import { useState, useRef, useEffect, useCallback } from 'react';
import maplibregl, { Map, Marker } from 'maplibre-gl';

export interface MapCoords {
  lng: number;
  lat: number;
}

const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster' as const,
      source: 'osm',
    },
  ],
};

interface UseMapInteractionOptions {
  initialCoords?: MapCoords;
  zoom?: number;
  draggable?: boolean;
  onCoordsChange?: (coords: MapCoords) => void;
  debounceMs?: number;
}

export function useMapInteraction(options: UseMapInteractionOptions = {}) {
  const {
    initialCoords = { lng: 2.3488, lat: 46.8534 },
    zoom = initialCoords.lat === 46.8534 ? 5 : 15,
    draggable = true,
    onCoordsChange,
    debounceMs = 500,
  } = options;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [coords, setCoords] = useState<MapCoords>(initialCoords);
  const [mapReady, setMapReady] = useState(false);

  const handleCoordsChange = useCallback((newCoords: MapCoords) => {
    setCoords(newCoords);
    if (onCoordsChange) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        onCoordsChange(newCoords);
      }, debounceMs);
    }
  }, [onCoordsChange, debounceMs]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OSM_STYLE,
      center: [initialCoords.lng, initialCoords.lat],
      zoom,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // Create marker
      const marker = new maplibregl.Marker({
        draggable,
        color: '#1a3a5c',
      })
        .setLngLat([initialCoords.lng, initialCoords.lat])
        .addTo(map);

      markerRef.current = marker;

      if (draggable) {
        marker.on('dragend', () => {
          const pos = marker.getLngLat();
          handleCoordsChange({ lng: pos.lng, lat: pos.lat });
        });
      }

      setMapReady(true);
    });

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      setMapReady(false);
    };
  }, []); // mount once

  // Update marker position when coords change externally
  const flyToCoords = useCallback((newCoords: MapCoords, newZoom = 15) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [newCoords.lng, newCoords.lat],
      zoom: newZoom,
      duration: 800,
    });
    markerRef.current?.setLngLat([newCoords.lng, newCoords.lat]);
    setCoords(newCoords);
  }, []);

  return {
    mapContainerRef,
    coords,
    mapReady,
    flyToCoords,
  };
}
