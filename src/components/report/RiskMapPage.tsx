import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

const BRGM_WMS = 'https://mapsref.brgm.fr/wxs/georisques/risques';

/** Calcule le BBOX WGS84 centré sur (lat,lng) pour une image WxH px au zoom z */
function bboxWGS84(lat: number, lng: number, zoom: number, w: number, h: number): string {
  const dpx = 360 / (256 * Math.pow(2, zoom));
  const dpy = dpx / Math.cos(lat * Math.PI / 180);
  const hw = (w / 2) * dpx;
  const hh = (h / 2) * dpy;
  return `${lat - hh},${lng - hw},${lat + hh},${lng + hw}`;
}

const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap',
      maxzoom: 19,
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
};

export interface WmsRiskLayer {
  id: string;
  name: string;
  wmsLayer: string;
  wmsUrl?: string;
  opacity?: number;
  legendColor: string;
}

interface RiskMapPageProps {
  title: string;
  description: string;
  source?: string;
  layers: WmsRiskLayer[];
  lat: number;
  lng: number;
  zoom?: number;
  pageNum: number;
  totalPages: number;
  adresse: string;
  staticMode?: boolean;
}

function buildWmsUrl(baseUrl: string, layer: string): string {
  return `${baseUrl}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=${layer}&CRS=EPSG%3A3857&STYLES=&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}`;
}

