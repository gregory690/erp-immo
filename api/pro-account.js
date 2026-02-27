// Vercel Function — pro-account
// Retourne les crédits et la liste des ERPs du compte pro authentifié.
// Auth : Authorization: Bearer <token>
import { kv } from '@vercel/kv';
import { Resend } from 'resend';

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
        validite: doc.metadata?.validite_jusqu_au || null,
      });
    } catch {
      // doc corrompu — ignoré
    }
  }

  // ─── Notifications expiration (non-bloquant) ──────────────────────────────
  // Envoie un email si un ERP expire dans ≤ 30 jours et n'a pas encore été notifié.
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'erp@edletdiagnostic.fr';
  if (resendApiKey) {
    const resend = new Resend(resendApiKey);
    const now = Date.now();
    const toNotify = erps.filter(erp => {
      if (!erp.validite) return false;
      const daysLeft = Math.ceil((new Date(erp.validite).getTime() - now) / 86400000);
      return daysLeft > 0 && daysLeft <= 30;
    });

    if (toNotify.length > 0) {
      Promise.allSettled(toNotify.map(async erp => {
        const notifKey = `pro:notified:expiry:${email}:${erp.ref}`;
        try {
          const alreadyNotified = await kv.get(notifKey);
          if (alreadyNotified) return;

          const daysLeft = Math.ceil((new Date(erp.validite).getTime() - now) / 86400000);
          await resend.emails.send({
            from: `EDL&DIAGNOSTIC Pro <${fromEmail}>`,
            to: email,
            subject: `⚠ ERP bientôt expiré — ${erp.adresse}`,
            html: `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;background:#f4f4f5;padding:32px 16px;">
<div style="max-width:520px;margin:0 auto;background:#fff;border-top:3px solid #1a3a5c;padding:32px;">
<p style="margin:0 0 6px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;">Alerte expiration</p>
<p style="margin:0 0 20px;font-size:22px;font-weight:800;color:#111827;">Votre ERP expire bientôt</p>
<div style="border:1px solid #fbbf24;background:#fffbeb;padding:14px 16px;margin-bottom:20px;">
  <p style="margin:0;font-size:14px;font-weight:700;color:#92400e;">Ce document expire dans <strong>${daysLeft} jour${daysLeft > 1 ? 's' : ''}</strong></p>
</div>
<p style="font-size:14px;color:#374151;font-weight:600;">${erp.adresse}</p>
<p style="font-size:13px;color:#6b7280;">${erp.commune || ''}</p>
<p style="font-size:12px;color:#9ca3af;margin-top:16px;">Date d'expiration : ${new Date(erp.validite).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
<p style="margin-top:24px;"><a href="${process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://edl-diagnostic-erp.fr'}/pro/dashboard" style="background:#1a3a5c;color:#fff;text-decoration:none;padding:12px 24px;font-size:14px;font-weight:700;display:inline-block;">Accéder à mon espace Pro &rarr;</a></p>
<p style="font-size:11px;color:#9ca3af;margin-top:24px;">EDL&amp;DIAGNOSTIC · <a href="mailto:contact@edl-diagnostic-erp.fr" style="color:#6b7280;">contact@edl-diagnostic-erp.fr</a></p>
</div></body></html>`,
          });
          // TTL 25j : re-notifiera à J-5 si l'ERP est toujours valide
          await kv.set(notifKey, '1', { ex: 60 * 60 * 24 * 25 });
        } catch (err) {
          console.error(`pro-account: notification error for ${erp.ref}:`, err?.message);
        }
      })).catch(() => {});
    }
  }

  return res.status(200).json({ email, credits, used, packs, erps });
}
