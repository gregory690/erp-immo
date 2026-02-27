import type {
  GeorisquesResultats,
  GeorisquesPaginatedResponse,
  CatNatArrete,
  SiteIndustriel,
  ZonageSismique,
  RadonData,
  ArgilesData,
  SISData,
  PPRExposure,
  PPRDocument,
} from '../types/georisques.types';

const GEO_BASE_URL = 'https://georisques.gouv.fr/api/v1';

// Format latlon as "longitude,latitude" (GeoJSON standard order)
function formatLatLon(lon: number, lat: number): string {
  return `${lon},${lat}`;
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

/** Radon — commune level */
export async function getRadon(codeInsee: string): Promise<RadonData> {
  const params = new URLSearchParams({ code_insee: codeInsee });
  const res = await fetch(`${GEO_BASE_URL}/radon?${params}`);
  if (!res.ok) throw new Error(`Radon API error: ${res.status}`);
  return res.json();
}

/**
 * Retrait-gonflement des argiles — endpoint migrated from /argiles to /rga.
 * New response: { codeExposition: "1"|"2"|"3", exposition: "Exposition forte" }
 * Mapped back to the legacy ArgilesData shape used by the calculator.
 */
export async function getArgiles(
  lon: number,
  lat: number
): Promise<ArgilesData> {
  const params = new URLSearchParams({ latlon: formatLatLon(lon, lat) });
  const res = await fetch(`${GEO_BASE_URL}/rga?${params}`);
  if (!res.ok) throw new Error(`RGA API error: ${res.status}`);
  const text = await res.text();
  if (!text) {
    // No data for this location (e.g. urban area not in RGA database)
    return { code_alea: 'A', libelle_alea: 'Exposition faible', description: '' };
  }
  const data = JSON.parse(text);
  // codeExposition: "1" = faible → A, "2" = modérée → B1, "3" = forte → C
  const codeMap: Record<string, 'A' | 'B1' | 'C'> = { '1': 'A', '2': 'B1', '3': 'C' };
  const code = codeMap[data.codeExposition ?? '1'] ?? 'A';
  return {
    code_alea: code,
    libelle_alea: data.exposition ?? 'Exposition faible',
    description: '',
  };
}

/**
 * SIS — Secteurs d'Information des Sols.
 * Endpoint migrated from /sis to /ssp/conclusions_sis.
 * New response uses `results` (was `nombre_total_elements`) and different field names.
 */
export async function getSIS(
  lon: number,
  lat: number,
  rayon = 500
): Promise<SISData> {
  const params = new URLSearchParams({
    latlon: formatLatLon(lon, lat),
    rayon: String(rayon),
  });
  const res = await fetch(`${GEO_BASE_URL}/ssp/conclusions_sis?${params}`);
  if (!res.ok) throw new Error(`SIS API error: ${res.status}`);
  const data = await res.json();
  return {
    exists: (data.results ?? 0) > 0,
    secteurs: (data.data ?? []).map((s: Record<string, unknown>) => ({
      idSis: (s.id_sis ?? s.identifiant_ssp ?? '') as string,
      nomSite: (s.nom ?? s.nom_etablissement ?? '') as string,
      commune: (s.nom_commune ?? '') as string,
      codeInsee: (s.code_insee ?? '') as string,
      superficie: undefined,
    })),
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

/**
 * Anciens sites industriels (ex-BASIAS) — migrated from /basias_sites to /ssp/casias.
 * Maps new field names (identifiant_ssp, nom_etablissement, nom_commune…)
 * back to the legacy SiteIndustriel shape.
 */
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
  const res = await fetch(`${GEO_BASE_URL}/ssp/casias?${params}`);
  if (!res.ok) throw new Error(`CASIAS API error: ${res.status}`);
  const data = await res.json();
  return {
    nombre_total_elements: data.results ?? 0,
    page: data.page ?? 1,
    data: (data.data ?? []).map((s: Record<string, unknown>) => ({
      identifiant: (s.identifiant_ssp ?? s.identifiant_casias ?? '') as string,
      nom_usuel: ((s.nom_etablissement as string) ?? 'N/A'),
      adresse: s.adresse as string | undefined,
      code_insee: (s.code_insee ?? '') as string,
      commune: (s.nom_commune ?? '') as string,
      statut_site: s.statut as string | undefined,
      url_fiche: s.fiche_risque as string | undefined,
    })),
  };
}

/**
 * Sites et sols pollués (ex-BASOL) — migrated from /basol_sites to /ssp/instructions.
 * Active SSP procedures are the closest equivalent to the former BASOL database.
 */
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
  const res = await fetch(`${GEO_BASE_URL}/ssp/instructions?${params}`);
  if (!res.ok) throw new Error(`SSP Instructions API error: ${res.status}`);
  const data = await res.json();
  return {
    nombre_total_elements: data.results ?? 0,
    page: data.page ?? 1,
    data: (data.data ?? []).map((s: Record<string, unknown>) => ({
      identifiant: (s.identifiant_ssp ?? '') as string,
      nom_usuel: ((s.nom_etablissement ?? s.nom ?? 'N/A') as string),
      adresse: s.adresse as string | undefined,
      code_insee: (s.code_insee ?? '') as string,
      commune: (s.nom_commune ?? '') as string,
      statut_site: s.statut as string | undefined,
      url_fiche: s.fiche_risque as string | undefined,
    })),
  };
}

/**
 * Map a raw PPR API response (paginated) to the legacy PPRExposure shape
 * so that erp-calculator.service.ts can use existing logic unchanged.
 */
function mapPPRResponseToExposure(
  pprData: Record<string, unknown> | null,
  typePpr: 'NATUREL' | 'TECHNOLOGIQUE' | 'MINIER'
): PPRExposure {
  const items = (pprData?.data as Record<string, unknown>[]) ?? [];
  if (items.length === 0) {
    return { exists: false, prescrit: false, approuve: false, risques: [], documents: [] };
  }

  const documents: PPRDocument[] = items.map(item => {
    const etatObj = item.etat as Record<string, string> | undefined;
    const libelleEtat = (etatObj?.libelle_etat ?? '').toLowerCase();
    let etatPpr: 'PRESCRIT' | 'APPROUVE' | 'ANTICIPE' = 'PRESCRIT';
    if (libelleEtat.includes('approu')) etatPpr = 'APPROUVE';
    else if (libelleEtat.includes('anticip')) etatPpr = 'ANTICIPE';

    const risqueObj = item.risque as Record<string, string> | undefined;
    return {
      id: item.id_gaspar as string | undefined,
      codePpr: item.id_gaspar as string | undefined,
      nomPpr: (item.nom_ppr as string) ?? 'PPR',
      typePpr,
      etatPpr,
      dateApprobation: item.date_approbation as string | undefined,
      typeRisque: risqueObj?.libelle_risque,
    };
  });

  return {
    exists: true,
    prescrit: documents.some(d => d.etatPpr === 'PRESCRIT'),
    approuve: documents.some(d => d.etatPpr === 'APPROUVE'),
    risques: [...new Set(documents.map(d => d.typeRisque).filter(Boolean) as string[])],
    documents,
  };
}

/**
 * Fetch all risks in parallel — main function used by the ERP wizard.
 *
 * API migration (2025-2026):
 *  - /resultats_par_adresse removed → PPR now fetched via 3 separate /ppr calls
 *  - /argiles → /rga
 *  - /sis → /ssp/conclusions_sis
 *  - /basias_sites → /ssp/casias
 *  - /basol_sites → /ssp/instructions
 *
 * Uses Promise.allSettled so a single API failure doesn't block all results.
 */
export async function fetchAllRisks(
  lon: number,
  lat: number,
  codeInsee: string
) {
  const [
    catnat, sis, sismique, radon, argiles, basias, basol,
    pprNat, pprTech, pprMin,
  ] = await Promise.allSettled([
    getCatNat(codeInsee),
    getSIS(lon, lat, 500),
    getZonageSismique(codeInsee),
    getRadon(codeInsee),
    getArgiles(lon, lat),
    getBasias(lon, lat, 500),
    getBasol(lon, lat, 500),
    getPPR(lon, lat, 'NATUREL', 0),
    getPPR(lon, lat, 'TECHNOLOGIQUE', 0),
    getPPR(lon, lat, 'MINIER', 0),
  ]);

  const pprNatData = pprNat.status === 'fulfilled' ? pprNat.value : null;
  const pprTechData = pprTech.status === 'fulfilled' ? pprTech.value : null;
  const pprMinData = pprMin.status === 'fulfilled' ? pprMin.value : null;

  // Construct resultats carrying only PPR data (the consolidated endpoint no longer exists).
  // Individual calls above supply sismique/radon/argiles/sis/catnat/basias/basol.
  const resultats: GeorisquesResultats = {
    code_insee: codeInsee,
    longitude: lon,
    latitude: lat,
    risques: {
      ppr_naturels: mapPPRResponseToExposure(pprNatData, 'NATUREL'),
      ppr_technologiques: mapPPRResponseToExposure(pprTechData, 'TECHNOLOGIQUE'),
      ppr_miniers: mapPPRResponseToExposure(pprMinData, 'MINIER'),
    },
  };

  return {
    resultats,
    catnat: catnat.status === 'fulfilled' ? catnat.value : null,
    sis: sis.status === 'fulfilled' ? sis.value : null,
    sismique: sismique.status === 'fulfilled' ? sismique.value : null,
    radon: radon.status === 'fulfilled' ? radon.value : null,
    argiles: argiles.status === 'fulfilled' ? argiles.value : null,
    basias: basias.status === 'fulfilled' ? basias.value : null,
    basol: basol.status === 'fulfilled' ? basol.value : null,
    errors: {
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
