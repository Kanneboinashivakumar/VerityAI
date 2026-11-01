import { logger } from "../logger";

export interface ParsedPdfResult {
  text: string;
  pageCount: number;
  pages: Array<{ pageNumber: number; text: string }>;
}

export async function parsePdfBuffer(buffer: Buffer): Promise<ParsedPdfResult> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);

    // Approximate pages by form-feed or paragraph splitting if page texts are aggregated
    const rawText = data.text || "";
    const rawPages = rawText.split(/\f/);
    const pages = rawPages.map((pt, idx) => ({
      pageNumber: idx + 1,
      text: pt.trim(),
    })).filter((p) => p.text.length > 0);

    return {
      text: rawText,
      pageCount: data.numpages || Math.max(1, pages.length),
      pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: rawText }],
    };
  } catch (err: any) {
    logger.error("PDF parsing error", { error: err.message });
    throw new Error(`Failed to extract text from PDF: ${err.message}`);
  }
}
