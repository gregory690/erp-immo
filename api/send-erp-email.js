// Vercel Function — send-erp-email
// Appelé par le client après retour de paiement Stripe.
// 1. Sauvegarde le document ERP dans Vercel KV (pour re-téléchargement)
// 2. Envoie un email récapitulatif via Resend — sauf si le webhook l'a déjà fait
//
// Variables d'environnement requises :
//   RESEND_API_KEY                  → dashboard.resend.com → API Keys
//   RESEND_FROM_EMAIL               → ex: erp@edletdiagnostic.fr (domaine vérifié dans Resend)
//   KV_REST_API_URL + KV_REST_API_TOKEN → configurés automatiquement par Vercel KV
//   VERCEL_PROJECT_PRODUCTION_URL   → injecté automatiquement par Vercel en production
import { kv } from '@vercel/kv';
import { Resend } from 'resend';
import { buildEmailHTML } from './_email-template.js';
import { generatePDFAttachment, buildPDFFilename } from './_generate-pdf.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, erpDocument } = req.body || {};

  if (!email || !erpDocument?.metadata?.reference) {
    return res.status(400).json({ error: 'Email et document ERP requis' });
  }

  // Validation format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Adresse email invalide' });
  }

  // ─── Rate limiting ────────────────────────────────────────────────────────
  // 5 requêtes / 10 min / IP  — protège contre les bots multi-emails
  // 3 requêtes / 1h / email   — protège contre le spam vers une même boîte
  try {
    const ip = ((req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown') + '').split(',')[0].trim();
    const normalizedEmail = email.toLowerCase().trim();

    const [ipCount, emailCount] = await Promise.all([
      kv.incr(`rate:sendemail:ip:${ip}`),
      kv.incr(`rate:sendemail:addr:${normalizedEmail}`),
    ]);
    // Initialise TTL à la première incrémentation
    if (ipCount === 1) await kv.expire(`rate:sendemail:ip:${ip}`, 600);         // 10 min
    if (emailCount === 1) await kv.expire(`rate:sendemail:addr:${normalizedEmail}`, 3600); // 1h

    if (ipCount > 5 || emailCount > 3) {
      return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' });
    }
  } catch {
    // Non bloquant
  }

  // Validation référence (UUID v4)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(erpDocument.metadata.reference)) {
    return res.status(400).json({ error: 'Référence document invalide' });
  }

  const reference = erpDocument.metadata.reference;
  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.URL || 'http://localhost:3000';
  const redownloadUrl = `${baseUrl}/apercu?ref=${encodeURIComponent(reference)}`;

  // ─── 1. Vérifier si le webhook a déjà géré l'email ───────────────────────────
  // Le webhook stripe-webhook.js envoie l'email en premier et marque email_sent:true.
  // Si c'est déjà fait, on ne renvoie pas un second email.
  let existingDoc = null;
  try {
    const raw = await kv.get(reference);
    existingDoc = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
  } catch (err) {
    // Non bloquant — on continue
  }

  if (existingDoc?.email_sent) {
    console.log(`send-erp-email: email déjà envoyé par le webhook pour ref ${reference} — skip`);
    return res.status(200).json({ success: true, info: 'email_already_sent_by_webhook' });
  }

  // ─── 2. Sauvegarde dans Vercel KV ───────────────────────────────────────────
  // On préserve les champs internes déjà présents (paid, stripe_session_id, etc.)
  try {
    await kv.set(reference, JSON.stringify({
      ...(existingDoc || {}),
      ...erpDocument,
    }), {
      ex: 60 * 60 * 24 * 180, // expire après 180 jours
    });
  } catch (err) {
    // Non bloquant — on continue avec l'email même si la sauvegarde échoue
    console.error('Vercel KV save error:', err.message);
  }

  // ─── 3. Envoi email via Resend ───────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    console.warn('RESEND_API_KEY non configurée — document sauvegardé, email non envoyé');
    return res.status(200).json({ success: true, warning: 'email_not_sent_no_api_key' });
  }

  const resend = new Resend(resendKey);

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'erp@edletdiagnostic.fr';
  const catnatCount = erpDocument.catnat?.length ?? 0;
  const bien = erpDocument.bien;
  const metadata = erpDocument.metadata;

  const dateRealisation = new Date(metadata.date_realisation).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const dateExpiration = new Date(metadata.validite_jusqu_au).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  // ─── Génération PDF via PDFShift (non bloquant) ────────────────────────────
  const printUrl = `${baseUrl}/print?ref=${encodeURIComponent(reference)}`;
  let pdfAttachment = null;
  try {
    pdfAttachment = await Promise.race([
      generatePDFAttachment(printUrl, buildPDFFilename(erpDocument)),
      new Promise((_, reject) => setTimeout(() => reject(new Error('PDF timeout')), 40000)),
    ]);
  } catch (err) {
    console.warn('send-erp-email: PDF non généré:', err.message);
  }

  try {
    await resend.emails.send({
      from: `EDL&DIAGNOSTIC <${fromEmail}>`,
      to: email,
      subject: `Votre ERP est prêt — ${bien.adresse_complete}`,
      html: buildEmailHTML({ bien, metadata, redownloadUrl, catnatCount, dateRealisation, dateExpiration }),
      ...(pdfAttachment ? { attachments: [pdfAttachment] } : {}),
    });

    // Marquer l'email comme envoyé pour éviter les doublons (ex: si webhook arrive ensuite)
    try {
      await kv.set(reference, JSON.stringify({
        ...(existingDoc || {}),
        ...erpDocument,
        email_sent: true,
      }), {
        ex: 60 * 60 * 24 * 180,
      });
    } catch (err) {
      // Non bloquant
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err.message);
    return res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
  }
}
