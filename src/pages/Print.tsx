// Page dédiée au rendu PDF via PDFShift
// Accessible sur /print?ref=xxx — pas de chrome (header, boutons, etc.)
// PDFShift appelle cette URL, attend #erp-document-preview, génère le PDF

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ERPPreview } from '../components/report/ERPPreview';
import { fetchERPByReference } from '../services/email.service';
import type { ERPDocument } from '../types/erp.types';

// CSS injecté statiquement pour que PDFShift (use_print: true) rende correctement
const PRINT_CSS = `
  @media print {
    @page { margin: 8mm 10mm; size: A4 portrait; }
    body * { visibility: hidden !important; }
    #erp-document-preview,
    #erp-document-preview * { visibility: visible !important; }
    #erp-document-preview {
      position: absolute !important;
      top: 0 !important; left: 0 !important;
      width: 100% !important;
      height: auto !important;
      overflow: visible !important;
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
    }
    #erp-document-preview > * { overflow: visible !important; }
    .no-print, .no-print * { visibility: hidden !important; display: none !important; }
    .print-only { display: block !important; visibility: visible !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .erp-page-footer { break-before: avoid !important; orphans: 4; widows: 4; }
    .erp-block { break-inside: avoid; }
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
