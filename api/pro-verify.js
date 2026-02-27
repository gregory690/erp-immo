// Vercel Function — pro-verify
// Valide un magic link token. Si valide :
//   - supprime le token du magic link (usage unique, exposé dans l'URL)
//   - génère un NOUVEAU token UUID pour la session longue (24h)
//   - renvoie { email, sessionToken }
// Le token du magic link est ainsi différent du token de session stocké en localStorage,
// ce qui évite l'exposition de la session via l'historique navigateur / logs.
import { kv } from '@vercel/kv';
import { randomUUID } from 'crypto';

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

  const magicLinkKey = `pro:session:${token}`;

  let sessionData;
  try {
    const raw = await kv.get(magicLinkKey);
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

  // Générer un nouveau token distinct pour la session longue (24h)
  // Le token du magic link (dans l'URL / historique) est supprimé immédiatement.
  const sessionToken = randomUUID();
  try {
    await kv.del(magicLinkKey);
    await kv.set(`pro:session:${sessionToken}`, JSON.stringify({ email }), {
      ex: 60 * 60 * 24, // 24h
    });
  } catch (err) {
    console.error('pro-verify: KV rotate error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }

  return res.status(200).json({ email, sessionToken });
}
