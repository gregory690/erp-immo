import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

const IGN_ORTHO_STYLE = {
  version: 8 as const,
  sources: {
    orthophoto: {
      type: 'raster' as const,
      tiles: [
        'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg',
      ],
      tileSize: 256,
      attribution: '© IGN Géoportail',
      maxzoom: 20,
    },
  },
  layers: [{ id: 'orthophoto', type: 'raster' as const, source: 'orthophoto' }],
};

interface PropertyAerialViewProps {
  lat: number;
  lng: number;
  zoom?: number;
}

export function PropertyAerialView({ lat, lng, zoom = 18 }: PropertyAerialViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: IGN_ORTHO_STYLE,
      center: [lng, lat],
      zoom,
    });

    map.on('load', () => {
      new maplibregl.Marker({ color: '#dc2626', scale: 0.9 })
        .setLngLat([lng, lat])
        .addTo(map);
    });

    return () => {
      map.remove();
    };
  }, [lat, lng, zoom]);

  return (
    <div
      className="rounded border border-gray-300 pointer-events-none"
      style={{ height: '160px', overflow: 'hidden' }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
