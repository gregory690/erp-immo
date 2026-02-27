// Vercel Function — pro-verify
// Valide un magic link token. Si valide :
//   - supprime l'entrée de session (usage unique)
//   - recrée la session avec TTL 24h (session longue)
//   - renvoie { email }
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body || {};

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token requis' });
  }

  // Validation format UUID v4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    return res.status(401).json({ error: 'Token invalide' });
  }

  const sessionKey = `pro:session:${token}`;

  let sessionData;
  try {
    const raw = await kv.get(sessionKey);
    if (!raw) {
      return res.status(401).json({ error: 'Lien expiré ou déjà utilisé' });
    }
    sessionData = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (err) {
    console.error('pro-verify: KV get error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }

  const { email } = sessionData;
  if (!email) {
    return res.status(401).json({ error: 'Session invalide' });
  }

  // Supprimer le token à usage unique, puis recrée avec TTL 24h
  try {
    await kv.del(sessionKey);
    await kv.set(sessionKey, JSON.stringify({ email }), {
      ex: 60 * 60 * 24, // 24h
    });
  } catch (err) {
    console.error('pro-verify: KV rotate error:', err.message);
    // Non bloquant — on renvoie quand même l'email
  }

  return res.status(200).json({ email });
}
