// Vercel Function — stripe-webhook
// Écoute l'événement checkout.session.completed de Stripe.
// Quand le paiement est confirmé, envoie automatiquement l'ERP par email
// à l'adresse fournie lors du paiement.
//
// Variables d'environnement requises :
//   STRIPE_SECRET_KEY               → clé secrète Stripe (sk_live_...)
//   STRIPE_WEBHOOK_SECRET           → dashboard Stripe → Developers → Webhooks → Signing secret
//   RESEND_API_KEY                  → dashboard.resend.com → API Keys
//   RESEND_FROM_EMAIL               → domaine vérifié dans Resend
//   KV_REST_API_URL + KV_REST_API_TOKEN → Upstash KV
//   VERCEL_PROJECT_PRODUCTION_URL   → injecté automatiquement par Vercel
//
// Configuration Stripe :
//   Dashboard → Developers → Webhooks → Add endpoint
//   URL : https://<votre-domaine>/api/stripe-webhook
//   Event : checkout.session.completed

import Stripe from 'stripe';
import { kv } from '@vercel/kv';
import { Resend } from 'resend';
import { buildEmailHTML } from './_email-template.js';
import { generatePDFAttachment, buildPDFFilename } from './_generate-pdf.js';

// Désactiver le body parser Vercel pour pouvoir vérifier la signature Stripe
// sur le payload brut (obligatoire pour stripe.webhooks.constructEvent)
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    console.error('STRIPE_SECRET_KEY ou STRIPE_WEBHOOK_SECRET manquante');
    return res.status(500).json({ error: 'Configuration serveur incomplète' });
  }

  // ─── Lire le body brut (nécessaire pour la vérification de signature) ────────
  let rawBody;
  try {
    rawBody = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
  } catch (err) {
    console.error('Webhook: erreur lecture body:', err.message);
    return res.status(400).json({ error: 'Impossible de lire le payload' });
  }

  // ─── Vérifier la signature Stripe ────────────────────────────────────────────
  const signature = req.headers['stripe-signature'];
  if (!signature) {
    console.error('Webhook: en-tête stripe-signature absent');
    return res.status(400).json({ error: 'Signature manquante' });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook: signature invalide:', err.message);
    return res.status(400).json({ error: 'Signature webhook invalide' });
  }

  // On ne traite que les paiements complétés
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const sessionId = event.data.object.id;

  // Vérification supplémentaire : récupérer la session depuis l'API Stripe
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error('Webhook: impossible de récupérer la session Stripe:', err.message);
    return res.status(200).json({ received: true });
  }

  if (session.payment_status !== 'paid') {
    return res.status(200).json({ received: true });
  }

  const email = session.customer_details?.email;
  const erpRef = session.metadata?.erp_reference;

  if (!email || !erpRef) {
    console.warn('Webhook: email ou référence ERP absent de la session', { email, erpRef });
    return res.status(200).json({ received: true });
  }

  // ─── Répondre à Stripe IMMÉDIATEMENT ─────────────────────────────────────────
  // La génération PDF peut prendre 20-30s. Stripe a un timeout de 30s.
  // On répond 200 maintenant et on continue le traitement en arrière-plan.
  // Node.js/Vercel continue d'exécuter le code après res.json() jusqu'au retour
  // naturel de la fonction ou maxDuration (60s dans vercel.json).
  res.status(200).json({ received: true });

  // ─────────────────────────────────────────────────────────────────────────────
  // Tout ce qui suit s'exécute APRÈS la réponse 200 envoyée à Stripe
  // ─────────────────────────────────────────────────────────────────────────────

  // ─── Récupérer le document ERP depuis KV ────────────────────────────────────
  let erpDocument;
  try {
    const raw = await kv.get(erpRef);
    if (!raw) {
      console.error('Webhook: document ERP introuvable dans KV, ref:', erpRef);
      return;
    }
    erpDocument = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (err) {
    console.error('Webhook: KV get error:', err.message);
    return;
  }

  // Éviter les doublons si le webhook est rejoué par Stripe
  if (erpDocument.email_sent) {
    console.log(`Webhook: email déjà envoyé pour ref ${erpRef} — skip`);
    return;
  }

  // ─── Marquer le document comme payé dans KV ──────────────────────────────────
  try {
    await kv.set(erpRef, JSON.stringify({ ...erpDocument, paid: true }), {
      ex: 60 * 60 * 24 * 180, // 180 jours
    });
  } catch (err) {
    console.error('Webhook: impossible de marquer le doc comme payé:', err.message);
  }

  // ─── Envoyer l'email via Resend ─────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn('Webhook: RESEND_API_KEY non configurée — email non envoyé');
    return;
  }

  const resend = new Resend(resendKey);
  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.URL || 'http://localhost:3000';

  const redownloadUrl = `${baseUrl}/apercu?ref=${encodeURIComponent(erpRef)}&autoprint=true`;
  const printUrl = `${baseUrl}/print?ref=${encodeURIComponent(erpRef)}`;
  const bien = erpDocument.bien;
  const metadata = erpDocument.metadata;
  const catnatCount = erpDocument.catnat?.length ?? 0;

  const dateRealisation = new Date(metadata.date_realisation).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const dateExpiration = new Date(metadata.validite_jusqu_au).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  // ─── Génération PDF via PDFShift ─────────────────────────────────────────────
  // S'exécute après la réponse 200 — pas de risque de timeout Stripe
  let pdfAttachment = null;
  try {
    pdfAttachment = await Promise.race([
      generatePDFAttachment(printUrl, buildPDFFilename(erpDocument)),
      new Promise((_, reject) => setTimeout(() => reject(new Error('PDF timeout')), 40000)),
    ]);
  } catch (err) {
    console.warn('Webhook: PDF non généré (email envoyé sans pièce jointe):', err.message);
  }

  try {
    await resend.emails.send({
      from: `EDL&DIAGNOSTIC <${process.env.RESEND_FROM_EMAIL || 'erp@edletdiagnostic.fr'}>`,
      to: email,
      subject: `Votre ERP est prêt — ${bien.adresse_complete}`,
      html: buildEmailHTML({ bien, metadata, redownloadUrl, catnatCount, dateRealisation, dateExpiration, hasPdf: !!pdfAttachment }),
      ...(pdfAttachment ? { attachments: [pdfAttachment] } : {}),
    });
    console.log(`Webhook: email ERP envoyé à ${email} (ref: ${erpRef}, pdf: ${!!pdfAttachment})`);

    // Marquer l'email comme envoyé pour éviter les doublons
    try {
      await kv.set(erpRef, JSON.stringify({ ...erpDocument, paid: true, email_sent: true }), {
        ex: 60 * 60 * 24 * 180,
      });
    } catch (err) {
      // Non bloquant
    }
  } catch (err) {
    console.error('Webhook: Resend error:', err.message);
  }
}
