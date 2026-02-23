import type { ERPDocument } from '../types/erp.types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateERPDocument(doc: ERPDocument): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Mandatory fields — bien
  if (!doc.bien.adresse_complete?.trim()) {
    errors.push('Adresse complète manquante');
  }
  if (!doc.bien.code_insee?.trim()) {
    errors.push('Code INSEE manquant');
  }
  if (!doc.bien.commune?.trim()) {
    errors.push('Commune manquante');
  }
  if (!doc.bien.references_cadastrales?.section?.trim()) {
    warnings.push('Section cadastrale non renseignée — récupération automatique recommandée');
  }
  if (!doc.bien.references_cadastrales?.numero?.trim()) {
    warnings.push('Numéro de parcelle non renseigné');
  }
  if (!doc.bien.coordonnees?.lat || !doc.bien.coordonnees?.lng) {
    errors.push('Coordonnées GPS manquantes');
  }

  // Metadata
  if (!doc.metadata.reference) {
    errors.push('Référence unique manquante');
  }
  if (!doc.metadata.date_realisation) {
    errors.push('Date de réalisation manquante');
  }

  // Risques — at minimum sismique and radon must be defined
  if (!doc.risques.zonage_sismique?.niveau) {
    errors.push('Zonage sismique non déterminé');
  }
  if (!doc.risques.radon?.zone) {
    errors.push('Potentiel radon non déterminé');
  }

  // Validity check
  const now = new Date();
  if (doc.metadata.validite_jusqu_au < now) {
    warnings.push('Document expiré — validité 6 mois dépassée');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/** Format ERP reference for display: ERP-XXXXXXXX */
export function formatERPReference(reference: string): string {
  return `ERP-${reference.replace(/-/g, '').toUpperCase().slice(0, 12)}`;
}

/** Check if an ERP stored in localStorage needs renewal (> 6 months) */
export function isERPExpired(doc: ERPDocument): boolean {
  return new Date(doc.metadata.validite_jusqu_au) < new Date();
}

/** Check if an ERP is approaching expiry (< 30 days) */
export function isERPNearExpiry(doc: ERPDocument): boolean {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return new Date(doc.metadata.validite_jusqu_au) < thirtyDaysFromNow;
}
