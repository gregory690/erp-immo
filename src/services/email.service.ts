import type { ERPDocument } from '../types/erp.types';

/**
 * Envoie le document ERP par email et le sauvegarde côté serveur
 * pour permettre un re-téléchargement ultérieur.
 */
export async function sendERPByEmail(
  email: string,
  erpDocument: ERPDocument
): Promise<void> {
  const response = await fetch('/.netlify/functions/send-erp-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, erpDocument }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Erreur lors de l'envoi de l'email");
  }
}

/**
 * Récupère un document ERP depuis le serveur via sa référence.
 * Utilisé quand le localStorage est vide (autre appareil, nouveau navigateur).
 */
export async function fetchERPByReference(reference: string): Promise<ERPDocument | null> {
  const response = await fetch(
    `/.netlify/functions/get-erp-document?ref=${encodeURIComponent(reference)}`
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error('Impossible de récupérer le document ERP');
  }

  return response.json() as Promise<ERPDocument>;
}
