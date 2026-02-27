// Vercel Function — pro-account
// Retourne les crédits et la liste des ERPs du compte pro authentifié.
// Auth : Authorization: Bearer <token>
import { kv } from '@vercel/kv';

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const email = await verifyProToken(token);
  if (!email) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  // ─── Crédits ─────────────────────────────────────────────────────────────
  let credits = 0;
  let used = 0;
  let packs = [];
  try {
    const raw = await kv.get(`pro:credits:${email}`);
    if (raw) {
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      credits = data.credits ?? 0;
      used = data.used ?? 0;
      packs = data.packs ?? [];
    }
  } catch (err) {
    console.error('pro-account: credits error:', err.message);
  }

  // ─── Liste des ERPs ───────────────────────────────────────────────────────
  let erpRefs = [];
  try {
    const raw = await kv.get(`pro:erps:${email}`);
    if (raw) {
      erpRefs = typeof raw === 'string' ? JSON.parse(raw) : raw;
    }
  } catch (err) {
    console.error('pro-account: erps list error:', err.message);
  }

  const erps = [];
  for (const ref of erpRefs.slice(0, 50)) {
    try {
      const docRaw = await kv.get(ref);
      if (!docRaw) continue;
      const doc = typeof docRaw === 'string' ? JSON.parse(docRaw) : docRaw;
      erps.push({
        ref,
        adresse: doc.bien?.adresse_complete || 'Adresse inconnue',
        commune: doc.bien?.commune || '',
        date: doc.metadata?.date_realisation || null,
      });
    } catch {
      // doc corrompu — ignoré
    }
  }

  return res.status(200).json({ email, credits, used, packs, erps });
}
