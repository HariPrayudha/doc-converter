import { Document, Packer, Paragraph, TextRun } from "docx";
import mammoth from "mammoth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { PDFParse } from "pdf-parse";

const MAX_CHARS_PER_LINE = 90;
const LINE_HEIGHT = 16;
const FONT_SIZE = 11;
const PAGE_MARGIN = 50;

function splitTextToLines(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n");
  const sourceLines = normalized.split("\n");
  const result: string[] = [];

  for (const sourceLine of sourceLines) {
    if (!sourceLine.trim()) {
      result.push("");
      continue;
    }

    let current = "";
    const words = sourceLine.split(/\s+/);

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > MAX_CHARS_PER_LINE) {
        if (current) {
          result.push(current);
        }
        current = word;
      } else {
        current = next;
      }
    }

    if (current) {
      result.push(current);
    }
  }

  return result;
}

export async function pdfToText(inputBuffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: inputBuffer });
  try {
    const parsed = await parser.getText();
    return parsed.text.trim();
  } finally {
    await parser.destroy();
  }
}

export async function docxToText(inputBuffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer: inputBuffer });
  return result.value.trim();
}

export async function textToPdf(inputText: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const lines = splitTextToLines(inputText || "");

  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const usableHeight = height - PAGE_MARGIN * 2;
  const maxLinesPerPage = Math.max(1, Math.floor(usableHeight / LINE_HEIGHT));

  for (let i = 0; i < lines.length; i += 1) {
    const lineIndexOnPage = i % maxLinesPerPage;
    if (i > 0 && lineIndexOnPage === 0) {
      page = pdfDoc.addPage();
    }

    const y = height - PAGE_MARGIN - lineIndexOnPage * LINE_HEIGHT;
    page.drawText(lines[i], {
      x: PAGE_MARGIN,
      y,
      size: FONT_SIZE,
      font,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: width - PAGE_MARGIN * 2,
    });
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

export async function textToDocx(inputText: string): Promise<Buffer> {
  const normalized = inputText.replace(/\r\n/g, "\n");
  const paragraphs = normalized.split("\n").map((line) =>
    new Paragraph({
      children: [new TextRun(line || " ")],
    }),
  );

  const doc = new Document({
    sections: [{ children: paragraphs }],
  });

  const bytes = await Packer.toBuffer(doc);
  return Buffer.from(bytes);
}

export async function convertFileBuffer(
  sourceExt: "pdf" | "docx" | "txt",
  targetExt: "pdf" | "docx" | "txt",
  inputBuffer: Buffer,
): Promise<Buffer> {
  if (sourceExt === targetExt) {
    return inputBuffer;
  }

  if (sourceExt === "txt" && targetExt === "pdf") {
    return textToPdf(inputBuffer.toString("utf-8"));
  }

  if (sourceExt === "pdf" && targetExt === "txt") {
    const text = await pdfToText(inputBuffer);
    return Buffer.from(text, "utf-8");
  }

  if (sourceExt === "pdf" && targetExt === "docx") {
    const text = await pdfToText(inputBuffer);
    return textToDocx(text);
  }

  if (sourceExt === "docx" && targetExt === "pdf") {
    const text = await docxToText(inputBuffer);
    return textToPdf(text);
  }

  throw new Error(`Unsupported conversion: ${sourceExt} -> ${targetExt}`);
}
