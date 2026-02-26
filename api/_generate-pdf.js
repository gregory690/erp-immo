// Helper partagé — génère un PDF via PDFShift et retourne un objet attachment Resend
// Variables d'environnement requises :
//   PDFSHIFT_API_KEY → dashboard.pdfshift.io → API Keys

/**
 * @param {string} printUrl  URL de la page /print?ref=xxx sur le domaine déployé
 * @param {string} filename  Nom du fichier PDF (ex: ERP-paris-2026-02-26-abc12345.pdf)
 * @returns {{ filename: string, content: string } | null}  Attachment Resend (base64) ou null si erreur
 */
export async function generatePDFAttachment(printUrl, filename) {
  const apiKey = process.env.PDFSHIFT_API_KEY;
  if (!apiKey) {
    console.warn('_generate-pdf: PDFSHIFT_API_KEY absente — PDF non joint à l\'email');
    return null;
  }

  const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
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

  if (!response.ok) {
    const errText = await response.text().catch(() => 'unknown');
    throw new Error(`PDFShift ${response.status}: ${errText}`);
  }

  const buffer = await response.arrayBuffer();
  return {
    filename,
    content: Buffer.from(buffer).toString('base64'),
  };
}

/** Construit le nom de fichier PDF à partir des données du document ERP */
export function buildPDFFilename(erpDocument) {
  const commune = (erpDocument.bien?.commune || 'commune')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  const date = new Date(erpDocument.metadata?.date_realisation || Date.now())
    .toISOString().split('T')[0];
  const ref = (erpDocument.metadata?.reference || '').slice(0, 8);
  return `ERP-${commune}-${date}-${ref}.pdf`;
}
