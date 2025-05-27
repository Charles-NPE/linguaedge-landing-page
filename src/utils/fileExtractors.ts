
// @ts-nocheck
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import mammoth from "mammoth/mammoth.browser";

// Load pdfjs worker (vite)
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.js";

export const PdfLoader = async (file: File): Promise<string> => {
  // Check file size limit (2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("File too large. Maximum size is 2MB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: any) => it.str).join(" ") + "\n";
  }
  
  return text.trim();
};

export const DocxLoader = async (file: File): Promise<string> => {
  // Check file size limit (2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("File too large. Maximum size is 2MB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value.trim();
};
