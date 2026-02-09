export type SupportedExtension = "pdf" | "docx" | "txt";

export interface ConversionResult {
  sourceName: string;
  outputFilename: string;
  blob: Blob;
}
