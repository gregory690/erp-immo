const IGN_BASE_URL = 'https://apicarto.ign.fr/api';

export interface CadastreParcelleProperties {
  idu: string;
  code_dep: string;
  code_com: string;
  com_abs?: string;
  section: string;
  feuille: number;
  numero: string;
  nom_com?: string;
  code_insee?: string;
  contenance?: number;
}

export interface CadastreFeature {
  type: 'Feature';
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
  properties: CadastreParcelleProperties;
}

export interface CadastreResponse {
  type: 'FeatureCollection';
  features: CadastreFeature[];
  totalFeatures: number;
  numberMatched: number;
  numberReturned: number;
}

export interface ReferenceCadastrale {
  section: string;
  numero: string;
  departement: string;
  commune: string;
  feuille: string;
  identifiant: string;
}

export async function getParcellesFromCoords(
  lon: number,
  lat: number,
  limit = 1
): Promise<CadastreResponse> {
  const params = new URLSearchParams({
    lon: String(lon),
    lat: String(lat),
    _limit: String(limit),
  });

  const res = await fetch(`${IGN_BASE_URL}/cadastre/parcelle?${params.toString()}`);
  if (!res.ok) throw new Error(`APICarto IGN error: ${res.status}`);
  return res.json();
}

export function extractReferenceCadastrale(
  response: CadastreResponse
): ReferenceCadastrale | null {
  const feature = response.features?.[0];
  if (!feature) return null;

  const p = feature.properties;
  return {
    section: p.section,
    numero: p.numero,
    departement: p.code_dep,
    commune: p.code_com,
    feuille: String(p.feuille),
    identifiant: p.idu,
  };
}
