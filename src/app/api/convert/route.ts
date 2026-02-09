import { NextRequest, NextResponse } from "next/server";
import { convertFileBuffer } from "@/lib/converter";

export const runtime = "nodejs";

const ALLOWED_EXTENSIONS = ["pdf", "docx", "txt"] as const;
type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

function getExtFromFilename(filename: string): AllowedExtension | null {
  const lower = filename.toLowerCase();
  const matched = ALLOWED_EXTENSIONS.find((ext) => lower.endsWith(`.${ext}`));
  return matched ?? null;
}

function mimeForExtension(ext: AllowedExtension): string {
  if (ext === "pdf") return "application/pdf";
  if (ext === "docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "text/plain; charset=utf-8";
}

function isSupportedPair(sourceExt: AllowedExtension, targetExt: AllowedExtension) {
  const pair = `${sourceExt}->${targetExt}`;
  return (
    pair === "pdf->docx" ||
    pair === "docx->pdf" ||
    pair === "txt->pdf" ||
    pair === "pdf->txt"
  );
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const target = formData.get("target");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File tidak ditemukan." },
        { status: 400 },
      );
    }

    if (typeof target !== "string") {
      return NextResponse.json(
        { error: "Target format tidak valid." },
        { status: 400 },
      );
    }

    const sourceExt = getExtFromFilename(file.name);
    const targetExt = target.toLowerCase() as AllowedExtension;

    if (!sourceExt || !ALLOWED_EXTENSIONS.includes(targetExt)) {
      return NextResponse.json(
        { error: "Format file tidak didukung." },
        { status: 400 },
      );
    }

    if (!isSupportedPair(sourceExt, targetExt)) {
      return NextResponse.json(
        {
          error:
            "Konversi yang didukung hanya PDF<->DOCX dan TXT<->PDF.",
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);
    const outputBuffer = await convertFileBuffer(sourceExt, targetExt, inputBuffer);

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const outputName = `${baseName}.${targetExt}`;

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeForExtension(targetExt),
        "Content-Disposition": `attachment; filename="${outputName}"`,
      },
    });
  } catch (error) {
    console.error("Convert error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat konversi dokumen." },
      { status: 500 },
    );
  }
}
