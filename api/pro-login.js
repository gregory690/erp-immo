// Vercel Function — pro-login
// Envoie un magic link par email pour l'espace pro.
// Répond toujours { sent: true } — ne révèle pas si l'email existe déjà.
//
// Variables d'environnement requises :
//   RESEND_API_KEY
//   RESEND_FROM_EMAIL
//   VERCEL_PROJECT_PRODUCTION_URL
import { kv } from '@vercel/kv';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email requis' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Adresse email invalide' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // ─── Rate limiting : 3 tentatives / 10 min / email ───────────────────────
  try {
    const rateKey = `pro:rate:login:${normalizedEmail}`;
    const count = await kv.incr(rateKey);
    if (count === 1) await kv.expire(rateKey, 600);
    if (count > 3) {
      // On répond quand même 200 pour ne pas révéler l'état
      return res.status(200).json({ sent: true });
    }
  } catch {
    // Non bloquant
  }

  // ─── Générer token UUID v4, stocker en KV (TTL 1h) ───────────────────────
  const token = randomUUID();
  try {
    await kv.set(`pro:session:${token}`, JSON.stringify({ email: normalizedEmail, pending: true }), {
      ex: 3600, // 1h pour cliquer le lien
    });
  } catch (err) {
    console.error('pro-login: KV set error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }

  // ─── Construire l'URL du magic link ──────────────────────────────────────
  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.URL || 'http://localhost:3000';
  const magicLink = `${baseUrl}/pro/auth?token=${encodeURIComponent(token)}`;

  // ─── Envoyer l'email via Resend ───────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'erp@edletdiagnostic.fr';
    try {
      await resend.emails.send({
        from: `EDL&DIAGNOSTIC Pro <${fromEmail}>`,
        to: normalizedEmail,
        subject: 'Votre lien de connexion — Espace Pro EDL&DIAGNOSTIC',
        html: buildMagicLinkEmail(magicLink),
      });
    } catch (err) {
      console.error('pro-login: Resend error:', err.message);
      // Non bloquant — on répond quand même 200
    }
  } else {
    console.warn('pro-login: RESEND_API_KEY non configurée. Magic link:', magicLink);
  }

  return res.status(200).json({ sent: true });
}

function buildMagicLinkEmail(magicLink) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;max-width:560px;width:100%">
        <!-- Header -->
        <tr>
          <td style="background:#1a3a5c;padding:28px 32px">
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px">EDL&amp;DIAGNOSTIC <span style="opacity:.6;font-weight:400">·</span> Espace Pro</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 16px;color:#1e293b;font-size:16px;font-weight:600">Votre lien de connexion</p>
            <p style="margin:0 0 28px;color:#64748b;font-size:14px;line-height:1.6">
              Cliquez sur le bouton ci-dessous pour accéder à votre espace professionnel.<br>
              Ce lien est valable <strong>1 heure</strong> et ne peut être utilisé qu'une seule fois.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1a3a5c;border-radius:8px">
                  <a href="${magicLink}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:-0.2px">
                    Accéder à mon espace pro →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.5">
              Si vous n'avez pas demandé ce lien, ignorez cet email.<br>
              Lien direct : <a href="${magicLink}" style="color:#1a3a5c">${magicLink}</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f1f5f9">
            <p style="margin:0;color:#94a3b8;font-size:11px">EDL&amp;DIAGNOSTIC — Usage professionnel · Ce message est confidentiel</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
