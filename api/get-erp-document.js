// Vercel Function — get-erp-document
// Récupère un document ERP depuis Vercel KV via sa référence.
// Paramètre GET : ?ref=<erp_reference>
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ref } = req.query;

  if (!ref) {
    return res.status(400).json({ error: 'Paramètre ref manquant' });
  }

  try {
    const data = await kv.get(ref);

    if (!data) {
      return res.status(404).json({ error: 'Document introuvable ou expiré' });
    }

    const doc = typeof data === 'string' ? JSON.parse(data) : data;
    return res.status(200).json(doc);
  } catch (err) {
    console.error('KV get error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
