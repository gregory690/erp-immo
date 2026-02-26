// Vercel Function — create-checkout-session
// La clé secrète Stripe n'est JAMAIS exposée au navigateur.
import Stripe from 'stripe';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY manquante dans les variables d'environnement");
    return res.status(500).json({ error: 'Configuration serveur incomplète' });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

  try {
    const { erp_reference, adresse, commune, erpDocument } = req.body;

    // Validation et sanitisation des inputs
    const safeRef = String(erp_reference || '').slice(0, 64).replace(/[<>"'&]/g, '');
    const safeAdresse = String(adresse || '').slice(0, 200).replace(/[<>"'&]/g, '');
    const safeCommune = String(commune || '').slice(0, 100).replace(/[<>"'&]/g, '');

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.URL || 'http://localhost:3000';

    // ─── 1. Créer la session Stripe en premier ────────────────────────────────
    // On crée la session avant de stocker dans KV pour pouvoir inclure
    // le stripe_session_id dans le document — nécessaire pour vérifier
    // le paiement dans get-erp-document.js
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      locale: 'fr',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'État des Risques et Pollutions (ERP)',
              description: `${safeAdresse || 'Bien immobilier'} · Réf. ${safeRef || ''}`,
            },
            unit_amount: 1999, // 19,99 € en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/apercu?payment=success&ref=${encodeURIComponent(safeRef)}`,
      cancel_url: `${baseUrl}/generer?payment=cancel`,
      metadata: {
        erp_reference: safeRef,
        adresse: safeAdresse,
        commune: safeCommune,
      },
    });

    // ─── 2. Sauvegarder le document ERP dans KV avec l'ID de session ──────────
    // Fire-and-forget : on ne bloque pas la réponse sur la sauvegarde KV.
    // Le webhook stripe sauvegarde aussi le document après paiement.
    if (erpDocument?.metadata?.reference && safeRef) {
      kv.set(safeRef, JSON.stringify({
        ...erpDocument,
        stripe_session_id: session.id,
      }), {
        ex: 60 * 60 * 24 * 180, // 180 jours
      }).catch(kvErr => console.error('KV pre-save error:', kvErr.message));
    }

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
