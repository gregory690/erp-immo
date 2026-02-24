// Netlify Function — get-erp-document
// Récupère un document ERP depuis Netlify Blobs via sa référence.
// Utilisé quand l'utilisateur revient sur /apercu?ref=XXX depuis un autre
// appareil ou après avoir vidé son localStorage.
//
// Paramètre GET : ?ref=<erp_reference>

const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const ref = event.queryStringParameters?.ref;

  if (!ref) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Paramètre ref manquant' }),
    };
  }

  try {
    const store = getStore({ name: 'erp-documents', consistency: 'strong' });
    const data = await store.get(ref);

    if (!data) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Document introuvable ou expiré' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: data,
    };
  } catch (err) {
    console.error('Blobs get error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur serveur' }),
    };
  }
};
