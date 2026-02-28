// Vercel Function — confirm-deletion
// Confirme et exécute la suppression RGPD après clic sur le lien email.
// Données supprimées :
//   - Documents ERP (toutes les refs liées à l'email via l'index email:{email})
//   - Index email → refs  (email:{email})
//   - Compte Pro : crédits (pro:credits:{email}) + liste ERPs (pro:erps:{email})
// Note : les sessions Pro (pro:session:{token}) expirent naturellement sous 24h.
//        Les tokens ne sont pas indexés par email donc non supprimables directement.
//
// Redirige vers /confidentialite?deleted=1 (succès) ou ?delete_error=... (erreur)

import { kv } from '@vercel/kv';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = (req.query.token || '').trim();

  if (!UUID_REGEX.test(token)) {
    return res.redirect(302, '/confidentialite?delete_error=invalid');
  }

  // ─── Récupérer l'email associé au token ───────────────────────────────────
  const tokenKey = `delete:token:${token}`;
  let email;
  try {
    const raw = await kv.get(tokenKey);
    email = raw ? String(raw).toLowerCase().trim() : null;
  } catch (err) {
    console.error('confirm-deletion: KV get error:', err.message);
    return res.redirect(302, '/confidentialite?delete_error=server');
  }

  if (!email) {
    // Token expiré ou inconnu
    return res.redirect(302, '/confidentialite?delete_error=expired');
  }

  // Consommer le token (usage unique)
  try { await kv.del(tokenKey); } catch { /* non bloquant */ }

  const errors = [];

  // ─── 1. ERPs B2C via l'index email → refs ─────────────────────────────────
  try {
    const indexKey = `email:${email}`;
    const raw = await kv.get(indexKey);
    const refs = Array.isArray(raw)
      ? raw
      : (typeof raw === 'string' ? JSON.parse(raw) : []);

    // Supprimer chaque document ERP (uniquement si UUID valide — sécurité)
    const validRefs = refs.filter(ref => UUID_REGEX.test(ref));
    if (validRefs.length > 0) {
      await Promise.allSettled(validRefs.map(ref => kv.del(ref)));
    }

    // Supprimer l'index lui-même
    await kv.del(indexKey);
    console.log(`confirm-deletion: deleted ${validRefs.length} ERP(s) for ${email}`);
  } catch (err) {
    errors.push('erp');
    console.error('confirm-deletion: ERP deletion error:', err.message);
  }

  // ─── 2. Données Pro ────────────────────────────────────────────────────────
  try {
    // Lire la liste des ERPs Pro pour supprimer chaque document
    const proErpsRaw = await kv.get(`pro:erps:${email}`);
    const proErpRefs = Array.isArray(proErpsRaw)
      ? proErpsRaw
      : (typeof proErpsRaw === 'string' ? JSON.parse(proErpsRaw) : []);

    const validProRefs = proErpRefs.filter(ref => UUID_REGEX.test(ref));
    if (validProRefs.length > 0) {
      await Promise.allSettled(validProRefs.map(ref => kv.del(ref)));
    }

    // Supprimer les clés Pro principales
    await Promise.allSettled([
      kv.del(`pro:credits:${email}`),
      kv.del(`pro:erps:${email}`),
    ]);
    console.log(`confirm-deletion: deleted pro data + ${validProRefs.length} pro ERP(s) for ${email}`);
  } catch (err) {
    errors.push('pro');
    console.error('confirm-deletion: pro deletion error:', err.message);
  }

  // ─── Redirection finale ────────────────────────────────────────────────────
  if (errors.length > 0) {
    // Suppression partielle — on redirige quand même, les données critiques
    // (documents ERP) sont supprimées en priorité
    return res.redirect(302, '/confidentialite?deleted=1&warn=partial');
  }

  return res.redirect(302, '/confidentialite?deleted=1');
}
