// Endpoint de test temporaire — à supprimer après validation
// GET /api/test-pdf?ref=<erp_reference>
// Appelle PDFShift et retourne le PDF directement dans le navigateur (ou l'erreur)

import { generatePDFAttachment, buildPDFFilename } from './_generate-pdf.js';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { ref } = req.query;
  if (!ref) return res.status(400).json({ error: 'Paramètre ref manquant' });

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000';

  const printUrl = `${baseUrl}/print?ref=${encodeURIComponent(ref)}`;

  // Vérifier que le doc existe dans KV
  let doc = null;
  try {
    const raw = await kv.get(ref);
    doc = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
  } catch (err) {
    return res.status(500).json({ error: 'KV error', detail: err.message });
  }

  if (!doc) return res.status(404).json({ error: 'Document non trouvé dans KV', ref });

  console.log('test-pdf: doc trouvé dans KV', { ref, paid: doc.paid, email_sent: doc.email_sent });
  console.log('test-pdf: printUrl =', printUrl);

  // Appeler PDFShift
  const apiKey = process.env.PDFSHIFT_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'PDFSHIFT_API_KEY absente' });

  let pdfResponse;
  try {
    pdfResponse = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`api:${apiKey}`).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: printUrl,
        use_print: true,
        wait_for: '#erp-document-preview',
        delay: 4000,
      }),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur réseau PDFShift', detail: err.message });
  }

  if (!pdfResponse.ok) {
    const errText = await pdfResponse.text().catch(() => 'unknown');
    return res.status(500).json({
      error: 'PDFShift a renvoyé une erreur',
      status: pdfResponse.status,
      detail: errText,
      printUrl,
    });
  }

  const buffer = await pdfResponse.arrayBuffer();

  // Retourner le PDF directement dans le navigateur
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="test-erp.pdf"`);
  res.send(Buffer.from(buffer));
}
