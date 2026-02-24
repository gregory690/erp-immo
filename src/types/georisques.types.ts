export type SismiqueZone = 1 | 2 | 3 | 4 | 5;
export type RadonZone = 1 | 2 | 3;
export type ArgilesCode = 'A' | 'B1' | 'B2' | 'C';

export interface PPRDocument {
  id?: string;
  codePpr?: string;
  nomPpr: string;
  typePpr: 'NATUREL' | 'TECHNOLOGIQUE' | 'MINIER';
  etatPpr: 'PRESCRIT' | 'APPROUVE' | 'ANTICIPE';
  dateApprobation?: string;
  typeRisque?: string;
  urlDocument?: string;
  commune?: {
    codeInsee: string;
    nomCommune: string;
  };
}

export interface PPRExposure {
  exists: boolean;
  prescrit: boolean;
  approuve: boolean;
  risques: string[];
  documents: PPRDocument[];
}

export interface ZonageSismique {
  code_zone: string;
  libelle: string;
  description: string;
}

export interface RadonData {
  potentiel_radon: RadonZone;
  libelle: string;
  categorie: string;
}

export interface SISSecteur {
  idSis: string;
  nomSite: string;
  commune: string;
  codeInsee: string;
  superficie?: number;
}

export interface SISData {
  exists: boolean;
  secteurs: SISSecteur[];
}

export interface CatNatArrete {
  code_national_catnat?: string;
  libelle_risque_jo: string;
  code_risque?: string;
  date_debut_evt: string;
  date_fin_evt: string;
  date_publication_arrete: string;
  date_publication_jo?: string;
  code_insee?: string;
  libelle_commune?: string;
}

export interface ArgilesData {
  code_alea: ArgilesCode;
  libelle_alea: string;
  description: string;
}

export interface SiteIndustriel {
  identifiant: string;
  nom_usuel: string;
  raison_sociale?: string;
  adresse?: string;
  code_insee: string;
  commune: string;
  statut_site?: string;
  etat_avancement?: string;
  activite_principale?: string;
  longitude?: number;
  latitude?: number;
  distance_metres?: number;
  url_fiche?: string;
  type_pollution?: string;
  numero_basol?: string;
}

export interface GeorisquesResultats {
  code_insee: string;
  adresse?: string;
  longitude: number;
  latitude: number;
  risques: {
    ppr_naturels: PPRExposure;
    ppr_technologiques: PPRExposure;
    ppr_miniers: PPRExposure;
    alea_sismique: ZonageSismique;
    radon: RadonData;
    sis: SISData;
    catnat: {
      exists: boolean;
      arretes: CatNatArrete[];
    };
    argiles: ArgilesData;
    basias: {
      exists: boolean;
      sites: SiteIndustriel[];
    };
    basol: {
      exists: boolean;
      sites: SiteIndustriel[];
    };
  };
}

export interface GeorisquesPaginatedResponse<T> {
  nombre_total_elements: number;
  page: number;
  nombre_elements_par_page?: number;
  data: T[];
}
