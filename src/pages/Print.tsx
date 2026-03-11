// Page dédiée au rendu PDF via PDFShift
// Accessible sur /print?ref=xxx — pas de chrome (header, boutons, etc.)
// PDFShift appelle cette URL, attend #erp-document-preview, génère le PDF

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ERPPreview } from '../components/report/ERPPreview';
import { fetchERPByReference } from '../services/email.service';
import type { ERPDocument } from '../types/erp.types';

// CSS injecté statiquement pour que PDFShift (use_print: true) rende correctement.
// IMPORTANT : ne pas utiliser position:absolute sur #erp-document-preview —
// cela retire l'élément du flux normal et casse break-before:page dans Chromium,
// provoquant des pages blanches parasites entre chaque section.
const PRINT_CSS = `
  @media print {
    @page { margin: 8mm 10mm; size: A4 portrait; }
    /* Masquer le chrome avec display:none (pas visibility:hidden qui conserve l'espace) */
    .no-print { display: none !important; }
    /* #erp-document-preview reste dans le flux normal — indispensable pour la pagination */
    #erp-document-preview {
      width: 100% !important;
      overflow: visible !important;
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
    }
    /* Supprimer les bordures divide-y au niveau des sauts de page */
    #erp-document-preview > * { border-top: none !important; }
    .erp-block { break-inside: avoid; }
    .erp-page-footer { break-before: avoid !important; orphans: 4; widows: 4; }
    .erp-risk-legend { break-inside: avoid !important; }
    #erp-document-preview > *:last-child { break-after: avoid !important; page-break-after: avoid !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  }
  /* Écran : masquer tous les éléments chrome */
  body { background: white !important; margin: 0 !important; padding: 0 !important; }
  .no-print { display: none !important; }
  header { display: none !important; }
`;

export default function Print() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  const [erp, setErp] = useState<ERPDocument | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ref) { setError(true); return; }
    fetchERPByReference(ref)
      .then(doc => { if (doc) setErp(doc); else setError(true); })
      .catch(() => setError(true));
  }, [ref]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      {error && <p style={{ padding: 32, color: '#666' }}>Document introuvable.</p>}
      {erp && (
        <ERPPreview document={erp} demoMode={false} staticMode={true} />
      )}
    </>
  );
}
