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

  // ─── Récupérer le document ERP depuis KV ────────────────────────────────────
  let erpDocument;
  try {
    const raw = await kv.get(erpRef);
    if (!raw) {
      console.error('Webhook: document ERP introuvable dans KV, ref:', erpRef);
      return res.status(200).json({ received: true, warning: 'document_not_found' });
    }
    erpDocument = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (err) {
    console.error('Webhook: KV get error:', err.message);
    return res.status(200).json({ received: true, warning: 'kv_error' });
  }

  // ─── Marquer le document comme payé dans KV ──────────────────────────────────
  // Cela permet à get-erp-document de le délivrer sans vérification Stripe supplémentaire
  try {
    await kv.set(erpRef, JSON.stringify({ ...erpDocument, paid: true }), {
      ex: 60 * 60 * 24 * 180, // 180 jours
    });
  } catch (err) {
    console.error('Webhook: impossible de marquer le doc comme payé:', err.message);
    // Non bloquant — on continue
  }

  // ─── Envoyer l'email via Resend ─────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn('Webhook: RESEND_API_KEY non configurée — email non envoyé');
    return res.status(200).json({ received: true, warning: 'no_resend_key' });
  }

  // Vérifier si l'email n'a pas déjà été envoyé (évite les doublons)
  if (erpDocument.email_sent) {
    console.log(`Webhook: email déjà envoyé pour ref ${erpRef} — skip`);
    return res.status(200).json({ received: true });
  }

  const resend = new Resend(resendKey);
  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.URL || 'http://localhost:3000';

  const redownloadUrl = `${baseUrl}/apercu?ref=${encodeURIComponent(erpRef)}`;
  const bien = erpDocument.bien;
  const metadata = erpDocument.metadata;
  const catnatCount = erpDocument.catnat?.length ?? 0;

  const dateRealisation = new Date(metadata.date_realisation).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const dateExpiration = new Date(metadata.validite_jusqu_au).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  try {
    await resend.emails.send({
      from: `EDL&DIAGNOSTIC <${process.env.RESEND_FROM_EMAIL || 'erp@edletdiagnostic.fr'}>`,
      to: email,
      subject: `Votre ERP est prêt — ${bien.adresse_complete}`,
      html: buildEmailHTML({ bien, metadata, redownloadUrl, catnatCount, dateRealisation, dateExpiration }),
    });
    console.log(`Webhook: email ERP envoyé à ${email} (ref: ${erpRef})`);

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
    // On retourne 200 pour éviter les retentatives Stripe en boucle
  }

  return res.status(200).json({ received: true });
}

// ─── Template email HTML ──────────────────────────────────────────────────────
function buildEmailHTML({ bien, metadata, redownloadUrl, catnatCount, dateRealisation, dateExpiration }) {
  const catnatMsg = catnatCount > 0
    ? `⚠️ <strong>${catnatCount} arrêté(s) de catastrophe naturelle</strong> recensé(s) sur cette commune.`
    : '✅ Aucun arrêté de catastrophe naturelle recensé.';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre ERP — EDL&amp;DIAGNOSTIC</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#b20f11;border-radius:10px 10px 0 0;padding:28px 24px;text-align:center;">
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Service EDL&amp;DIAGNOSTIC</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:900;">État des Risques et Pollutions</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Conforme à l'arrêté du 27 septembre 2022</p>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:28px 24px;">
      <p style="margin:0 0 20px;font-size:15px;color:#111827;">
        Votre document ERP a été généré avec succès. Vous pouvez le télécharger à tout moment via le lien ci-dessous.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Bien concerné</p>
        <p style="margin:0;font-size:15px;font-weight:700;color:#111827;">${bien.adresse_complete}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#374151;">${bien.code_postal} ${bien.commune} · Code INSEE : ${bien.code_insee}</p>
      </div>
      <table style="width:100%;border-collapse:separate;border-spacing:8px;margin-bottom:20px;">
        <tr>
          <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;text-align:center;width:50%;">
            <p style="margin:0;font-size:11px;color:#166534;text-transform:uppercase;">Établi le</p>
            <p style="margin:5px 0 0;font-size:14px;font-weight:700;color:#15803d;">${dateRealisation}</p>
          </td>
          <td style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px;text-align:center;width:50%;">
            <p style="margin:0;font-size:11px;color:#9a3412;text-transform:uppercase;">Expire le</p>
            <p style="margin:5px 0 0;font-size:14px;font-weight:700;color:#c2410c;">${dateExpiration}</p>
          </td>
        </tr>
      </table>
      <div style="background:#fefce8;border:1px solid #fef08a;border-radius:8px;padding:14px;margin-bottom:24px;font-size:14px;color:#713f12;">
        ${catnatMsg}
      </div>
      <div style="text-align:center;margin:28px 0;">
        <a href="${redownloadUrl}" style="display:inline-block;background:#b20f11;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
          Télécharger mon ERP (PDF)
        </a>
        <p style="margin:10px 0 0;font-size:12px;color:#9ca3af;">Lien valable à tout moment — conservez cet email précieusement.</p>
      </div>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px;font-size:13px;color:#991b1b;margin-bottom:20px;">
        <strong>Rappel :</strong> Ce document doit être annexé au compromis de vente ou au contrat de bail (art. L125-5 Code de l'Environnement). Il est valable <strong>6 mois</strong>.
      </div>
      <hr style="border:none;border-top:1px solid #f3f4f6;margin:20px 0;">
      <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
        Réf. ${metadata.reference}<br>
        EDL&amp;DIAGNOSTIC · <a href="${redownloadUrl}" style="color:#b20f11;">Accéder à mon ERP</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
