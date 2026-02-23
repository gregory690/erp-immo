const IGN_BASE_URL = 'https://apicarto.ign.fr/api';

export interface CadastreParcelleProperties {
  id: string;
  departmentcode: string;
  municipalitycode: string;
  oldmunicipalitycode: string;
  districtcode: string;
  section: string;
  sheet: string;
  number: string;
  city?: string;
  commune?: string;
  created?: string;
  updated?: string;
  source: string;
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
    numero: p.number,
    departement: p.departmentcode,
    commune: p.municipalitycode,
    feuille: p.sheet,
    identifiant: p.id,
  };
}
