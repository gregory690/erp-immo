export interface CheckoutSessionInput {
  erp_reference: string;
  adresse: string;
  commune: string;
}

/**
 * Appelle la Netlify Function qui crée une session Stripe Checkout côté serveur.
 * Retourne l'URL de la page de paiement Stripe vers laquelle rediriger l'utilisateur.
 */
export async function createCheckoutSession(input: CheckoutSessionInput): Promise<string> {
  const response = await fetch('/.netlify/functions/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors de la création de la session de paiement');
  }

  if (!data.url) {
    throw new Error('URL de paiement manquante dans la réponse');
  }

  return data.url;
}
