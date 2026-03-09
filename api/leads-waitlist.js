// Vercel Function — leads-waitlist
// Enregistre un diagnostiqueur dans la liste d'attente de la marketplace de leads.
// POST { email, dept, cap }
//   - Valide email + champs requis
//   - Rate limit : 3 tentatives / heure / email
//   - Stocke dans KV : leads:waitlist:{email} → { email, dept, cap, date }
//   - Envoie un email de notification à Gregory via Resend

import { kv } from '@vercel/kv';
import { Resend } from 'resend';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, dept, cap } = req.body || {};

  if (!email || !dept || !cap) {
    return res.status(400).json({ error: 'Champs manquants' });
  }
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const safeDept = String(dept).slice(0, 200);
  const safeCap = String(cap).slice(0, 50);

  // Rate limit : 3 inscriptions / heure / email
  try {
    await kv.set(`rate:waitlist:${normalizedEmail}`, 0, { nx: true, ex: 3600 });
    const count = await kv.incr(`rate:waitlist:${normalizedEmail}`);
    if (count > 3) {
      return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans une heure.' });
    }
  } catch { /* non bloquant */ }

  // Stocker dans KV
  try {
    await kv.set(`leads:waitlist:${normalizedEmail}`, JSON.stringify({
      email: normalizedEmail,
      dept: safeDept,
      cap: safeCap,
      date: new Date().toISOString(),
    }), { ex: 60 * 60 * 24 * 365 });
  } catch (err) {
    console.error('leads-waitlist: KV error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }

  // Notifier Gregory
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'erp@edletdiagnostic.fr';
  const notifyEmail = process.env.ADMIN_NOTIFY_EMAIL || 'gregory@edletdiagnostic.fr';

  if (resendKey) {
    const resend = new Resend(resendKey);
    try {
      await resend.emails.send({
        from: `EDL&DIAGNOSTIC <${fromEmail}>`,
        to: notifyEmail,
        subject: `[Waitlist Leads] Nouvelle inscription — ${normalizedEmail}`,
        html: `<p><strong>Email :</strong> ${normalizedEmail}</p>
<p><strong>Département(s) :</strong> ${safeDept}</p>
<p><strong>Cap souhaité :</strong> ${safeCap}</p>
<p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>`,
      });
    } catch (err) {
      console.error('leads-waitlist: email error:', err.message);
      // Non bloquant
    }
  }

  return res.status(200).json({ registered: true });
}
