// Vercel Function — data-deletion
// Gère le droit à l'effacement RGPD en deux opérations sur le même endpoint :
//
//   POST { email }            → génère un token UUID → KV (TTL 1h) → envoie email de confirmation
//   GET  ?token=<uuid>        → valide le token → supprime toutes les données → redirige
//
// Données supprimées (GET) :
//   - Documents ERP B2C (refs indexées via email:{email})
//   - Index email → refs
//   - Données Pro : pro:credits:{email} + pro:erps:{email} + documents ERP Pro
// Note : sessions Pro (pro:session:{token}) expirent naturellement sous 24h.
//
// Variables d'environnement requises :
//   RESEND_API_KEY, RESEND_FROM_EMAIL, VERCEL_PROJECT_PRODUCTION_URL, KV_*

import { kv } from '@vercel/kv';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {

  // ══════════════════════════════════════════════════════════════════
  // GET ?token=... — Confirmation et exécution de la suppression
  // ══════════════════════════════════════════════════════════════════
  if (req.method === 'GET') {
    const token = (req.query.token || '').trim();

    if (!UUID_REGEX.test(token)) {
      return res.redirect(302, '/confidentialite?delete_error=invalid');
    }

    // Récupérer l'email associé au token
    const tokenKey = `delete:token:${token}`;
    let email;
    try {
      const raw = await kv.get(tokenKey);
      email = raw ? String(raw).toLowerCase().trim() : null;
    } catch (err) {
      console.error('data-deletion GET: KV get error:', err.message);
      return res.redirect(302, '/confidentialite?delete_error=server');
    }

    if (!email) {
      return res.redirect(302, '/confidentialite?delete_error=expired');
    }

    // Consommer le token (usage unique) avant toute suppression
    try { await kv.del(tokenKey); } catch { /* non bloquant */ }

    const errors = [];

    // ── 1. ERPs B2C via l'index email → refs ──────────────────────
    try {
      const indexKey = `email:${email}`;
      const raw = await kv.get(indexKey);
      const refs = Array.isArray(raw)
        ? raw
        : (typeof raw === 'string' ? JSON.parse(raw) : []);

      const validRefs = refs.filter(ref => UUID_REGEX.test(ref));
      if (validRefs.length > 0) {
        await Promise.allSettled(validRefs.map(ref => kv.del(ref)));
      }
      await kv.del(indexKey);
      console.log(`data-deletion: deleted ${validRefs.length} B2C ERP(s) for ${email}`);
    } catch (err) {
      errors.push('erp');
      console.error('data-deletion: ERP deletion error:', err.message);
    }

    // ── 2. Données Pro ─────────────────────────────────────────────
    try {
      const proErpsRaw = await kv.get(`pro:erps:${email}`);
      const proErpRefs = Array.isArray(proErpsRaw)
        ? proErpsRaw
        : (typeof proErpsRaw === 'string' ? JSON.parse(proErpsRaw) : []);

      const validProRefs = proErpRefs.filter(ref => UUID_REGEX.test(ref));
      if (validProRefs.length > 0) {
        await Promise.allSettled(validProRefs.map(ref => kv.del(ref)));
      }
      await Promise.allSettled([
        kv.del(`pro:credits:${email}`),
        kv.del(`pro:erps:${email}`),
      ]);
      console.log(`data-deletion: deleted pro data + ${validProRefs.length} pro ERP(s) for ${email}`);
    } catch (err) {
      errors.push('pro');
      console.error('data-deletion: pro deletion error:', err.message);
    }

    if (errors.length > 0) {
      return res.redirect(302, '/confidentialite?deleted=1&warn=partial');
    }
    return res.redirect(302, '/confidentialite?deleted=1');
  }

  // ══════════════════════════════════════════════════════════════════
  // POST { email } — Demande de suppression → envoi email de confirmation
  // ══════════════════════════════════════════════════════════════════
  if (req.method === 'POST') {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email requis' });

    if (!EMAIL_REGEX.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting : 3 demandes / heure / email
    try {
      await kv.set(`rate:deletion:${normalizedEmail}`, 0, { nx: true, ex: 3600 });
      const count = await kv.incr(`rate:deletion:${normalizedEmail}`);
      if (count > 3) {
        return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans une heure.' });
      }
    } catch { /* non bloquant */ }

    // Générer et stocker le token (TTL 1h)
    const token = randomUUID();
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'https://edl-diagnostic-erp.fr';
    const confirmUrl = `${baseUrl}/api/data-deletion?token=${token}`;

    try {
      await kv.set(`delete:token:${token}`, normalizedEmail, { ex: 3600 });
    } catch (err) {
      console.error('data-deletion POST: KV error:', err.message);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    // Envoi email de confirmation
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'erp@edletdiagnostic.fr';

    if (resendKey) {
      const resend = new Resend(resendKey);
      try {
        await resend.emails.send({
          from: `EDL&DIAGNOSTIC <${fromEmail}>`,
          to: normalizedEmail,
          subject: 'Confirmation de suppression de vos données — EDL&DIAGNOSTIC',
          html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;padding:40px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
      <tr>
        <td style="background:#fff;border-top:3px solid #1a3a5c;padding:36px;">
          <p style="margin:0 0 6px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Droit à l'effacement — RGPD</p>
          <p style="margin:0 0 24px;font-size:22px;font-weight:800;color:#111827;line-height:1.2;">Confirmer la suppression de vos données</p>
          <p style="font-size:14px;color:#374151;margin:0 0 20px;line-height:1.6;">
            Vous avez demandé la suppression de toutes les données associées à l'adresse
            <strong>${normalizedEmail}</strong> sur <strong>edl-diagnostic-erp.fr</strong>.
          </p>
          <div style="background:#fef2f2;border-left:3px solid #dc2626;padding:14px 16px;margin-bottom:24px;">
            <p style="margin:0;font-size:13px;color:#7f1d1d;font-weight:700;">Cette action est irréversible.</p>
            <p style="margin:6px 0 0;font-size:12px;color:#991b1b;line-height:1.5;">
              Tous vos ERPs stockés sur nos serveurs et les données associées à cet email seront définitivement supprimés.
            </p>
          </div>
          <a href="${confirmUrl}"
             style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:14px 28px;font-size:14px;font-weight:700;letter-spacing:0.3px;">
            Confirmer la suppression &rarr;
          </a>
          <p style="font-size:11px;color:#9ca3af;margin:24px 0 0;line-height:1.6;">
            Ce lien expire dans <strong>1 heure</strong>.<br>
            Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email — aucune donnée ne sera supprimée.<br><br>
            EDL&amp;DIAGNOSTIC · <a href="mailto:contact@edl-diagnostic-erp.fr" style="color:#6b7280;">contact@edl-diagnostic-erp.fr</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
        });
      } catch (err) {
        console.error('data-deletion POST: email error:', err.message);
        // Non bloquant — on répond quand même { sent: true }
      }
    }

    // Toujours répondre sent:true (sécurité — ne révèle pas si l'email existe)
    return res.status(200).json({ sent: true });
  }

  return res.status(405).end();
}
