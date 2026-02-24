import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ERPDocument } from '../types/erp.types';

export async function generatePDFFromElement(
  elementId: string,
  filename: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} not found`);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}

export function generateERPFilename(document: ERPDocument): string {
  const date = new Date(document.metadata.date_realisation).toISOString().split('T')[0];
  const commune = document.bien.commune.toLowerCase().replace(/\s+/g, '-');
  return `ERP-${commune}-${date}-${document.metadata.reference.slice(0, 8)}.pdf`;
}

/** Print the ERP document using the browser's print dialog */
export function printERPDocument(): void {
  window.print();
}
