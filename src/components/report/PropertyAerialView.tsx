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
  staticMode?: boolean;
}

/** Calcule le BBOX WGS84 centré sur (lat,lng) pour une image WxH px au zoom z */
function bboxWGS84(lat: number, lng: number, zoom: number, w: number, h: number): string {
  const dpx = 360 / (256 * Math.pow(2, zoom));
  const dpy = dpx / Math.cos(lat * Math.PI / 180);
  const hw = (w / 2) * dpx;
  const hh = (h / 2) * dpy;
  // WMS 1.3.0 EPSG:4326 : minLat, minLng, maxLat, maxLng
  return `${lat - hh},${lng - hw},${lat + hh},${lng + hw}`;
}

export function PropertyAerialView({ lat, lng, zoom = 18, staticMode = false }: PropertyAerialViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (staticMode || !containerRef.current) return;

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
  }, [lat, lng, zoom, staticMode]);

  if (staticMode) {
    const W = 610; const H = 160;
    const bbox = bboxWGS84(lat, lng, zoom, W, H);
    const ignUrl = `https://data.geopf.fr/wms-r/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=ORTHOIMAGERY.ORTHOPHOTOS&CRS=EPSG:4326&BBOX=${bbox}&WIDTH=${W}&HEIGHT=${H}&FORMAT=image/jpeg&STYLES=`;
    return (
      <div style={{ height: '160px', overflow: 'hidden', border: '1px solid #d1d5db', borderRadius: 4, position: 'relative' }}>
        <img src={ignUrl} alt="Vue aérienne IGN" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {/* Marqueur rouge centré */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)', width: 10, height: 10, borderRadius: '50%', background: '#dc2626', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
      </div>
    );
  }

  return (
    <div
      className="rounded border border-gray-300 pointer-events-none"
      style={{ height: '160px', overflow: 'hidden' }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
