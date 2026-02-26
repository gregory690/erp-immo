import type { ERPRisques, RiskSummaryItem } from '../types/erp.types';
import type { CatNatArrete } from '../types/georisques.types';

const RADON_LIBELLES: Record<number, string> = {
  1: 'Potentiel faible',
  2: 'Potentiel moyen',
  3: 'Potentiel élevé',
};

const SISMIQUE_LIBELLES: Record<number, string> = {
  1: 'Zone 1 · Très faible',
  2: 'Zone 2 · Faible',
  3: 'Zone 3 · Modéré',
  4: 'Zone 4 · Moyen',
  5: 'Zone 5 · Fort',
};

export function buildRiskSummary(
  risques: ERPRisques,
  catnat: CatNatArrete[]
): RiskSummaryItem[] {
  const items: RiskSummaryItem[] = [];

  // PPR Naturels
  const pprn = risques.ppr_naturels;
  const hasPPRn = pprn.some(p => p.exists);
  items.push({
    category: 'Risques naturels',
    label: 'Plan de Prévention des Risques Naturels (PPRn)',
    expose: hasPPRn,
    niveau: hasPPRn ? (pprn.some(p => p.etat === 'APPROUVE') ? 'high' : 'medium') : 'none',
    detail: hasPPRn
      ? pprn.filter(p => p.exists).map(p => p.nom ?? p.type_risque ?? '').join(', ')
      : 'Non concerné',
  });

  // PPR Technologiques
  const pprt = risques.ppr_technologiques;
  const hasPPRt = pprt.some(p => p.exists);
  items.push({
    category: 'Risques technologiques',
    label: 'Plan de Prévention des Risques Technologiques (PPRT)',
    expose: hasPPRt,
    niveau: hasPPRt ? (pprt.some(p => p.etat === 'APPROUVE') ? 'high' : 'medium') : 'none',
    detail: hasPPRt
      ? pprt.filter(p => p.exists).map(p => p.nom ?? '').join(', ')
      : 'Non concerné',
  });

  // PPR Miniers
  const pprm = risques.ppr_miniers;
  const hasPPRm = pprm.some(p => p.exists);
  items.push({
    category: 'Risques miniers',
    label: 'Plan de Prévention des Risques Miniers (PPRM)',
    expose: hasPPRm,
    niveau: hasPPRm ? 'high' : 'none',
    detail: hasPPRm
      ? pprm.filter(p => p.exists).map(p => p.nom ?? '').join(', ')
      : 'Non concerné',
  });

  // Séisme
  const niveau_sismique = risques.zonage_sismique.niveau;
  items.push({
    category: 'Risques naturels',
    label: 'Zonage sismique',
    expose: niveau_sismique >= 2,
    niveau: niveau_sismique >= 4 ? 'high' : niveau_sismique >= 3 ? 'medium' : niveau_sismique >= 2 ? 'low' : 'none',
    detail: SISMIQUE_LIBELLES[niveau_sismique] ?? `Zone ${niveau_sismique}`,
  });

  // Radon
  const radon_zone = risques.radon.zone;
  items.push({
    category: 'Risques naturels',
    label: 'Potentiel radon',
    expose: radon_zone >= 2,
    niveau: radon_zone === 3 ? 'high' : radon_zone === 2 ? 'medium' : 'none',
    detail: RADON_LIBELLES[radon_zone] ?? `Catégorie ${radon_zone}`,
  });

  // SIS
  items.push({
    category: 'Pollution des sols',
    label: "Secteurs d'Information des Sols (SIS)",
    expose: risques.sis.expose,
    niveau: risques.sis.expose ? 'high' : 'none',
    detail: risques.sis.expose
      ? `${risques.sis.secteurs.length} secteur(s) identifié(s)`
      : 'Non concerné',
  });

  // Argiles
  const argilesExpose = risques.argiles.expose;
  items.push({
    category: 'Risques naturels',
    label: 'Retrait-gonflement des argiles',
    expose: argilesExpose,
    niveau: risques.argiles.niveau === 'fort' ? 'high' : risques.argiles.niveau === 'moyen' ? 'medium' : 'none',
    detail: `Aléa ${risques.argiles.niveau} (${risques.argiles.code})`,
  });

  // BASIAS
  items.push({
    category: 'Pollution des sols',
    label: 'Anciens sites industriels (BASIAS)',
    expose: risques.basias.length > 0,
    niveau: risques.basias.length > 0 ? 'medium' : 'none',
    detail: risques.basias.length > 0
      ? `${risques.basias.length} site(s) recensé(s) dans un rayon de 500m`
      : 'Aucun site dans le rayon de 500m',
  });

  // BASOL
  items.push({
    category: 'Pollution des sols',
    label: 'Sites et sols pollués (BASOL)',
    expose: risques.basol.length > 0,
    niveau: risques.basol.length > 0 ? 'high' : 'none',
    detail: risques.basol.length > 0
      ? `${risques.basol.length} site(s) pollué(s) dans un rayon de 500m`
      : 'Aucun site dans le rayon de 500m',
  });

  // Recul du trait de côte (obligatoire depuis le 01/01/2023 — Loi Climat & Résilience)
  const rtc = risques.recul_trait_cote;
  items.push({
    category: 'Risques côtiers',
    label: "Recul du trait de côte",
    expose: rtc.applicable && (rtc.expose ?? false),
    niveau: rtc.applicable && rtc.expose ? 'high' : 'none',
    detail: !rtc.applicable
      ? 'Commune non concernée (non littorale)'
      : rtc.expose
        ? `Zone exposée · horizon ${rtc.horizon ?? '2100'}${rtc.libelle ? ` · ${rtc.libelle}` : ''}`
        : 'Commune littorale · bien non exposé',
  });

  // CatNat
  items.push({
    category: 'Catastrophes naturelles',
    label: 'Arrêtés de catastrophes naturelles',
    expose: catnat.length > 0,
    niveau: catnat.length >= 5 ? 'high' : catnat.length >= 2 ? 'medium' : catnat.length >= 1 ? 'low' : 'none',
    detail: catnat.length > 0
      ? `${catnat.length} arrêté(s) depuis 1982`
      : 'Aucun arrêté CatNat recensé',
  });

  return items;
}

export function getGlobalRiskLevel(items: RiskSummaryItem[]): 'none' | 'low' | 'medium' | 'high' {
  if (items.some(i => i.niveau === 'high')) return 'high';
  if (items.some(i => i.niveau === 'medium')) return 'medium';
  if (items.some(i => i.niveau === 'low')) return 'low';
  return 'none';
}
