import "pdf-parse/worker";
import { PDFParse, VerbosityLevel } from "pdf-parse";
import { Document, Packer, Paragraph, TextRun } from "docx";
import mammoth from "mammoth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import puppeteer from "puppeteer";

const MAX_CHARS_PER_LINE = 90;
const LINE_HEIGHT = 16;
const FONT_SIZE = 11;
const PAGE_MARGIN = 50;

/**
 * WinAnsi (Latin-1) characters supported by pdf-lib StandardFonts.
 * Replace unsupported characters so drawText never throws.
 */
function sanitizeForPdf(text: string): string {
  return text.replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, (ch) => {
    const map: Record<string, string> = {
      "\u2018": "'",
      "\u2019": "'",
      "\u201C": '"',
      "\u201D": '"',
      "\u2013": "-",
      "\u2014": "--",
      "\u2026": "...",
      "\u2022": "*",
      "\u00A0": " ",
      "\u200B": "",
      "\u200C": "",
      "\u200D": "",
      "\uFEFF": "",
    };
    return map[ch] ?? "?";
  });
}

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
  const ab = inputBuffer.buffer.slice(
    inputBuffer.byteOffset,
    inputBuffer.byteOffset + inputBuffer.byteLength,
  ) as ArrayBuffer;
  const parser = new PDFParse({
    data: ab,
    verbosity: VerbosityLevel.WARNINGS,
  });
  try {
    const result = await parser.getText();
    const cleaned = (result.text ?? "")
      .replace(/\n--\s*\d+\s+of\s+\d+\s*--\n?/g, "\n")
      .trim();
    return cleaned;
  } finally {
    await parser.destroy();
  }
}

export async function docxToText(inputBuffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer: inputBuffer });
  return result.value.trim();
}

/**
 * Convert DOCX → HTML (preserving images as embedded base64, formatting, tables, etc.)
 */
async function docxToHtml(inputBuffer: Buffer): Promise<string> {
  const result = await mammoth.convertToHtml(
    { buffer: inputBuffer },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        const imageBuffer = await image.read();
        const base64 = Buffer.from(imageBuffer).toString("base64");
        const contentType = image.contentType || "image/png";
        return { src: `data:${contentType};base64,${base64}` };
      }),
    },
  );
  return result.value;
}

/**
 * Wrap mammoth HTML in a full document with styling that preserves layout
 */
function wrapHtmlDocument(htmlBody: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {
    size: A4;
    margin: 2cm;
  }
  body {
    font-family: 'Segoe UI', 'Arial', 'Helvetica Neue', sans-serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #1a1a1a;
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  h1 { font-size: 20pt; font-weight: bold; margin: 16pt 0 8pt; }
  h2 { font-size: 16pt; font-weight: bold; margin: 14pt 0 6pt; }
  h3 { font-size: 13pt; font-weight: bold; margin: 12pt 0 4pt; }
  p { margin: 0 0 8pt; }
  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 8pt 0;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 8pt 0;
  }
  td, th {
    border: 1px solid #999;
    padding: 6pt 8pt;
    text-align: left;
    vertical-align: top;
  }
  th {
    background-color: #f0f0f0;
    font-weight: bold;
  }
  ul, ol { margin: 4pt 0; padding-left: 24pt; }
  li { margin-bottom: 4pt; }
  strong, b { font-weight: bold; }
  em, i { font-style: italic; }
  u { text-decoration: underline; }
</style>
</head>
<body>${htmlBody}</body>
</html>`;
}

/**
 * Convert DOCX → PDF preserving images and layout using mammoth + puppeteer
 */
export async function docxToPdfWithLayout(
  inputBuffer: Buffer,
): Promise<Buffer> {
  const htmlBody = await docxToHtml(inputBuffer);
  const fullHtml = wrapHtmlDocument(htmlBody);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });
    const pdfUint8 = await page.pdf({
      format: "A4",
      margin: { top: "2cm", bottom: "2cm", left: "2cm", right: "2cm" },
      printBackground: true,
    });
    return Buffer.from(pdfUint8);
  } finally {
    await browser.close();
  }
}

export async function textToPdf(inputText: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const safeText = sanitizeForPdf(inputText || "");
  const lines = splitTextToLines(safeText);

  if (lines.length === 0) {
    pdfDoc.addPage();
    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
  }

  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const usableHeight = height - PAGE_MARGIN * 2;
  const maxLinesPerPage = Math.max(1, Math.floor(usableHeight / LINE_HEIGHT));

  for (let i = 0; i < lines.length; i += 1) {
    const lineIndexOnPage = i % maxLinesPerPage;
    if (i > 0 && lineIndexOnPage === 0) {
      page = pdfDoc.addPage();
    }

    const lineText = lines[i];
    if (!lineText) continue;

    const y = height - PAGE_MARGIN - lineIndexOnPage * LINE_HEIGHT;
    page.drawText(lineText, {
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
  const paragraphs = normalized.split("\n").map(
    (line) =>
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
    return docxToPdfWithLayout(inputBuffer);
  }

  if (sourceExt === "txt" && targetExt === "docx") {
    return textToDocx(inputBuffer.toString("utf-8"));
  }

  if (sourceExt === "docx" && targetExt === "txt") {
    const text = await docxToText(inputBuffer);
    return Buffer.from(text, "utf-8");
  }

  throw new Error(`Unsupported conversion: ${sourceExt} -> ${targetExt}`);
}
