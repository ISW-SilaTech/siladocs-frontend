// Extracción de texto de PDF 100% en el navegador, usada para detectar la
// estructura del sílabo antes de subirlo (sin depender del backend).
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export const extractPdfText = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageTexts: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pageTexts.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
  }
  return pageTexts.join('\n');
};

export interface PdfLine {
  page: number;
  text: string;
}

// Agrupa los fragmentos de texto de cada página en "líneas" (mismo eje Y)
// para que el mapeador de plantillas pueda mostrar encabezados clicables
// en vez de palabras sueltas.
export const extractPdfLines = async (file: File): Promise<PdfLine[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const lines: PdfLine[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const rows = new Map<number, string[]>();

    content.items.forEach((item) => {
      if (!('str' in item) || !item.str.trim()) return;
      const y = Math.round(item.transform[5]);
      const existing = rows.get(y) ?? [];
      existing.push(item.str);
      rows.set(y, existing);
    });

    Array.from(rows.entries())
      .sort((a, b) => b[0] - a[0])
      .forEach(([, parts]) => {
        const text = parts.join(' ').replace(/\s+/g, ' ').trim();
        if (text) lines.push({ page: pageNumber, text });
      });
  }
  return lines;
};
