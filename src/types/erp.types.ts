import type { CatNatArrete, SISSecteur, SiteIndustriel } from './georisques.types';

export type ERPMode = 'edition' | 'commande' | 'expert';
export type RiskLevel = 'none' | 'low' | 'medium' | 'high';
export type SismiqueNiveau = 1 | 2 | 3 | 4 | 5;
export type RadonNiveau = 1 | 2 | 3;

export interface PPRExposureERP {
  exists: boolean;
  nom?: string;
  type_risque?: string;
  etat: 'PRESCRIT' | 'APPROUVE' | 'ANTICIPE' | 'NON_APPLICABLE';
  zone?: string;
  url_document?: string;
  prescriptions: boolean;
}

export interface ERPRisques {
  ppr_naturels: PPRExposureERP[];
  ppr_technologiques: PPRExposureERP[];
  ppr_miniers: PPRExposureERP[];
  zonage_sismique: {
    niveau: SismiqueNiveau;
    libelle: string;
  };
  radon: {
    zone: RadonNiveau;
    libelle: string;
  };
  sis: {
    expose: boolean;
    references: string[];
    secteurs: SISSecteur[];
  };
  argiles: {
    niveau: 'faible' | 'moyen' | 'fort';
    code: string;
    expose: boolean;
  };
  basias: SiteIndustriel[];
  basol: SiteIndustriel[];
}

export interface Prescription {
  type: string;
  description: string;
  page_reglement?: number;
}

export interface ERPDocument {
  metadata: {
    reference: string; // UUID v4
    date_realisation: Date;
    validite_jusqu_au: Date; // +6 mois
    version_reglementaire: 'arrete_27092022';
    mode: ERPMode;
  };
  bien: {
    adresse_complete: string;
    code_insee: string;
    code_postal: string;
    commune: string;
    references_cadastrales: {
      section: string;
      numero: string;
      departement?: string;
      feuille?: string;
    };
    coordonnees: {
      lat: number;
      lng: number;
    };
    nature?: 'terrain_nu' | 'bati';
    usage?: 'habitation' | 'professionnel' | 'mixte';
  };
  risques: ERPRisques;
  catnat: CatNatArrete[];
  prescriptions: Prescription[];
  sinistres_declares?: {
    nature: string;
    date_arrete: string;
    date_sinistre: string;
    indemnise: boolean;
  }[];
  signature_editeur?: {
    timestamp: Date;
    user_agent: string;
  };
}

// State management types for the wizard
export interface WizardStep {
  id: number;
  label: string;
  description: string;
  completed: boolean;
}

export interface RiskLoadingState {
  ppr: boolean;
  catnat: boolean;
  sis: boolean;
  sismique: boolean;
  radon: boolean;
  argiles: boolean;
  basias: boolean;
  basol: boolean;
}

export interface ERPGenerationState {
  step: 1 | 2 | 3 | 4;
  address: {
    query: string;
    selected: boolean;
    label: string;
    codeInsee: string;
    codePostal: string;
    commune: string;
    lat: number;
    lng: number;
  } | null;
  cadastre: {
    section: string;
    numero: string;
    departement: string;
  } | null;
  risques: ERPRisques | null;
  catnat: CatNatArrete[];
  loading: RiskLoadingState;
  error: string | null;
  document: ERPDocument | null;
}

export interface ServiceOption {
  id: ERPMode;
  title: string;
  description: string;
  price_ht: number;
  price_ttc: number;
  delay: string;
  features: string[];
  recommended?: boolean;
}

// Risk summary for display
export interface RiskSummaryItem {
  category: string;
  label: string;
  expose: boolean;
  niveau?: RiskLevel;
  detail?: string;
  arrete?: string;
}
