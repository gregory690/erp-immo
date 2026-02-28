// Vercel Function — stripe-webhook
// Écoute l'événement checkout.session.completed de Stripe.
// Marque le document ERP comme payé, envoie l'email (sans PDF) et pose email_sent:true.
// Preview.tsx détecte email_dispatched:true via get-erp-document et confirme l'envoi.
//
// Variables d'environnement requises :
//   STRIPE_SECRET_KEY               → clé secrète Stripe (sk_live_...)
//   STRIPE_WEBHOOK_SECRET           → dashboard Stripe → Developers → Webhooks → Signing secret
//   KV_REST_API_URL + KV_REST_API_TOKEN → Upstash KV
//   RESEND_API_KEY                  → envoi email
//   RESEND_FROM_EMAIL               → ex: erp@edletdiagnostic.fr
//
// Configuration Stripe :
//   Dashboard → Developers → Webhooks → Add endpoint
//   URL : https://<votre-domaine>/api/stripe-webhook
//   Event : checkout.session.completed

import Stripe from 'stripe';
import { kv } from '@vercel/kv';
import { Resend } from 'resend';
import { buildEmailHTML } from './_email-template.js';

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

  // ─── Branche pro_pack ────────────────────────────────────────────────────────
  const sessionType = session.metadata?.type;
  if (sessionType === 'pro_pack') {
    const proEmail = session.metadata?.pro_email?.toLowerCase().trim();
    const packQty = parseInt(session.metadata?.pack_qty || '0', 10);
    if (proEmail && packQty > 0) {
      try {
        const credKey = `pro:credits:${proEmail}`;
        const raw = await kv.get(credKey);
        const current = raw
          ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
          : { credits: 0, used: 0, packs: [] };

        // Idempotence : ignorer si ce sessionId a déjà été traité
        const alreadyProcessed = (current.packs || []).some(p => p.stripe_id === sessionId);
        if (alreadyProcessed) {
          console.log(`Webhook: session ${sessionId} déjà traitée, ignorée`);
          return res.status(200).json({ received: true });
        }

        // Récupérer l'URL de la facture Stripe (invoice_creation activé dans create-pro-checkout)
        let invoiceUrl = null;
        if (session.invoice) {
          try {
            const invoice = await stripe.invoices.retrieve(session.invoice);
            invoiceUrl = invoice.hosted_invoice_url || null;
          } catch (err) {
            console.error('Webhook: invoice retrieve error:', err.message);
          }
        }

        current.credits += packQty;
        current.packs = [
          {
            qty: packQty,
            date: new Date().toISOString(),
            stripe_id: sessionId,
            amount_ttc: session.amount_total ?? null,
            currency: session.currency ?? 'eur',
            invoice_url: invoiceUrl,
          },
          ...(current.packs || []),
        ];
        await kv.set(credKey, JSON.stringify(current), { ex: 60 * 60 * 24 * 365 });
        console.log(`Webhook: pro_pack ${packQty} crédits ajoutés pour ${proEmail}`);
      } catch (err) {
        console.error('Webhook: pro_pack KV error:', err.message);
      }
    }
    return res.status(200).json({ received: true });
  }

  const customerEmail = session.customer_details?.email;
  const erpRef = session.metadata?.erp_reference;

  if (!customerEmail || !erpRef) {
    console.warn('Webhook: email ou référence ERP absent de la session', { customerEmail, erpRef });
    return res.status(200).json({ received: true });
  }

  // Sécurité : s'assurer que erpRef est un UUID v4 valide avant toute opération KV.
  // Empêche un attaquant de cibler des clés KV arbitraires (ex: "pro:credits:…").
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(erpRef)) {
    console.error('Webhook: erpRef invalide (non UUID v4), rejeté', { erpRef });
    return res.status(200).json({ received: true });
  }

  // ─── Marquer le document comme payé et envoyer l'email ───────────────────────
  try {
    const raw = await kv.get(erpRef);
    const existingDoc = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};

    // Idempotence : si l'email a déjà été envoyé, on ne retraite pas
    if (existingDoc?.email_sent) {
      console.log(`Webhook: email déjà envoyé pour ${erpRef}, skip`);
      return res.status(200).json({ received: true });
    }

    // Marquer payé + stocker email client
    await kv.set(erpRef, JSON.stringify({
      ...existingDoc,
      paid: true,
      customer_email: customerEmail,
    }), {
      ex: 60 * 60 * 24 * 180, // 180 jours
    });
    console.log(`Webhook: document ${erpRef} marqué payé`);

    // Index email → [ref1, ref2, ...] pour la récupération de commande perdue
    try {
      const emailKey = `email:${customerEmail.toLowerCase()}`;
      const existing = await kv.get(emailKey);
      const refs = existing ? (typeof existing === 'string' ? JSON.parse(existing) : existing) : [];
      if (!refs.includes(erpRef)) {
        refs.unshift(erpRef);
        await kv.set(emailKey, JSON.stringify(refs.slice(0, 20)), {
          ex: 60 * 60 * 24 * 180,
        });
      }
    } catch (err) {
      console.error('Webhook: email index error:', err.message);
    }

    // ─── Envoi email (sans PDF pour rester dans les 60s Vercel) ─────────────
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'erp@edletdiagnostic.fr';
    if (resendKey && existingDoc?.bien && existingDoc?.metadata) {
      try {
        const resend = new Resend(resendKey);
        const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : 'https://edl-diagnostic-erp.fr';
        const redownloadUrl = `${baseUrl}/apercu?ref=${encodeURIComponent(erpRef)}`;
        const dateRealisation = new Date(existingDoc.metadata.date_realisation).toLocaleDateString('fr-FR', {
          day: '2-digit', month: 'long', year: 'numeric',
        });
        const dateExpiration = new Date(existingDoc.metadata.validite_jusqu_au).toLocaleDateString('fr-FR', {
          day: '2-digit', month: 'long', year: 'numeric',
        });

        await resend.emails.send({
          from: `EDL&DIAGNOSTIC <${fromEmail}>`,
          to: customerEmail,
          subject: `Votre ERP est prêt — ${existingDoc.bien.adresse_complete}`,
          html: buildEmailHTML({
            bien: existingDoc.bien,
            metadata: existingDoc.metadata,
            redownloadUrl,
            catnatCount: existingDoc.catnat?.length ?? 0,
            dateRealisation,
            dateExpiration,
            hasPdf: false, // pas de PDF dans le webhook (limite timeout Vercel)
          }),
        });

        // Poser email_sent:true → get-erp-document retournera email_dispatched:true
        await kv.set(erpRef, JSON.stringify({
          ...existingDoc,
          paid: true,
          customer_email: customerEmail,
          email_sent: true,
        }), {
          ex: 60 * 60 * 24 * 180,
        });
        console.log(`Webhook: email envoyé à ${customerEmail} pour ${erpRef}`);
      } catch (err) {
        console.error('Webhook: email send error:', err.message);
        // Non bloquant — le webhook répond 200 même si l'email échoue
        // Preview.tsx affichera le formulaire de secours dans ce cas
      }
    } else {
      console.warn(`Webhook: email non envoyé — RESEND_API_KEY=${!!resendKey} doc.bien=${!!existingDoc?.bien}`);
    }
  } catch (err) {
    console.error('Webhook: KV update error:', err.message);
  }

  return res.status(200).json({ received: true });
}
