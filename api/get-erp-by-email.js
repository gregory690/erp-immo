// Vercel Function — get-erp-by-email
// Envoie par email les liens de récupération des ERPs associés à une adresse.
// Ne retourne JAMAIS les données à l'écran — l'utilisateur doit avoir accès à sa boîte mail.
// Rate-limité à 3 tentatives/5 min/email.
import { kv } from '@vercel/kv';
import { Resend } from 'resend';

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

  // ─── Rate limiting — 3 tentatives / 5 min / email ────────────────────────
  try {
    const rateKey = `rate:recovery:${normalizedEmail}`;
    await kv.set(rateKey, 0, { nx: true, ex: 300 });
    const count = await kv.incr(rateKey);
    if (count > 3) {
      return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 5 minutes.' });
    }
  } catch {
    // Non bloquant
  }

  // ─── Récupérer les refs associées à cet email ────────────────────────────
  let refs = [];
  try {
    const raw = await kv.get(`email:${normalizedEmail}`);
    refs = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
  } catch {
    // Non bloquant — on retourne quand même "envoyé" pour ne pas révéler l'absence
  }

  // ─── Toujours répondre la même chose (sécurité — ne pas révéler si l'email existe) ──
  // Si aucun ERP trouvé, on ne fait rien mais on répond success
  if (!refs.length) {
    return res.status(200).json({ sent: true });
  }

  // ─── Récupérer les métadonnées des ERPs payés ────────────────────────────
  const erps = [];
  for (const ref of refs.slice(0, 10)) {
    try {
      const raw = await kv.get(ref);
      if (!raw) continue;
      const doc = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!doc.paid) continue;
      erps.push({
        ref,
        adresse: doc.bien?.adresse_complete || 'Bien immobilier',
        date: doc.metadata?.date_realisation
          ? new Date(doc.metadata.date_realisation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
          : '',
        validite: doc.metadata?.validite_jusqu_au
          ? new Date(doc.metadata.validite_jusqu_au).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
          : '',
      });
    } catch {
      // Ignorer les docs corrompus
    }
  }

  if (!erps.length) {
    return res.status(200).json({ sent: true });
  }

  // ─── Envoi email via Resend ───────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn('get-erp-by-email: RESEND_API_KEY absente');
    return res.status(200).json({ sent: true });
  }

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.URL || 'http://localhost:3000';

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'erp@edletdiagnostic.fr';

  const erpItems = erps.map(e => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
        <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#111827;">${escapeHtml(e.adresse)}</p>
        <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">Établi le ${escapeHtml(e.date)}${e.validite ? ` · valide jusqu'au ${escapeHtml(e.validite)}` : ''}</p>
        <a href="${baseUrl}/apercu?ref=${encodeURIComponent(e.ref)}"
           style="display:inline-block;background-color:#1a3a5c;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:8px 18px;">
          Accéder à mon ERP &rarr;
        </a>
      </td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="display:none;font-size:1px;max-height:0;overflow:hidden;">Vos liens de récupération ERP</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding:0 0 16px 0;">
            <img src="https://edl-diagnostic-erp.fr/logo-edl.png" alt="EDL&amp;DIAGNOSTIC" width="160" style="display:block;height:auto;border:0;" />
          </td>
        </tr>
        <tr>
          <td style="background-color:#ffffff;border-top:3px solid #1a3a5c;padding:32px 36px;">
            <p style="margin:0 0 6px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Récupération de commande</p>
            <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Vos ERPs disponibles</p>
            <p style="margin:0 0 24px;font-size:13px;color:#6b7280;">Voici les liens pour accéder à vos documents. Ces liens sont permanents.</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${erpItems}
            </table>
            <p style="margin:24px 0 0;font-size:11px;color:#9ca3af;">
              Vous n'avez pas fait cette demande ? Ignorez simplement cet email.<br>
              Question ? <a href="mailto:contact@edl-diagnostic-erp.fr" style="color:#1a3a5c;text-decoration:none;">contact@edl-diagnostic-erp.fr</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 4px 0;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">&copy; ${new Date().getFullYear()} EDL&amp;DIAGNOSTIC &middot; <a href="https://edl-diagnostic-erp.fr" style="color:#9ca3af;text-decoration:none;">edl-diagnostic-erp.fr</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: `EDL&DIAGNOSTIC <${fromEmail}>`,
      to: normalizedEmail,
      subject: 'Récupération de votre ERP — liens d\'accès',
      html,
    });
  } catch (err) {
    console.error('get-erp-by-email: Resend error:', err.message);
    // Non bloquant — on répond success quand même
  }

  return res.status(200).json({ sent: true });
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
