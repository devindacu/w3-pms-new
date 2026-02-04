/**
 * Universal Print Utility for A4 Size Documents
 * Supports Print Preview, PDF Download, and Word Document Download
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// A4 size constants (in mm and pixels at 96 DPI)
export const A4_SIZE = {
  width: 210, // mm
  height: 297, // mm
  widthPx: 794, // pixels
  heightPx: 1123, // pixels
  margin: 20, // mm
  marginPx: 76 // pixels
};

export interface PrintOptions {
  title?: string;
  orientation?: 'portrait' | 'landscape';
  filename?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  headerText?: string;
  footerText?: string;
}

/**
 * Apply A4 print styles to an element
 */
export function applyA4PrintStyles(element: HTMLElement): void {
  element.style.width = `${A4_SIZE.widthPx}px`;
  element.style.minHeight = `${A4_SIZE.heightPx}px`;
  element.style.padding = `${A4_SIZE.marginPx}px`;
  element.style.backgroundColor = 'white';
  element.style.boxSizing = 'border-box';
  element.style.pageBreakAfter = 'always';
  element.style.pageBreakInside = 'avoid';
}

/**
 * Print preview - opens browser print dialog with A4 formatting
 */
export function printPreview(elementId: string, options: PrintOptions = {}): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  // Create a hidden iframe for printing
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'absolute';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = 'none';
  document.body.appendChild(printFrame);

  const printDocument = printFrame.contentDocument || printFrame.contentWindow?.document;
  if (!printDocument) {
    console.error('Could not access print document');
    document.body.removeChild(printFrame);
    return;
  }

  // Add print styles
  const styles = `
    @page {
      size: A4 ${options.orientation || 'portrait'};
      margin: ${A4_SIZE.margin}mm;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      
      .print-content {
        width: 100%;
        max-width: ${A4_SIZE.width - (A4_SIZE.margin * 2)}mm;
        margin: 0 auto;
      }
      
      .page-break {
        page-break-after: always;
      }
      
      .no-print {
        display: none !important;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
      }
      
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      
      th {
        background-color: #f5f5f5;
        font-weight: bold;
      }
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
    }
    
    h1 {
      font-size: 18pt;
      margin-bottom: 10px;
    }
    
    h2 {
      font-size: 14pt;
      margin-bottom: 8px;
    }
    
    h3 {
      font-size: 12pt;
      margin-bottom: 6px;
    }
  `;

  printDocument.open();
  printDocument.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${options.title || 'Print Document'}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="print-content">
          ${element.innerHTML}
        </div>
      </body>
    </html>
  `);
  printDocument.close();

  // Wait for content to load then print
  printFrame.contentWindow?.focus();
  setTimeout(() => {
    printFrame.contentWindow?.print();
    // Remove iframe after printing
    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 100);
  }, 500);
}

/**
 * Download as PDF using jsPDF and html2canvas
 */
export async function downloadAsPDF(elementId: string, options: PrintOptions = {}): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  try {
    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF
    const orientation = options.orientation || 'portrait';
    const pdf = new jsPDF({
      orientation: orientation as 'portrait' | 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = orientation === 'portrait' ? A4_SIZE.width : A4_SIZE.height;
    const pdfHeight = orientation === 'portrait' ? A4_SIZE.height : A4_SIZE.width;
    
    const imgWidth = pdfWidth - (A4_SIZE.margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = A4_SIZE.margin;

    // Add first page
    pdf.addImage(imgData, 'PNG', A4_SIZE.margin, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - (A4_SIZE.margin * 2));

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + A4_SIZE.margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', A4_SIZE.margin, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - (A4_SIZE.margin * 2));
    }

    // Add header and footer if requested
    if (options.includeHeader && options.headerText) {
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(options.headerText, A4_SIZE.margin, 10);
      }
    }

    if (options.includeFooter && options.footerText) {
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(options.footerText, A4_SIZE.margin, pdfHeight - 10);
        pdf.text(`Page ${i} of ${pageCount}`, pdfWidth - 30, pdfHeight - 10);
      }
    }

    // Download
    const filename = options.filename || `document-${Date.now()}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Download as Word document (DOCX) using docx library
 */
export async function downloadAsWord(elementId: string, options: PrintOptions = {}): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  try {
    const sections: any[] = [];
    
    // Parse HTML content and convert to Word document structure
    const content = parseHTMLToDocx(element);
    
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            width: A4_SIZE.width * 56.7, // Convert mm to twips
            height: A4_SIZE.height * 56.7,
            margin: {
              top: A4_SIZE.margin * 56.7,
              right: A4_SIZE.margin * 56.7,
              bottom: A4_SIZE.margin * 56.7,
              left: A4_SIZE.margin * 56.7
            }
          }
        },
        children: content
      }]
    });

    const blob = await Packer.toBlob(doc);
    const filename = options.filename || `document-${Date.now()}.docx`;
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw error;
  }
}

