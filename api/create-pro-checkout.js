// Vercel Function — create-pro-checkout
// Crée une Stripe Checkout Session pour l'achat de crédits pro.
// Tarif dégressif selon volume — calculé dynamiquement côté serveur.
// Les montants sont en HT + TVA 20% exclusive → facture conforme HT/TVA/TTC
import Stripe from 'stripe';
import { kv } from '@vercel/kv';

// Tarification graduée — chaque tranche est facturée à son propre taux.
// Le total est TOUJOURS strictement croissant avec le volume, sans exception.
// Exemple : 51 ERPs = 150 + 2,50 = 152,50€ > 50 ERPs = 150€ ✓
const GRAD_TIERS = [
  { from: 1,   to: 50,  rateCents: 300 }, // 3,00 € HT / ERP
  { from: 51,  to: 100, rateCents: 250 }, // 2,50 € HT / ERP
  { from: 101, to: 200, rateCents: 200 }, // 2,00 € HT / ERP
  { from: 201, to: 300, rateCents: 150 }, // 1,50 € HT / ERP
  { from: 301, to: 500, rateCents: 100 }, // 1,00 € HT / ERP
];

// Calcule le total HT en centimes pour une quantité donnée (tarification graduée)
function calcTotalCents(qty) {
  let total = 0;
  for (const t of GRAD_TIERS) {
    if (qty < t.from) break;
    total += (Math.min(qty, t.to) - t.from + 1) * t.rateCents;
  }
  return total;
}

// Construit la description détaillée des tranches pour la facture Stripe
function buildDescription(qty) {
  const lines = [];
  for (const t of GRAD_TIERS) {
    if (qty < t.from) break;
    const inTier = Math.min(qty, t.to) - t.from + 1;
    lines.push(`${t.from}–${Math.min(qty, t.to)} ERPs × ${(t.rateCents / 100).toFixed(2).replace('.', ',')}€`);
  }
  return lines.join(' | ');
}

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

// Récupère ou crée le taux de TVA française 20% (gratuit, persistant dans Stripe)
async function getOrCreateTaxRate(stripe) {
  try {
    const list = await stripe.taxRates.list({ active: true, limit: 100 });
    const existing = list.data.find(
      r => r.percentage === 20 && !r.inclusive && r.jurisdiction === 'FR'
    );
    if (existing) return existing.id;
    const created = await stripe.taxRates.create({
      display_name: 'TVA',
      description: 'TVA française 20%',
      jurisdiction: 'FR',
      percentage: 20,
      inclusive: false, // exclusive = TVA ajoutée en sus du HT
    });
    return created.id;
  } catch (err) {
    console.error('create-pro-checkout: tax rate error:', err.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { qty, token } = req.body || {};

  const parsedQty = parseInt(qty, 10);
  if (!parsedQty || parsedQty < 1 || parsedQty > 500) {
    return res.status(400).json({ error: 'Quantité invalide (1–500 ERPs)' });
  }

  // Token optionnel — si présent : session pro existante (email pré-rempli dans Stripe)
  //                 — si absent  : achat anonyme, Stripe collecte l'email, webhook crée le compte
  let email = null;
  if (token) {
    email = await verifyProToken(token);
    if (!email) {
      return res.status(401).json({ error: 'Session expirée. Reconnectez-vous.' });
    }
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Configuration serveur incomplète' });
  }

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.URL || 'http://localhost:3000';

  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

  // Rate limiting : 10 sessions / heure / IP
  try {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    const rateKey = `rate:pro-checkout:${ip}`;
    await kv.set(rateKey, 0, { nx: true, ex: 3600 });
    const count = await kv.incr(rateKey);
    if (count > 10) {
      return res.status(429).json({ error: 'Trop de requêtes. Réessayez dans une heure.' });
    }
  } catch { /* non bloquant */ }

  // Tarification graduée — montant total HT calculé tranche par tranche
  const totalCents = calcTotalCents(parsedQty);
  const description = buildDescription(parsedQty);

  // Taux de TVA 20% — créé une seule fois dans Stripe, réutilisé ensuite
  const taxRateId = await getOrCreateTaxRate(stripe);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ...(email ? { customer_email: email } : {}), // pré-rempli si connecté, Stripe collecte sinon
      customer_creation: 'always',
      billing_address_collection: 'required',
      custom_fields: [
        {
          key: 'company',
          label: { type: 'custom', custom: 'Raison sociale' },
          type: 'text',
          optional: false,
        },
        {
          key: 'tva',
          label: { type: 'custom', custom: 'N° TVA intracommunautaire (optionnel)' },
          type: 'text',
          optional: true,
        },
      ],
      tax_id_collection: { enabled: true },
      invoice_creation: { enabled: true },
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: totalCents, // total HT gradué en centimes (qty=1 → montant exact)
          tax_behavior: 'exclusive', // TVA ajoutée en sus → facture HT + TVA + TTC
          product_data: {
            name: `${parsedQty} ERPs Pro — EDL&DIAGNOSTIC`,
            description, // détail des tranches ex: "1–50 ERPs × 3,00€ | 51–80 ERPs × 2,50€"
          },
        },
        quantity: 1, // montant total pré-calculé côté serveur
        ...(taxRateId ? { tax_rates: [taxRateId] } : {}),
      }],
      metadata: {
        type: 'pro_pack',
        ...(email ? { pro_email: email } : {}), // absent si achat anonyme → webhook lira customer_details.email
        pack_qty: String(parsedQty),
      },
      success_url: `${baseUrl}/pro/dashboard?pack_success=1`,
      cancel_url: `${baseUrl}/pro/dashboard`,
      locale: 'fr',
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('create-pro-checkout: Stripe error:', err.message);
    return res.status(500).json({ error: 'Erreur lors de la création du paiement' });
  }
}
