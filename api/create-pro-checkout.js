// Vercel Function — create-pro-checkout
// Crée une Stripe Checkout Session pour l'achat de crédits pro.
// Pack 10 ERPs : 99,99 € TTC · Pack 30 ERPs : 199,99 € TTC
// Auth : token dans le body (pour simplifier l'appel depuis le frontend)
import Stripe from 'stripe';
import { kv } from '@vercel/kv';

const PACKS = {
  pack_10: { qty: 10, amount: 9999, label: 'Pack 10 ERPs' },
  pack_30: { qty: 30, amount: 19999, label: 'Pack 30 ERPs' },
};

async function verifyProToken(token) {
  if (!token) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) return null;
  try {
    const raw = await kv.get(`pro:session:${token}`);
    if (!raw) return null;
    const session = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return session.email || null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pack, token } = req.body || {};

  if (!pack || !PACKS[pack]) {
    return res.status(400).json({ error: 'Pack invalide. Valeurs acceptées : pack_10, pack_30' });
  }

  const email = await verifyProToken(token);
  if (!email) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Configuration serveur incomplète' });
  }

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.URL || 'http://localhost:3000';

  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });
  const { qty, amount, label } = PACKS[pack];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: amount,
          product_data: {
            name: label,
            description: `${qty} crédits ERP · EDL&DIAGNOSTIC Pro`,
          },
        },
        quantity: 1,
      }],
      metadata: {
        type: 'pro_pack',
        pro_email: email,
        pack_qty: String(qty),
      },
      success_url: `${baseUrl}/pro/dashboard?pack_success=1`,
      cancel_url: `${baseUrl}/pro/dashboard`,
      locale: 'fr',
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('create-pro-checkout: Stripe error:', err.message);
    return res.status(500).json({ error: 'Erreur lors de la création du paiement' });
  }
}
