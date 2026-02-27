// Vercel Function — stripe-webhook
// Écoute l'événement checkout.session.completed de Stripe.
// Marque le document ERP comme payé dans KV et stocke l'email du client.
// L'envoi d'email est déclenché par la page /apercu (côté client) via send-erp-email.js,
// qui s'exécute de façon synchrone sans risque de timeout Vercel.
//
// Variables d'environnement requises :
//   STRIPE_SECRET_KEY               → clé secrète Stripe (sk_live_...)
//   STRIPE_WEBHOOK_SECRET           → dashboard Stripe → Developers → Webhooks → Signing secret
//   KV_REST_API_URL + KV_REST_API_TOKEN → Upstash KV
//
// Configuration Stripe :
//   Dashboard → Developers → Webhooks → Add endpoint
//   URL : https://<votre-domaine>/api/stripe-webhook
//   Event : checkout.session.completed

import Stripe from 'stripe';
import { kv } from '@vercel/kv';

// Désactiver le body parser Vercel pour pouvoir vérifier la signature Stripe
// sur le payload brut (obligatoire pour stripe.webhooks.constructEvent)
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    console.error('STRIPE_SECRET_KEY ou STRIPE_WEBHOOK_SECRET manquante');
    return res.status(500).json({ error: 'Configuration serveur incomplète' });
  }

  // ─── Lire le body brut (nécessaire pour la vérification de signature) ────────
  let rawBody;
  try {
    rawBody = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
  } catch (err) {
    console.error('Webhook: erreur lecture body:', err.message);
    return res.status(400).json({ error: 'Impossible de lire le payload' });
  }

  // ─── Vérifier la signature Stripe ────────────────────────────────────────────
  const signature = req.headers['stripe-signature'];
  if (!signature) {
    console.error('Webhook: en-tête stripe-signature absent');
    return res.status(400).json({ error: 'Signature manquante' });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook: signature invalide:', err.message);
    return res.status(400).json({ error: 'Signature webhook invalide' });
  }

  // On ne traite que les paiements complétés
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const sessionId = event.data.object.id;

  // Vérification supplémentaire : récupérer la session depuis l'API Stripe
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error('Webhook: impossible de récupérer la session Stripe:', err.message);
    return res.status(200).json({ received: true });
  }

  if (session.payment_status !== 'paid') {
    return res.status(200).json({ received: true });
  }

  // ─── Branche pro_pack ────────────────────────────────────────────────────────
  const sessionType = session.metadata?.type;
  if (sessionType === 'pro_pack') {
    const proEmail = session.metadata?.pro_email?.toLowerCase().trim();
    const packQty = parseInt(session.metadata?.pack_qty || '0', 10);
    if (proEmail && packQty > 0) {
      try {
        const credKey = `pro:credits:${proEmail}`;
        const raw = await kv.get(credKey);
        const current = raw
          ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
          : { credits: 0, used: 0, packs: [] };
        current.credits += packQty;
        current.packs = [
          { qty: packQty, date: new Date().toISOString(), stripe_id: sessionId },
          ...(current.packs || []),
        ];
        await kv.set(credKey, JSON.stringify(current), { ex: 60 * 60 * 24 * 365 });
        console.log(`Webhook: pro_pack ${packQty} crédits ajoutés pour ${proEmail}`);
      } catch (err) {
        console.error('Webhook: pro_pack KV error:', err.message);
      }
    }
    return res.status(200).json({ received: true });
  }

  const customerEmail = session.customer_details?.email;
  const erpRef = session.metadata?.erp_reference;

  if (!customerEmail || !erpRef) {
    console.warn('Webhook: email ou référence ERP absent de la session', { customerEmail, erpRef });
    return res.status(200).json({ received: true });
  }

  // ─── Marquer le document comme payé et stocker l'email client dans KV ────────
  // L'envoi d'email (PDF inclus) est géré de façon synchrone par la page /apercu
  // via l'endpoint send-erp-email.js — pas de risque de timeout ici.
  try {
    const raw = await kv.get(erpRef);
    const existingDoc = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
    await kv.set(erpRef, JSON.stringify({
      ...existingDoc,
      paid: true,
      customer_email: customerEmail,
    }), {
      ex: 60 * 60 * 24 * 180, // 180 jours
    });
    console.log(`Webhook: document ${erpRef} marqué payé, email client stocké`);

    // Index email → [ref1, ref2, ...] pour la récupération de commande perdue
    try {
      const emailKey = `email:${customerEmail.toLowerCase()}`;
      const existing = await kv.get(emailKey);
      const refs = existing ? (typeof existing === 'string' ? JSON.parse(existing) : existing) : [];
      if (!refs.includes(erpRef)) {
        refs.unshift(erpRef);
        await kv.set(emailKey, JSON.stringify(refs.slice(0, 20)), {
          ex: 60 * 60 * 24 * 180,
        });
      }
    } catch (err) {
      console.error('Webhook: email index error:', err.message);
    }
  } catch (err) {
    console.error('Webhook: KV update error:', err.message);
  }

  return res.status(200).json({ received: true });
}
