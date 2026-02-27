// Vercel Function — pro-use-credit
// Déduit 1 crédit du compte pro et sauvegarde le document ERP dans KV.
// Ordre des opérations (garde-fous) :
//   1. Vérifier les crédits (lecture seule)
//   2. Sauvegarder le doc ERP → si KV plante ici, 0 crédit perdu
//   3. Décrémenter le crédit → si KV plante ici, l'ERP existe déjà (acceptable)
//   4. Mettre à jour la liste ERPs (non bloquant)
// Auth : token dans le body
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, erpDocument } = req.body || {};

  if (!erpDocument?.metadata?.reference) {
    return res.status(400).json({ error: 'Document ERP invalide' });
  }

  const email = await verifyProToken(token);
  if (!email) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  // Validation référence (UUID v4)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const reference = erpDocument.metadata.reference;
  if (!uuidRegex.test(reference)) {
    return res.status(400).json({ error: 'Référence document invalide' });
  }

  // ─── Verrou distribué pour éviter la race condition ─────────────────────
  const credKey = `pro:credits:${email}`;
  const lockKey = `pro:lock:credit:${email}`;
  let lockAcquired = false;
  try {
    lockAcquired = await kv.set(lockKey, '1', { nx: true, ex: 10 });
  } catch (err) {
    console.error('pro-use-credit: lock error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
  if (!lockAcquired) {
    return res.status(409).json({ error: 'Requête déjà en cours. Réessayez dans quelques secondes.' });
  }

  try {
    // ─── 1. Lire les crédits (sans encore décrémenter) ───────────────────
    let creditData;
    try {
      const raw = await kv.get(credKey);
      creditData = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : { credits: 0, used: 0, packs: [] };
    } catch (err) {
      console.error('pro-use-credit: credits read error:', err.message);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (creditData.credits <= 0) {
      return res.status(402).json({ error: 'Crédits insuffisants. Rechargez votre compte.' });
    }

    // ─── 2. Sauvegarder le doc ERP EN PREMIER ────────────────────────────
    // Si cette étape échoue → on retourne 500, aucun crédit n'est débité.
    try {
      await kv.set(reference, JSON.stringify({
        ...erpDocument,
        paid: true,
        pro_email: email,
        email_sent: false,
        stripe_session_id: null,
        customer_email: null,
      }), {
        ex: 60 * 60 * 24 * 180, // 180 jours
      });
    } catch (err) {
      console.error('pro-use-credit: doc save error:', err.message);
      return res.status(500).json({ error: 'Erreur lors de la sauvegarde du document. Réessayez.' });
    }

    // ─── 3. Décrémenter le crédit APRÈS la sauvegarde du doc ─────────────
    // Si cette étape échoue → l'ERP est déjà sauvegardé, le client peut y accéder.
    // Pire cas : 1 crédit non débité (acceptable — pas de perte pour le pro).
    creditData.credits -= 1;
    creditData.used = (creditData.used || 0) + 1;
    try {
      await kv.set(credKey, JSON.stringify(creditData), { ex: 60 * 60 * 24 * 365 });
    } catch (err) {
      console.error('pro-use-credit: credits write error:', err.message);
      // Non bloquant — l'ERP est sauvegardé, on retourne succès même si le décompte échoue
    }

    // ─── 4. Mettre à jour la liste pro:erps:{email} (non bloquant) ───────
    try {
      const erpsKey = `pro:erps:${email}`;
      const raw = await kv.get(erpsKey);
      const refs = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
      if (!refs.includes(reference)) {
        refs.unshift(reference);
        await kv.set(erpsKey, JSON.stringify(refs.slice(0, 100)), {
          ex: 60 * 60 * 24 * 365,
        });
      }
    } catch (err) {
      console.error('pro-use-credit: erps list error:', err.message);
      // Non bloquant — l'ERP est accessible via /apercu?ref=
    }

    return res.status(200).json({
      success: true,
      credits_remaining: creditData.credits,
    });

  } finally {
    await kv.del(lockKey).catch(() => {});
  }
}
