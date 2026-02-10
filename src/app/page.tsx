"use client";

import { useMemo, useState } from "react";
import FileUpload from "@/components/FileUpload";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FileText, ArrowRightLeft, Sparkles } from "lucide-react";
import { ConversionResult } from "@/utils/types";

const EXTENSIONS = ["pdf", "docx", "txt"] as const;
type Extension = (typeof EXTENSIONS)[number];

function extensionFromFilename(filename: string): Extension | null {
  const lower = filename.toLowerCase();
  const found = EXTENSIONS.find((ext) => lower.endsWith(`.${ext}`));
  return found ?? null;
}

function conversionTargets(ext: Extension | null): Extension[] {
  if (ext === "pdf") return ["docx", "txt"];
  if (ext === "docx") return ["pdf", "txt"];
  if (ext === "txt") return ["pdf", "docx"];
  return [];
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [targetFormat, setTargetFormat] = useState<Extension | "">("");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sourceExt = useMemo(
    () => (selectedFile ? extensionFromFilename(selectedFile.name) : null),
    [selectedFile],
  );

  const targetOptions = useMemo(
    () => conversionTargets(sourceExt),
    [sourceExt],
  );

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setErrorMessage(null);

    const selectedExt = extensionFromFilename(file.name);
    const options = conversionTargets(selectedExt);
    setTargetFormat(options[0] ?? "");
  };

  const handleConvert = async () => {
    if (!selectedFile || !targetFormat) return;

    setIsConverting(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("target", targetFormat);

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Gagal melakukan konversi.");
      }

      const arrayBuffer = await response.arrayBuffer();
      const mimeType =
        response.headers.get("content-type") || "application/octet-stream";
      const blob = new Blob([arrayBuffer], { type: mimeType });
      const sourceName = selectedFile.name.replace(/\.[^/.]+$/, "");
      const outputFilename = `${sourceName}.${targetFormat}`;

      setResult({
        sourceName: selectedFile.name,
        outputFilename,
        blob,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan.",
      );
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const nav = window.navigator as Navigator & {
      msSaveOrOpenBlob?: (blob: Blob, filename: string) => boolean;
    };
    if (nav.msSaveOrOpenBlob) {
      nav.msSaveOrOpenBlob(result.blob, result.outputFilename);
      return;
    }

    const url = URL.createObjectURL(result.blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.outputFilename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    setTimeout(() => {
      anchor.click();
      setTimeout(() => {
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      }, 10000);
    }, 100);
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 py-8 px-3 sm:py-12 sm:px-6 lg:px-8 transition-colors duration-700 ease-in-out">
      <nav className="absolute top-0 right-0 p-4 sm:p-6 z-10">
        <ThemeToggle />
      </nav>

      <div className="max-w-3xl mx-auto mt-12 sm:mt-8">
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-linear-to-r from-brand-400 to-blue-700 rounded-2xl blur opacity-30 dark:opacity-50"></div>
              <div className="relative p-3 sm:p-4 bg-white dark:bg-dark-card rounded-2xl shadow-xl">
                <ArrowRightLeft className="w-6 h-6 sm:w-8 sm:h-8 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight sm:text-4xl md:text-5xl transition-colors duration-500">
            <span className="text-brand-600 dark:text-brand-400">Document</span>{" "}
            Converter
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto px-2 transition-colors duration-500">
            Konversi file PDF, DOCX, dan TXT dengan cepat.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-none rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors duration-500">
          <div className="p-5 sm:p-8 md:p-10">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 sm:mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-500 shrink-0" />
                Upload Dokumen
              </h2>
              <FileUpload onFileSelect={handleFileSelect} />
            </div>

            {selectedFile && (
              <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/30 rounded-xl p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 w-full">
                  <div className="p-2.5 sm:p-3 bg-white dark:bg-brand-900/40 rounded-lg shadow-sm shrink-0">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                  <select
                    value={targetFormat}
                    onChange={(event) =>
                      setTargetFormat(event.target.value as Extension)
                    }
                    className="px-3 sm:px-4 py-2.5 rounded-xl border border-brand-200 dark:border-brand-900/40 bg-white dark:bg-slate-800 text-sm sm:text-base text-slate-800 dark:text-slate-100 outline-none"
                  >
                    {targetOptions.map((option) => (
                      <option key={option} value={option}>
                        Convert ke {option.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleConvert}
                    disabled={isConverting || !targetFormat}
                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 text-sm sm:text-base text-white font-medium rounded-xl transition-all shadow-lg shadow-brand-600/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isConverting ? "Memproses..." : "Convert File"}
                  </button>
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errorMessage}
                  </p>
                )}

                {result && (
                  <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-sm sm:text-base text-white font-medium rounded-xl transition-all truncate"
                  >
                    Download {result.outputFilename}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="bg-slate-100 dark:bg-slate-950 px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 text-center border-t border-slate-200 dark:border-slate-700 transition-colors duration-500">
            Ready to convert your documents
          </div>
        </div>
      </div>
    </main>
  );
}
