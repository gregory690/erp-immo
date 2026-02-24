import { v4 as uuidv4 } from 'uuid';
import type {
  ERPDocument,
  ERPRisques,
  ERPMode,
  PPRExposureERP,
  Prescription,
} from '../types/erp.types';
import type {
  GeorisquesResultats,
  CatNatArrete,
  SiteIndustriel,
  ZonageSismique,
  RadonData,
  ArgilesData,
  SISData,
  GeorisquesPaginatedResponse,
} from '../types/georisques.types';

const ARGILES_MAP: Record<string, 'faible' | 'moyen' | 'fort'> = {
  A: 'faible',
  B1: 'moyen',
  B2: 'moyen',
  C: 'fort',
};

const SISMIQUE_MAP: Record<string, 1 | 2 | 3 | 4 | 5> = {
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
};

function mapPPRExposure(pprData: GeorisquesResultats['risques']['ppr_naturels']): PPRExposureERP[] {
  if (!pprData?.exists) {
    return [{
      exists: false,
      etat: 'NON_APPLICABLE',
      prescriptions: false,
    }];
  }

  return pprData.documents.map(doc => ({
    exists: true,
    nom: doc.nomPpr,
    type_risque: doc.typeRisque,
    etat: (doc.etatPpr as PPRExposureERP['etat']) ?? 'NON_APPLICABLE',
    url_document: doc.urlDocument,
    prescriptions: pprData.approuve,
  }));
}

function buildPrescriptions(risques: ERPRisques): Prescription[] {
  const prescriptions: Prescription[] = [];

  // PPR naturels approved = travaux obligatoires possible
  risques.ppr_naturels
    .filter(p => p.exists && p.etat === 'APPROUVE')
    .forEach(p => {
      prescriptions.push({
        type: 'PPR Naturel',
        description: `Le bien est soumis aux prescriptions du ${p.nom ?? 'PPR naturel'}. Consultez le règlement du PPR pour les travaux obligatoires applicables.`,
        page_reglement: 1,
      });
    });

  risques.ppr_technologiques
    .filter(p => p.exists && p.etat === 'APPROUVE')
    .forEach(p => {
      prescriptions.push({
        type: 'PPR Technologique',
        description: `Le bien est soumis aux prescriptions du ${p.nom ?? 'PPRT'}. Consultez le règlement du PPRT.`,
      });
    });

  if (risques.zonage_sismique.niveau >= 3) {
    prescriptions.push({
      type: 'Risque sismique',
      description: `Zone de sismicité ${risques.zonage_sismique.niveau} — Les travaux de construction et de rénovation doivent respecter les règles parasismiques (Eurocode 8, norme PS92).`,
    });
  }

  if (risques.argiles.niveau === 'fort') {
    prescriptions.push({
      type: 'Retrait-gonflement des argiles',
      description: `Zone d'aléa fort (${risques.argiles.code}) — Des études géotechniques sont recommandées avant tout projet de construction ou d'extension.`,
    });
  }

  if (risques.sis.expose) {
    prescriptions.push({
      type: "Secteur d'Information des Sols (SIS)",
      description: `Le bien est situé dans un Secteur d'Information des Sols. Des études de sols sont obligatoires avant mutation (article L. 556-2 du Code de l'environnement).`,
    });
  }

  return prescriptions;
}

export interface ERPCalculationInput {
  adresse_complete: string;
  code_insee: string;
  code_postal: string;
  commune: string;
  lat: number;
  lng: number;
  section: string;
  numero: string;
  departement?: string;
  mode: ERPMode;
  resultats: GeorisquesResultats | null;
  catnat: GeorisquesPaginatedResponse<CatNatArrete> | null;
  sis: SISData | null;
  sismique: ZonageSismique | null;
  radon: RadonData | null;
  argiles: ArgilesData | null;
  basias: GeorisquesPaginatedResponse<SiteIndustriel> | null;
  basol: GeorisquesPaginatedResponse<SiteIndustriel> | null;
}

export function buildERPDocument(input: ERPCalculationInput): ERPDocument {
  const now = new Date();
  const validite = new Date(now);
  validite.setMonth(validite.getMonth() + 6);

  // Prioritize consolidated resultats, fallback to individual calls
  const r = input.resultats?.risques;

  const sismique = input.sismique ?? r?.alea_sismique;
  const radon = input.radon ?? r?.radon;
  const argiles = input.argiles ?? r?.argiles;

  const sismiqueNiveau = SISMIQUE_MAP[sismique?.code_zone ?? '1'] ?? 1;
  const radonZone = (radon?.potentiel_radon ?? 1) as 1 | 2 | 3;
  const argilesNiveau = ARGILES_MAP[argiles?.code_alea ?? 'A'] ?? 'faible';
  const argilesCode = argiles?.code_alea ?? 'A';

  const sisData = input.sis ?? {
    exists: r?.sis?.exists ?? false,
    secteurs: r?.sis?.secteurs ?? [],
  };

  const basiasSites: SiteIndustriel[] = (input.basias?.data ?? r?.basias?.sites ?? []);
  const basolSites: SiteIndustriel[] = (input.basol?.data ?? r?.basol?.sites ?? []);

  const risques: ERPRisques = {
    ppr_naturels: r?.ppr_naturels ? mapPPRExposure(r.ppr_naturels) : [{ exists: false, etat: 'NON_APPLICABLE', prescriptions: false }],
    ppr_technologiques: r?.ppr_technologiques ? mapPPRExposure(r.ppr_technologiques) : [{ exists: false, etat: 'NON_APPLICABLE', prescriptions: false }],
    ppr_miniers: r?.ppr_miniers ? mapPPRExposure(r.ppr_miniers) : [{ exists: false, etat: 'NON_APPLICABLE', prescriptions: false }],
    zonage_sismique: {
      niveau: sismiqueNiveau,
      libelle: sismique?.libelle ?? `Zone sismicité ${sismiqueNiveau}`,
    },
    radon: {
      zone: radonZone,
      libelle: radon?.libelle ?? `Potentiel radon — catégorie ${radonZone}`,
    },
    sis: {
      expose: sisData.exists,
      references: sisData.secteurs.map(s => s.idSis),
      secteurs: sisData.secteurs,
    },
    argiles: {
      niveau: argilesNiveau,
      code: argilesCode,
      expose: argilesNiveau !== 'faible',
    },
    basias: basiasSites,
    basol: basolSites,
    recul_trait_cote: { applicable: false },
    ensa: {
      en_zone_peb: false,
      prescriptions_insonorisation: false,
    },
  };

  const catnatList: CatNatArrete[] = input.catnat?.data ?? r?.catnat?.arretes ?? [];

  const prescriptions = buildPrescriptions(risques);

  return {
    metadata: {
      reference: uuidv4(),
      date_realisation: now,
      validite_jusqu_au: validite,
      version_reglementaire: 'arrete_27092022',
      mode: input.mode,
    },
    bien: {
      adresse_complete: input.adresse_complete,
      code_insee: input.code_insee,
      code_postal: input.code_postal,
      commune: input.commune,
      references_cadastrales: {
        section: input.section,
        numero: input.numero,
        departement: input.departement,
      },
      coordonnees: {
        lat: input.lat,
        lng: input.lng,
      },
    },
    risques,
    catnat: catnatList,
    prescriptions,
  };
}
