"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileType } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-6 sm:p-10 text-center cursor-pointer transition-colors
        ${
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
            : "border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2.5 sm:gap-3">
        <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
          {isDragActive ? (
            <FileType className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
          ) : (
            <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          )}
        </div>
        <div>
          <p className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-100">
            {isDragActive
              ? "Drop file di sini..."
              : "Klik atau Drag file ke sini"}
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 mt-1">
            Support: PDF, DOCX, TXT
          </p>
        </div>
      </div>
    </div>
  );
}
