// Vercel Function — create-pro-checkout
// Crée une Stripe Checkout Session pour l'achat de crédits pro.
// Tarif dégressif selon volume — calculé dynamiquement côté serveur.
// Les montants sont en HT + TVA 20% exclusive → facture conforme HT/TVA/TTC
import Stripe from 'stripe';
import { kv } from '@vercel/kv';

// Packs discrets — totaux strictement croissants, pas de paradoxe prix
// qty × price = total HT : 60 < 75 < 150 < 250 < 400 < 450 < 500 ✓
const PRICING_TIERS = [
  { upTo: 10,       pricePerUnitCents: 600 }, // 10  × 6.00€ = 60€  HT
  { upTo: 15,       pricePerUnitCents: 500 }, // 15  × 5.00€ = 75€  HT
  { upTo: 50,       pricePerUnitCents: 300 }, // 50  × 3.00€ = 150€ HT
  { upTo: 100,      pricePerUnitCents: 250 }, // 100 × 2.50€ = 250€ HT
  { upTo: 200,      pricePerUnitCents: 200 }, // 200 × 2.00€ = 400€ HT
  { upTo: 300,      pricePerUnitCents: 150 }, // 300 × 1.50€ = 450€ HT
  { upTo: Infinity, pricePerUnitCents: 100 }, // 500 × 1.00€ = 500€ HT
];

function getPricePerUnit(qty) {
  return (PRICING_TIERS.find(t => qty <= t.upTo) ?? PRICING_TIERS.at(-1)).pricePerUnitCents;
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
  if (!parsedQty || parsedQty < 1 || parsedQty > 10000) {
    return res.status(400).json({ error: 'Quantité invalide (1–10 000 ERPs)' });
  }

  const email = await verifyProToken(token);
  if (!email) {
    return res.status(401).json({ error: 'Non authentifié' });
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

  const pricePerUnitCents = getPricePerUnit(parsedQty);
  const priceHtEur = (pricePerUnitCents / 100).toFixed(2).replace('.', ',');

  // Taux de TVA 20% — créé une seule fois dans Stripe, réutilisé ensuite
  const taxRateId = await getOrCreateTaxRate(stripe);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
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
          unit_amount: pricePerUnitCents, // prix unitaire HT par ERP en centimes
          tax_behavior: 'exclusive',      // TVA ajoutée en sus → facture HT + TVA + TTC
          product_data: {
            name: `ERPs Pro — EDL&DIAGNOSTIC`,
            description: `${parsedQty} ERPs · ${priceHtEur} € HT / ERP`,
          },
        },
        quantity: parsedQty,
        ...(taxRateId ? { tax_rates: [taxRateId] } : {}),
      }],
      metadata: {
        type: 'pro_pack',
        pro_email: email,
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
