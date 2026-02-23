// Netlify Function — s'exécute côté serveur (Node.js)
// La clé secrète Stripe n'est JAMAIS exposée au navigateur.
const Stripe = require('stripe');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('STRIPE_SECRET_KEY manquante dans les variables d\'environnement');
    return { statusCode: 500, body: JSON.stringify({ error: 'Configuration serveur incomplète' }) };
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

  try {
    const { erp_reference, adresse, commune } = JSON.parse(event.body || '{}');

    const baseUrl = process.env.URL || 'http://localhost:8888';

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
      // Stripe redirige vers ces URLs après paiement
      success_url: `${baseUrl}/apercu?payment=success&ref=${encodeURIComponent(erp_reference || '')}`,
      cancel_url: `${baseUrl}/generer?payment=cancel`,
      metadata: {
        erp_reference: erp_reference || '',
        adresse: adresse || '',
        commune: commune || '',
      },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
