"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import { FileText, ArrowRightLeft } from "lucide-react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    console.log("File terpilih:", file.name);
    // Nanti kita panggil fungsi convert di sini
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
              <ArrowRightLeft className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl mb-4">
            Modern Document Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Konversi dokumen PDF, DOCX, dan TXT dengan cepat dan aman langsung
            di browser Anda.
          </p>
        </div>

        {/* Main Card Section */}
        <div className="bg-white shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden border border-gray-100">
          <div className="p-8 sm:p-10">
            {/* Area Upload */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Step 1: Upload Dokumen
              </h2>
              <FileUpload onFileSelect={handleFileSelect} />
            </div>

            {/* Area Status File Terpilih (Muncul jika ada file) */}
            {selectedFile && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>

                {/* Tombol Convert Sementara */}
                <button
                  onClick={() =>
                    alert("Nanti kita pasang logic convert di sini!")
                  }
                  disabled={isConverting}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConverting ? "Memproses..." : "Convert Sekarang"}
                </button>
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-8 py-4 text-sm text-gray-500 text-center border-t border-gray-100">
            Technical Test Submission - Next.js 15 App Router
          </div>
        </div>
      </div>
    </main>
  );
}
