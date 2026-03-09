// Vercel Function — add-credits
// Endpoint appelé par la marketplace après chaque achat de lead.
// Ajoute des crédits ERP au compte pro du diagnostiqueur.
//
// Sécurité :
//   - Clé secrète partagée MARKETPLACE_SECRET (variable d'env Vercel)
//   - Idempotence : marketplace_ref unique → pas de double crédit
//   - Validation stricte des inputs
//
// Variables d'environnement requises :
//   MARKETPLACE_SECRET  → clé secrète partagée avec la marketplace (UUID ou string aléatoire)
//   KV_REST_API_URL + KV_REST_API_TOKEN → Vercel KV
//
// Appel depuis la marketplace :
//   POST https://edl-diagnostic-erp.fr/api/add-credits
//   Headers: { "X-Marketplace-Secret": "<secret>", "Content-Type": "application/json" }
//   Body: { "pro_email": "diag@exemple.fr", "qty": 1, "marketplace_ref": "lead_abc123" }
//
// Réponse succès :
//   { "success": true, "credits_total": 5, "credits_added": 1 }

import { kv } from '@vercel/kv';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ─── Auth : clé secrète ───────────────────────────────────────────────────
  const secret = process.env.MARKETPLACE_SECRET;
  if (!secret) {
    console.error('add-credits: MARKETPLACE_SECRET non configuré');
    return res.status(500).json({ error: 'Configuration serveur incomplète' });
  }

  const providedSecret = req.headers['x-marketplace-secret'];
  if (!providedSecret || providedSecret !== secret) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  // ─── Validation inputs ────────────────────────────────────────────────────
  const { pro_email, qty, marketplace_ref } = req.body || {};

  if (!pro_email || typeof pro_email !== 'string') {
    return res.status(400).json({ error: 'pro_email requis' });
  }

  const email = pro_email.toLowerCase().trim();
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'pro_email invalide' });
  }

  const quantity = parseInt(qty, 10);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    return res.status(400).json({ error: 'qty invalide (entier entre 1 et 100)' });
  }

  if (!marketplace_ref || typeof marketplace_ref !== 'string' || marketplace_ref.length > 128) {
    return res.status(400).json({ error: 'marketplace_ref requis (max 128 chars)' });
  }

  // ─── Idempotence : éviter les doublons ────────────────────────────────────
  const idempotencyKey = `marketplace:ref:${marketplace_ref}`;
  try {
    const alreadyProcessed = await kv.get(idempotencyKey);
    if (alreadyProcessed) {
      console.log(`add-credits: marketplace_ref ${marketplace_ref} déjà traité — skip`);
      const raw = await kv.get(`pro:credits:${email}`);
      const current = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : { credits: 0 };
      return res.status(200).json({
        success: true,
        already_processed: true,
        credits_total: current.credits ?? 0,
        credits_added: 0,
      });
    }
  } catch (err) {
    console.error('add-credits: idempotency check error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }

  // ─── Lire et mettre à jour les crédits ───────────────────────────────────
  const credKey = `pro:credits:${email}`;
  let creditData;
  try {
    const raw = await kv.get(credKey);
    creditData = raw
      ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
      : { credits: 0, used: 0, packs: [] };
  } catch (err) {
    console.error('add-credits: credits read error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }

  creditData.credits = (creditData.credits || 0) + quantity;
  creditData.packs = [
    {
      qty: quantity,
      date: new Date().toISOString(),
      stripe_id: null,
      marketplace_ref,
      amount_ttc: null,
      currency: null,
    },
    ...(creditData.packs || []),
  ].slice(0, 200); // max 200 entrées dans l'historique

  try {
    await kv.set(credKey, JSON.stringify(creditData), { ex: 60 * 60 * 24 * 365 });
  } catch (err) {
    console.error('add-credits: credits write error:', err.message);
    return res.status(500).json({ error: 'Erreur lors de la mise à jour des crédits' });
  }

  // ─── Marquer la ref comme traitée (TTL 1 an) ─────────────────────────────
  try {
    await kv.set(idempotencyKey, JSON.stringify({
      email,
      qty: quantity,
      processed_at: new Date().toISOString(),
    }), { ex: 60 * 60 * 24 * 365 });
  } catch (err) {
    // Non bloquant — les crédits sont déjà ajoutés
    console.error('add-credits: idempotency key write error:', err.message);
  }

  console.log(`add-credits: +${quantity} crédit(s) → ${email} (ref: ${marketplace_ref})`);

  return res.status(200).json({
    success: true,
    credits_total: creditData.credits,
    credits_added: quantity,
  });
}
