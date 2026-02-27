// Vercel Function — admin-lookup
// Recherche des ERPs par email ou par référence. Réservé à l'usage interne.
// Protégé par ADMIN_PASSWORD (variable d'environnement Vercel).
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('admin-lookup: ADMIN_PASSWORD non configuré');
    return res.status(500).json({ error: 'Configuration serveur incomplète' });
  }

  // ─── Rate limiting — 10 tentatives / 5 min / IP ─────────────────────────
  try {
    const ip = ((req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown') + '').split(',')[0].trim();
    const rateKey = `rate:admin:${ip}`;
    await kv.set(rateKey, 0, { nx: true, ex: 300 });
    const count = await kv.incr(rateKey);
    if (count > 10) {
      return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 5 minutes.' });
    }
  } catch {
    // Non bloquant
  }

  const { password, email, ref } = req.body || {};

  if (!password || password !== adminPassword) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }

  // ─── Recherche par référence UUID ────────────────────────────────────────
  if (ref) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(ref)) {
      return res.status(400).json({ error: 'Référence invalide' });
    }

    try {
      const raw = await kv.get(ref);
      if (!raw) return res.status(404).json({ erps: [] });
      const doc = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return res.status(200).json({
        erps: [{
          ref,
          adresse: doc.bien?.adresse_complete || 'Inconnu',
          commune: doc.bien?.commune || '',
          date: doc.metadata?.date_realisation || null,
          paid: !!doc.paid,
          email: doc.customer_email || null,
        }],
      });
    } catch (err) {
      console.error('admin-lookup ref error:', err.message);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // ─── Recherche par email ──────────────────────────────────────────────────
  if (email) {
    const normalizedEmail = email.toLowerCase().trim();
    try {
      const raw = await kv.get(`email:${normalizedEmail}`);
      const refs = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];

      const erps = [];
      for (const r of refs.slice(0, 20)) {
        try {
          const docRaw = await kv.get(r);
          if (!docRaw) continue;
          const doc = typeof docRaw === 'string' ? JSON.parse(docRaw) : docRaw;
          erps.push({
            ref: r,
            adresse: doc.bien?.adresse_complete || 'Inconnu',
            commune: doc.bien?.commune || '',
            date: doc.metadata?.date_realisation || null,
            paid: !!doc.paid,
            email: doc.customer_email || normalizedEmail,
          });
        } catch { /* doc corrompu — ignoré */ }
      }

      return res.status(200).json({ erps });
    } catch (err) {
      console.error('admin-lookup email error:', err.message);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(400).json({ error: 'email ou ref requis' });
}