/**
 * Helper function to parse HTML to DOCX structure
 */
function parseHTMLToDocx(element: HTMLElement): any[] {
  const children: any[] = [];
  
  // Get all text nodes and elements
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    null
  );

  let node: Node | null;
  let currentParagraph: any[] = [];

  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        currentParagraph.push(new TextRun(text));
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const elem = node as HTMLElement;
      
      // Handle different HTML elements
      if (elem.tagName === 'BR' || elem.tagName === 'P' || elem.tagName === 'DIV') {
        if (currentParagraph.length > 0) {
          children.push(new Paragraph({ children: currentParagraph }));
          currentParagraph = [];
        }
      } else if (elem.tagName.match(/^H[1-6]$/)) {
        if (currentParagraph.length > 0) {
          children.push(new Paragraph({ children: currentParagraph }));
          currentParagraph = [];
        }
        const level = parseInt(elem.tagName[1]);
        const headingText = elem.textContent?.trim() || '';
        children.push(new Paragraph({
          text: headingText,
          heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        }));
      } else if (elem.tagName === 'TABLE') {
        if (currentParagraph.length > 0) {
          children.push(new Paragraph({ children: currentParagraph }));
          currentParagraph = [];
        }
        children.push(parseTableToDocx(elem as HTMLTableElement));
      }
    }
  }

  // Add remaining paragraph
  if (currentParagraph.length > 0) {
    children.push(new Paragraph({ children: currentParagraph }));
  }

  return children.length > 0 ? children : [new Paragraph({ text: element.textContent || '' })];
}

/**
 * Helper function to parse HTML table to DOCX table
 */
function parseTableToDocx(table: HTMLTableElement): Table {
  const rows: TableRow[] = [];
  
  // Parse table rows
  const tableRows = table.querySelectorAll('tr');
  tableRows.forEach(tr => {
    const cells: TableCell[] = [];
    const tableCells = tr.querySelectorAll('th, td');
    
    tableCells.forEach(cell => {
      cells.push(new TableCell({
        children: [new Paragraph(cell.textContent?.trim() || '')],
        width: { size: 100 / tableCells.length, type: WidthType.PERCENTAGE }
      }));
    });
    
    if (cells.length > 0) {
      rows.push(new TableRow({ children: cells }));
    }
  });

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE }
  });
}

/**
 * Show print preview dialog with options
 */
export function showPrintDialog(elementId: string, options: PrintOptions = {}): void {
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 9999;
    min-width: 300px;
  `;

  dialog.innerHTML = `
    <h3 style="margin-top: 0;">Print Options</h3>
    <div style="margin: 16px 0;">
      <button id="btn-print" style="width: 100%; padding: 10px; margin-bottom: 8px; border: none; background: #3b82f6; color: white; border-radius: 4px; cursor: pointer;">Print Preview</button>
      <button id="btn-pdf" style="width: 100%; padding: 10px; margin-bottom: 8px; border: none; background: #10b981; color: white; border-radius: 4px; cursor: pointer;">Download PDF</button>
      <button id="btn-word" style="width: 100%; padding: 10px; margin-bottom: 8px; border: none; background: #8b5cf6; color: white; border-radius: 4px; cursor: pointer;">Download Word</button>
      <button id="btn-cancel" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; background: white; border-radius: 4px; cursor: pointer;">Cancel</button>
    </div>
  `;

  document.body.appendChild(dialog);

  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 9998;
  `;
  document.body.appendChild(backdrop);

  // Handle button clicks
  dialog.querySelector('#btn-print')?.addEventListener('click', () => {
    printPreview(elementId, options);
    document.body.removeChild(dialog);
    document.body.removeChild(backdrop);
  });

  dialog.querySelector('#btn-pdf')?.addEventListener('click', async () => {
    await downloadAsPDF(elementId, options);
    document.body.removeChild(dialog);
    document.body.removeChild(backdrop);
  });

  dialog.querySelector('#btn-word')?.addEventListener('click', async () => {
    await downloadAsWord(elementId, options);
    document.body.removeChild(dialog);
    document.body.removeChild(backdrop);
  });

  dialog.querySelector('#btn-cancel')?.addEventListener('click', () => {
    document.body.removeChild(dialog);
    document.body.removeChild(backdrop);
  });

  backdrop.addEventListener('click', () => {
    document.body.removeChild(dialog);
    document.body.removeChild(backdrop);
  });
}
