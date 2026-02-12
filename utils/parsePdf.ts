import { TextItem } from 'pdfjs-dist/types/src/display/api';

export const parsePdf = async (file: File): Promise<string[][]> => {
  // DYNAMIC IMPORT: Fixes "DOMMatrix is not defined" error
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullTextRows: string[][] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as TextItem[];

    const rows: Record<number, { str: string; x: number }[]> = {};
    
    items.forEach((item) => {
      const y = Math.round(item.transform[5]); 
      if (!rows[y]) rows[y] = [];
      rows[y].push({ str: item.str, x: item.transform[4] });
    });

    const sortedRows = Object.keys(rows)
      .map(Number)
      .sort((a, b) => b - a)
      .map((y) => rows[y].sort((a, b) => a.x - b.x).map(item => item.str));

    fullTextRows = [...fullTextRows, ...sortedRows];
  }

  return fullTextRows;
};

export const extractAttendanceData = (rows: string[][]) => {
  const extractedData: { subject: string; total: number; present: number }[] = [];
  const isNum = (str: string) => !isNaN(parseInt(str)) && str.trim() !== '';

  rows.forEach((row) => {
    const cleanRow = row.map(s => s.trim()).filter(s => s !== '');
    
    if (cleanRow.length >= 4) {
      const heldIndex = cleanRow.findIndex(item => item === 'Held');
      if(heldIndex !== -1) return;

      const heldIndexVal = cleanRow.length - 3;
      const attendedIndex = cleanRow.length - 2;
      
      const heldStr = cleanRow[heldIndexVal];
      const attendedStr = cleanRow[attendedIndex];

      if (isNum(heldStr) && isNum(attendedStr)) {
        let subjectParts = cleanRow.slice(0, heldIndexVal);
        if (isNum(subjectParts[0])) subjectParts.shift();

        const subject = subjectParts.join(' ');
        const total = parseInt(heldStr);
        const present = parseInt(attendedStr);

        if (subject.toLowerCase() !== 'total' && subject.length > 0) {
           extractedData.push({ subject, total, present });
        }
      }
    }
  });

  return extractedData;
};