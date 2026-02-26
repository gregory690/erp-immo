// Vercel Function — get-erp-document
// Récupère un document ERP depuis Vercel KV via sa référence.
// Vérifie que le paiement a bien été effectué avant de délivrer le document.
// Paramètre GET : ?ref=<erp_reference>
import Stripe from 'stripe';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ref } = req.query;

  if (!ref) {
    return res.status(400).json({ error: 'Paramètre ref manquant' });
  }

  let data;
  try {
    data = await kv.get(ref);
  } catch (err) {
    console.error('KV get error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }

  if (!data) {
    return res.status(404).json({ error: 'Document introuvable ou expiré' });
  }

  const doc = typeof data === 'string' ? JSON.parse(data) : data;

  // ─── Vérification du paiement ────────────────────────────────────────────────
  //
  // Cas 1 : webhook déjà passé → paid:true dans KV → livraison directe
  if (doc.paid === true) {
    return res.status(200).json(sanitizeDoc(doc));
  }

  // Cas 2 : doc sans stripe_session_id (créé avant cette mise à jour)
  // → comportement legacy, on le délivre pour ne pas bloquer d'anciens clients
  if (!doc.stripe_session_id) {
    return res.status(200).json(sanitizeDoc(doc));
  }

  // Cas 3 : webhook pas encore passé → vérification directe auprès de Stripe
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('STRIPE_SECRET_KEY manquante dans get-erp-document');
    return res.status(500).json({ error: 'Configuration serveur incomplète' });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

  try {
    const session = await stripe.checkout.sessions.retrieve(doc.stripe_session_id);

    if (session.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Paiement non confirmé' });
    }

    // Paiement confirmé → mettre à jour KV pour les prochaines requêtes
    try {
      await kv.set(ref, JSON.stringify({ ...doc, paid: true }), {
        ex: 60 * 60 * 24 * 180,
      });
    } catch (err) {
      // Non bloquant
    }

    return res.status(200).json(sanitizeDoc(doc));
  } catch (err) {
    console.error('Stripe verification error:', err.message);
    return res.status(500).json({ error: 'Erreur lors de la vérification du paiement' });
  }
}

// Retire les champs internes avant d'envoyer le document au client
function sanitizeDoc(doc) {
  const { paid, email_sent, stripe_session_id, ...safeDoc } = doc;
  return safeDoc;
}
