// Vercel Function — request-deletion
// Reçoit une demande de suppression RGPD (droit à l'effacement).
// Génère un token de confirmation UUID → stocké dans KV (TTL 1h)
// → envoie un email avec le lien de confirmation à l'adresse fournie.
// Répond toujours { sent: true } (sécurité — ne révèle pas si l'email existe en base).
//
// Variables d'environnement requises :
//   RESEND_API_KEY, RESEND_FROM_EMAIL, VERCEL_PROJECT_PRODUCTION_URL, KV_*

import { kv } from '@vercel/kv';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email requis' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // ─── Rate limiting : 3 demandes / heure / email ───────────────────────────
  try {
    await kv.set(`rate:deletion:${normalizedEmail}`, 0, { nx: true, ex: 3600 });
    const count = await kv.incr(`rate:deletion:${normalizedEmail}`);
    if (count > 3) {
      return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans une heure.' });
    }
  } catch { /* non bloquant */ }

  // ─── Générer et stocker le token de suppression (TTL 1h) ─────────────────
  const token = randomUUID();
  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://edl-diagnostic-erp.fr';
  const confirmUrl = `${baseUrl}/api/confirm-deletion?token=${token}`;

  try {
    await kv.set(`delete:token:${token}`, normalizedEmail, { ex: 3600 });
  } catch (err) {
    console.error('request-deletion: KV error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }

  // ─── Envoi email de confirmation ──────────────────────────────────────────
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
              Vos données dans le navigateur (localStorage) devront être effacées manuellement depuis les paramètres du navigateur.
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
      console.error('request-deletion: email error:', err.message);
      // Non bloquant — on répond quand même { sent: true }
    }
  }

  // Toujours répondre sent:true (sécurité — ne révèle pas si l'email existe)
  return res.status(200).json({ sent: true });
}
