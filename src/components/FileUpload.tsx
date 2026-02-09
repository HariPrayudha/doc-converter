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
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className="p-4 bg-gray-100 rounded-full">
          {isDragActive ? (
            <FileType className="w-8 h-8 text-blue-500" />
          ) : (
            <UploadCloud className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <div>
          <p className="text-lg font-medium text-gray-700">
            {isDragActive
              ? "Drop file di sini..."
              : "Klik atau Drag file ke sini"}
          </p>
          <p className="text-sm text-gray-500 mt-1">Support: PDF, DOCX, TXT</p>
        </div>
      </div>
    </div>
  );
}