export function RiskMapPage({
  title,
  description,
  source = 'BRGM/Géorisques · mapsref.brgm.fr',
  layers,
  lat,
  lng,
  zoom = 11,
  pageNum,
  totalPages,
  adresse,
  staticMode = false,
}: RiskMapPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (staticMode || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: [lng, lat],
      zoom,
    });

    map.on('load', () => {
      layers.forEach((layer) => {
        const wmsBase = layer.wmsUrl ?? BRGM_WMS;
        map.addSource(`src-${layer.id}`, {
          type: 'raster',
          tiles: [buildWmsUrl(wmsBase, layer.wmsLayer)],
          tileSize: 256,
          attribution: '© BRGM/Géorisques',
        });
        map.addLayer({
          id: `lyr-${layer.id}`,
          type: 'raster',
          source: `src-${layer.id}`,
          paint: { 'raster-opacity': layer.opacity ?? 0.6 },
        });
      });

      new maplibregl.Marker({ color: '#dc2626', scale: 1.2 })
        .setLngLat([lng, lat])
        .addTo(map);
    });

    return () => {
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, zoom, staticMode]);

  const mapBlock = staticMode ? (() => {
    const W = 800; const H = 460;
    const bbox = bboxWGS84(lat, lng, zoom, W, H);
    const ignBgUrl = `https://data.geopf.fr/wms-r/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=PLAN.IGN&CRS=EPSG:4326&BBOX=${bbox}&WIDTH=${W}&HEIGHT=${H}&FORMAT=image/png&STYLES=`;
    return (
      <div style={{ height: '460px', overflow: 'hidden', border: '1px solid #d1d5db', position: 'relative', background: '#e5e7eb' }}>
        {/* Fond IGN Plan */}
        <img src={ignBgUrl} alt="Fond de carte IGN" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill', display: 'block' }} />
        {/* Couches WMS risques (transparentes) */}
        {layers.map((l) => {
          const wmsBase = l.wmsUrl ?? BRGM_WMS;
          const url = `${wmsBase}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=${l.wmsLayer}&CRS=EPSG:4326&WIDTH=${W}&HEIGHT=${H}&BBOX=${bbox}&STYLES=`;
          return (
            <img key={l.id} src={url} alt={l.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill', display: 'block', opacity: l.opacity ?? 0.6 }} />
          );
        })}
        {/* Marqueur rouge centré */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)', width: 14, height: 14, borderRadius: '50%', background: '#dc2626', border: '2.5px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.5)' }} />
      </div>
    );
  })() : (
    <div
      className="rounded border border-gray-300 bg-gray-100 pointer-events-none"
      style={{ height: '460px', overflow: 'hidden' }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );

  return (
    <div className="p-6 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 mb-4 border-b-2 border-gray-900">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">
            EDL &amp; DIAGNOSTIC — Annexe cartographique
          </p>
          <h2 className="text-base font-black text-gray-900 uppercase leading-tight">{title}</h2>
          <p className="text-[11px] text-gray-600 mt-0.5">{description}</p>
        </div>
        <div className="text-right text-[10px] text-gray-500 max-w-[200px]">
          <p className="font-semibold text-gray-700 leading-tight">{adresse}</p>
        </div>
      </div>

      {/* Map */}
      {mapBlock}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] text-gray-700 border border-gray-200 rounded p-2 bg-gray-50">
        <span className="font-semibold text-gray-500 uppercase text-[9px] tracking-wide">
          Légende :
        </span>
        {layers.map((l) => (
          <div key={l.id} className="flex items-center gap-1.5">
            <span
              className="inline-block w-5 h-3.5 rounded-sm border border-gray-400"
              style={{ backgroundColor: l.legendColor, opacity: 0.8 }}
            />
            <span>{l.name}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-red-600" />
          <span>Bien concerné</span>
        </div>
      </div>

      {/* Footer */}
      <div className="erp-page-footer mt-4 pt-3 text-[8px] text-gray-400 text-center border-t border-gray-200">
        <p>Source : {source} · Fond de carte © IGN Géoportail / BRGM Géorisques</p>
        <p className="mt-1.5 font-semibold text-gray-500">
          {pageNum} / {totalPages}
        </p>
      </div>
    </div>
  );
}

// ─── Configurations des 4 pages cartes ────────────────────────────────────────

export const RISK_MAP_CONFIGS: {
  title: string;
  description: string;
  layers: WmsRiskLayer[];
  zoom: number;
}[] = [
  {
    title: "Inondation & Submersion marine",
    description: "Plans de prévention des risques naturels — inondation, crues et submersion marine",
    layers: [
      {
        id: 'inond',
        name: 'PPRN Inondation',
        wmsLayer: 'PPRN_ZONE_INOND',
        legendColor: '#3b82f6',
        opacity: 0.55,
      },
      {
        id: 'submar',
        name: 'PPRN Submersion marine',
        wmsLayer: 'PPRN_ZONE_SUBMAR',
        legendColor: '#06b6d4',
        opacity: 0.55,
      },
    ],
    zoom: 11,
  },
  {
    title: "Séisme & Mouvements de terrain",
    description: "Plans de prévention des risques naturels — séisme, glissements et effondrements",
    layers: [
      {
        id: 'seisme',
        name: 'PPRN Séisme',
        wmsLayer: 'PPRN_ZONE_SEISME',
        legendColor: '#ef4444',
        opacity: 0.5,
      },
      {
        id: 'mvt',
        name: 'PPRN Mouvements de terrain',
        wmsLayer: 'PPRN_ZONE_MVT',
        legendColor: '#a855f7',
        opacity: 0.55,
      },
    ],
    zoom: 10,
  },
  {
    title: "Risques technologiques",
    description: "Plans de prévention des risques technologiques et installations classées (ICPE)",
    layers: [
      {
        id: 'pprt',
        name: 'PPRT Risques industriels',
        wmsLayer: 'PPRT_ZONE_RISQIND',
        legendColor: '#f97316',
        opacity: 0.6,
      },
      {
        id: 'icpe',
        name: 'Installations classées (ICPE)',
        wmsLayer: 'INSTALLATIONS_CLASSEES_SIMPLIFIE',
        legendColor: '#92400e',
        opacity: 0.65,
      },
    ],
    zoom: 11,
  },
  {
    title: "Cavités souterraines & Feux de forêt",
    description: "Plans de prévention des risques naturels — cavités, effondrements et incendies",
    layers: [
      {
        id: 'cav',
        name: 'PPRN Cavités souterraines',
        wmsLayer: 'PPRN_ZONE_CAV',
        legendColor: '#d97706',
        opacity: 0.55,
      },
      {
        id: 'feu',
        name: 'PPRN Feux de forêt',
        wmsLayer: 'PPRN_ZONE_FEU',
        legendColor: '#dc2626',
        opacity: 0.5,
      },
    ],
    zoom: 10,
  },
];
