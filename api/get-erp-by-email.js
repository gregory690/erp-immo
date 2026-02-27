// Vercel Function — get-erp-by-email
// Récupère la liste des ERPs payés associés à une adresse email.
// Utilisé par la page /apercu pour la récupération de commande perdue.
// Rate-limité à 5 tentatives/minute/email pour éviter l'énumération.
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // ─── Rate limiting — 5 tentatives/minute/email ───────────────────────────
  try {
    const rateKey = `rate:email:${normalizedEmail}`;
    const count = await kv.incr(rateKey);
    if (count === 1) await kv.expire(rateKey, 60);
    if (count > 5) {
      return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans une minute.' });
    }
  } catch {
    // Non bloquant
  }

  // ─── Récupérer les refs associées à cet email ─────────────────────────────
  let refs = [];
  try {
    const raw = await kv.get(`email:${normalizedEmail}`);
    refs = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
  } catch {
    return res.status(500).json({ error: 'Erreur serveur' });
  }

  if (!refs.length) {
    return res.status(200).json({ erps: [] });
  }

  // ─── Récupérer les métadonnées de chaque ERP (max 10) ────────────────────
  const erps = [];
  for (const ref of refs.slice(0, 10)) {
    try {
      const raw = await kv.get(ref);
      if (!raw) continue;
      const doc = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!doc.paid) continue; // ne montrer que les docs payés
      erps.push({
        ref,
        adresse: doc.bien?.adresse_complete || '',
        commune: doc.bien?.commune || '',
        date: doc.metadata?.date_realisation || '',
        validite: doc.metadata?.validite_jusqu_au || '',
      });
    } catch {
      // Ignorer les docs corrompus ou expirés
    }
  }

  return res.status(200).json({ erps });
}
