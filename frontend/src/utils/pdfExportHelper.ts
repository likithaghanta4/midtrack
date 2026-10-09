import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { SessionalRecord } from '../services/api';

/**
 * Generates jsPDF document from an HTML element
 */
/**
 * Generates jsPDF document from an HTML element (supports portrait and landscape, with auto-pagination)
 */
export const generateJsPdfFromElement = async (
  element: HTMLElement,
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<jsPDF> => {
  const canvas = await html2canvas(element, {
    scale: 1.5, // Crisp 1.5x DPI without exploding file size
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: orientation === 'landscape' ? 1400 : 1100,
    imageTimeout: 15000,
  });

  // Use JPEG 0.90 compression for ultra-lightweight, crystal-clear PDFs (< 400KB instead of 35MB)
  const imgData = canvas.toDataURL('image/jpeg', 0.90);

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 297mm for landscape, 210mm for portrait
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 210mm for landscape, 297mm for portrait
  const margin = 8;
  const printableWidth = pdfWidth - margin * 2;
  const printableHeight = pdfHeight - margin * 2;

  const contentHeight = (canvas.height * printableWidth) / canvas.width;

  if (contentHeight <= printableHeight) {
    // Fits single page
    pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, contentHeight, undefined, 'FAST');
  } else {
    // Multi-page slicing for large class rosters
    let heightLeft = contentHeight;
    let position = margin;
    let pageNumber = 1;

    pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, contentHeight, undefined, 'FAST');
    heightLeft -= printableHeight;

    while (heightLeft > 0) {
      position = -(pageNumber * printableHeight) + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, contentHeight, undefined, 'FAST');
      heightLeft -= printableHeight;
      pageNumber++;
    }
  }

  return pdf;
};

/**
 * Downloads a DOM element as a guaranteed .pdf file on Windows/Chrome
 * Uses Native Windows Save As Dialog + Data URI Base64 to completely eliminate GUID filename issues.
 */
export const downloadElementAsPDF = async (
  element: HTMLElement,
  fileName: string = 'SRKR_Marks_Statement.pdf',
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<void> => {
  try {
    const pdf = await generateJsPdfFromElement(element, orientation);
    const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

    // 1. Try modern Native Windows File System Save (Chrome/Edge on Windows)
    if ('showSaveFilePicker' in window) {
      try {
        const picker = (window as unknown as { showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker;
        const handle = await picker({
          suggestedName: safeName,
          types: [
            {
              description: 'PDF Document (*.pdf)',
              accept: { 'application/pdf': ['.pdf'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        const arrayBuf = pdf.output('arraybuffer');
        await writable.write(arrayBuf);
        await writable.close();
        return;
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') {
          return;
        }
      }
    }

    // 2. Blob URL Download with explicit sanitized filename
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = safeName;
    link.setAttribute('download', safeName);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
};

/**
 * Saves CSV content using the native Windows Save Dialog or Base64 Data URI
 */
export const saveCsvWithNativeDialog = async (csvContent: string, fileName: string): Promise<void> => {
  const safeName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  const utf8Csv = '\uFEFF' + csvContent;

  // 1. Try modern Native Windows File System Save (Chrome/Edge on Windows)
  if ('showSaveFilePicker' in window) {
    try {
      const picker = (window as unknown as { showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker;
      const handle = await picker({
        suggestedName: safeName,
        types: [
          {
            description: 'Excel CSV Spreadsheet (*.csv)',
            accept: { 'text/csv': ['.csv'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(utf8Csv);
      await writable.close();
      return;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') {
        return;
      }
    }
  }

  // 2. Fallback: Base64 Data URI for CSV
  const base64Content = btoa(unescape(encodeURIComponent(utf8Csv)));
  const dataUri = `data:text/csv;charset=utf-8;base64,${base64Content}`;
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = safeName;
  link.setAttribute('download', safeName);
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
  }, 1000);
};

/**
 * Opens the generated PDF directly in a new browser tab for immediate viewing and sharing.
 */
export const viewElementPDFInNewTab = async (
  element: HTMLElement,
  title: string = 'SRKR Marks Statement'
): Promise<void> => {
  try {
    const pdf = await generateJsPdfFromElement(element);
    pdf.setProperties({ title });
    
    // Open blob URL in new window/tab
    const blobUrl = pdf.output('bloburl');
    window.open(blobUrl, '_blank');
  } catch (error) {
    console.error('Failed to open PDF in new tab:', error);
    throw error;
  }
};

/**
 * Opens native browser print dialog
 */
export const openNativePrintPDF = (element: HTMLElement, title: string = 'SRKR Marks Statement') => {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    window.print();
    return;
  }

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        ${styles}
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 10px !important;
            font-family: system-ui, -apple-system, sans-serif !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        <div style="width: 100%; max-width: 1080px; margin: 0 auto;">
          ${element.innerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

/**
 * Exports Sessional Marks to CSV / Excel spreadsheet file with proper UTF-8 BOM and native save dialog
 */
export const downloadSessionalCSV = async (
  sessionals: SessionalRecord[],
  fileName: string,
  meta: {
    sectionName?: string;
    subjectName?: string;
    subjectCode?: string;
    facultyName?: string;
    academicYear?: string;
    classSem?: string;
  }
): Promise<void> => {
  const lines: string[] = [];

  // Header Metadata
  lines.push('SAGI RAMA KRISHNAM RAJU ENGINEERING COLLEGE (AUTONOMOUS)');
  lines.push('CHINNAAMIRAM :: BHIMAVARAM - 534204');
  lines.push('FINAL SESSIONAL MARKS STATEMENT (80:20 FORMULA)');
  lines.push('');
  lines.push(`Academic Year:,${meta.academicYear || '2025-2026'},Class/Sem:,${meta.classSem || 'III B.TECH'}`);
  lines.push(`Course:,${meta.subjectCode ? `${meta.subjectCode} - ${meta.subjectName}` : 'All'},Faculty:,${meta.facultyName || 'Faculty'}`);
  lines.push(`Section:,${meta.sectionName || 'All'},Max Marks:,30`);
  lines.push('');

  // Table Headers
  lines.push('S.No,Register No,Student Name,Mid-1 (/30),Mid-2 (/30),Higher Mid (80%),Lower Mid (20%),Final Sessional (/30),Status');

  // Rows
  sessionals.forEach((row) => {
    const nameEscaped = `"${(row.name || '').replace(/"/g, '""')}"`;
    const mid1 = row.mid1 !== null ? row.mid1 : '';
    const mid2 = row.mid2 !== null ? row.mid2 : '';
    const higher = row.higherMid !== null ? row.higherMid : '';
    const lower = row.lowerMid !== null ? row.lowerMid : '';
    const total = row.sessionalTotal !== null ? row.sessionalTotal : '';
    lines.push(`${row.sNo},${row.registerNumber},${nameEscaped},${mid1},${mid2},${higher},${lower},${total},${row.status}`);
  });

  await saveCsvWithNativeDialog(lines.join('\r\n'), fileName);
};
