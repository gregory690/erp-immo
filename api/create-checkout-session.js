// Vercel Function — create-checkout-session
// La clé secrète Stripe n'est JAMAIS exposée au navigateur.
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY manquante dans les variables d'environnement");
    return res.status(500).json({ error: 'Configuration serveur incomplète' });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

  try {
    const { erp_reference, adresse, commune } = req.body;

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      locale: 'fr',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'État des Risques et Pollutions (ERP)',
              description: `${adresse || 'Bien immobilier'} · Réf. ${erp_reference || ''}`,
            },
            unit_amount: 999, // 9,99 € en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/apercu?payment=success&ref=${encodeURIComponent(erp_reference || '')}`,
      cancel_url: `${baseUrl}/generer?payment=cancel`,
      metadata: {
        erp_reference: erp_reference || '',
        adresse: adresse || '',
        commune: commune || '',
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
