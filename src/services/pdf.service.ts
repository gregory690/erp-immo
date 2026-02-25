import type { ERPDocument } from '../types/erp.types';

/**
 * Génère un PDF en déclenchant la boîte de dialogue d'impression du navigateur.
 * Résultat : PDF vectoriel, léger, bien paginé — vs html2canvas qui produit
 * une image PNG géante (~24 MB).
 */
export async function generatePDFFromElement(
  elementId: string,
  _filename: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} introuvable`);

  // Injecter un style d'impression temporaire : n'affiche que le document ERP
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-erp-print', 'true');
  styleEl.textContent = `
    @media print {
      @page {
        margin: 8mm 10mm;
        size: A4 portrait;
      }
      /* Masquer tout sauf le document ERP */
      body * { visibility: hidden !important; }
      #${elementId},
      #${elementId} * { visibility: visible !important; }
      #${elementId} {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
      }
      #${elementId} > * {
        overflow: visible !important;
      }
      /* Masquer les éléments no-print (boutons, onglets, etc.) */
      .no-print,
      .no-print * { visibility: hidden !important; display: none !important; }
      /* Afficher la version impression du tableau de risques */
      .print-only { display: block !important; visibility: visible !important; }
      /* Conserver les couleurs d'arrière-plan */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* Éviter qu'un footer de pagination se retrouve seul sur une page blanche */
      .erp-page-footer {
        break-before: avoid !important;
        orphans: 4;
        widows: 4;
      }
      /* Empêcher les blocs de section de se couper au milieu */
      .erp-block {
        break-inside: avoid;
      }
    }
  `;
  document.head.appendChild(styleEl);

  window.print();

  // Nettoyage après fermeture de la boîte de dialogue
  setTimeout(() => {
    document.querySelectorAll('[data-erp-print]').forEach(el => el.remove());
  }, 1000);
}

export function generateERPFilename(document: ERPDocument): string {
  const date = new Date(document.metadata.date_realisation).toISOString().split('T')[0];
  const commune = document.bien.commune.toLowerCase().replace(/\s+/g, '-');
  return `ERP-${commune}-${date}-${document.metadata.reference.slice(0, 8)}.pdf`;
}

/** Impression directe (bouton Imprimer) */
export function printERPDocument(): void {
  window.print();
}
