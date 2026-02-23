import type {
  GeorisquesResultats,
  GeorisquesPaginatedResponse,
  CatNatArrete,
  SiteIndustriel,
  ZonageSismique,
  RadonData,
  ArgilesData,
  SISData,
} from '../types/georisques.types';

const GEO_BASE_URL = 'https://georisques.gouv.fr/api/v1';

// Format latlon as "longitude,latitude" (GeoJSON standard order)
function formatLatLon(lon: number, lat: number): string {
  return `${lon},${lat}`;
}

/** Main consolidated endpoint — returns all risks for a given point */
export async function getResultatsParAdresse(
  lon: number,
  lat: number,
  rayon = 0
): Promise<GeorisquesResultats> {
  const params = new URLSearchParams({
    latlon: formatLatLon(lon, lat),
    rayon: String(rayon),
  });
  const res = await fetch(`${GEO_BASE_URL}/resultats_par_adresse?${params}`);
  if (!res.ok) throw new Error(`Géorisques API error: ${res.status}`);
  return res.json();
}

/** PPR — Plans de Prévention des Risques (all types) */
export async function getPPR(
  lon: number,
  lat: number,
  typePpr: 'NATUREL' | 'TECHNOLOGIQUE' | 'MINIER',
  rayon = 0
) {
  const params = new URLSearchParams({
    latlon: formatLatLon(lon, lat),
    type_ppr: typePpr,
    rayon: String(rayon),
  });
  const res = await fetch(`${GEO_BASE_URL}/ppr?${params}`);
  if (!res.ok) throw new Error(`PPR API error: ${res.status}`);
  return res.json();
}

/** Zonage sismique — commune level */
export async function getZonageSismique(
  codeInsee: string
): Promise<ZonageSismique> {
  const params = new URLSearchParams({ code_insee: codeInsee });
  const res = await fetch(`${GEO_BASE_URL}/zonage_sismique?${params}`);
  if (!res.ok) throw new Error(`Sismique API error: ${res.status}`);
  return res.json();
}

/** Radon — commune level only */
export async function getRadon(codeInsee: string): Promise<RadonData> {
  const params = new URLSearchParams({ code_insee: codeInsee });
  const res = await fetch(`${GEO_BASE_URL}/radon?${params}`);
  if (!res.ok) throw new Error(`Radon API error: ${res.status}`);
  return res.json();
}

/** SIS — Secteurs d'Information des Sols */
export async function getSIS(
  lon: number,
  lat: number,
  rayon = 500
): Promise<SISData> {
  const params = new URLSearchParams({
    latlon: formatLatLon(lon, lat),
    rayon: String(rayon),
  });
  const res = await fetch(`${GEO_BASE_URL}/sis?${params}`);
  if (!res.ok) throw new Error(`SIS API error: ${res.status}`);
  const data = await res.json();
  return {
    exists: (data.nombre_total_elements ?? 0) > 0,
    secteurs: data.data ?? [],
  };
}

/** CatNat — Catastrophes Naturelles since 1982 */
export async function getCatNat(
  codeInsee: string
): Promise<GeorisquesPaginatedResponse<CatNatArrete>> {
  const params = new URLSearchParams({
    code_insee: codeInsee,
    page_size: '100',
  });
  const res = await fetch(`${GEO_BASE_URL}/gaspar/catnat?${params}`);
  if (!res.ok) throw new Error(`CatNat API error: ${res.status}`);
  return res.json();
}

/** Retrait-gonflement des argiles — point level */
export async function getArgiles(
  lon: number,
  lat: number
): Promise<ArgilesData> {
  const params = new URLSearchParams({ latlon: formatLatLon(lon, lat) });
  const res = await fetch(`${GEO_BASE_URL}/argiles?${params}`);
  if (!res.ok) throw new Error(`Argiles API error: ${res.status}`);
  return res.json();
}

/** BASIAS — anciens sites industriels */
export async function getBasias(
  lon: number,
  lat: number,
  rayon = 500
): Promise<GeorisquesPaginatedResponse<SiteIndustriel>> {
  const params = new URLSearchParams({
    latlon: formatLatLon(lon, lat),
    rayon: String(rayon),
    page_size: '50',
  });
  const res = await fetch(`${GEO_BASE_URL}/basias_sites?${params}`);
  if (!res.ok) throw new Error(`BASIAS API error: ${res.status}`);
  return res.json();
}

/** BASOL — sites et sols pollués */
export async function getBasol(
  lon: number,
  lat: number,
  rayon = 500
): Promise<GeorisquesPaginatedResponse<SiteIndustriel>> {
  const params = new URLSearchParams({
    latlon: formatLatLon(lon, lat),
    rayon: String(rayon),
    page_size: '50',
  });
  const res = await fetch(`${GEO_BASE_URL}/basol_sites?${params}`);
  if (!res.ok) throw new Error(`BASOL API error: ${res.status}`);
  return res.json();
}

/**
 * Fetch all risks in parallel — main function used by the ERP wizard.
 * Uses Promise.allSettled so a single API failure doesn't block all results.
 */
export async function fetchAllRisks(
  lon: number,
  lat: number,
  codeInsee: string
) {
  const [resultats, catnat, sis, sismique, radon, argiles, basias, basol] =
    await Promise.allSettled([
      getResultatsParAdresse(lon, lat, 0),
      getCatNat(codeInsee),
      getSIS(lon, lat, 500),
      getZonageSismique(codeInsee),
      getRadon(codeInsee),
      getArgiles(lon, lat),
      getBasias(lon, lat, 500),
      getBasol(lon, lat, 500),
    ]);

  return {
    resultats: resultats.status === 'fulfilled' ? resultats.value : null,
    catnat: catnat.status === 'fulfilled' ? catnat.value : null,
    sis: sis.status === 'fulfilled' ? sis.value : null,
    sismique: sismique.status === 'fulfilled' ? sismique.value : null,
    radon: radon.status === 'fulfilled' ? radon.value : null,
    argiles: argiles.status === 'fulfilled' ? argiles.value : null,
    basias: basias.status === 'fulfilled' ? basias.value : null,
    basol: basol.status === 'fulfilled' ? basol.value : null,
    errors: {
      resultats: resultats.status === 'rejected' ? resultats.reason : null,
      catnat: catnat.status === 'rejected' ? catnat.reason : null,
      sis: sis.status === 'rejected' ? sis.reason : null,
      sismique: sismique.status === 'rejected' ? sismique.reason : null,
      radon: radon.status === 'rejected' ? radon.reason : null,
      argiles: argiles.status === 'rejected' ? argiles.reason : null,
      basias: basias.status === 'rejected' ? basias.reason : null,
      basol: basol.status === 'rejected' ? basol.reason : null,
    },
  };
}
