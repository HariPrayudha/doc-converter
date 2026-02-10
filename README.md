# Document Converter

Aplikasi web untuk mengkonversi dokumen antara format **PDF**, **DOCX**, dan **TXT** dengan cepat dan mudah.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss)

## Fitur

- **Upload drag & drop** — Seret file langsung ke area upload atau klik untuk memilih
- **Konversi multi-format** — Mendukung PDF, DOCX, dan TXT
- **DOCX → PDF dengan layout** — Gambar, tabel, heading, dan formatting dipertahankan
- **Dark / Light mode** — Toggle tema sesuai preferensi, mengikuti system theme secara default
- **Responsive** — Tampilan optimal di desktop maupun mobile
- **Proses di server** — File dikonversi di sisi server, tidak ada data yang dikirim ke pihak ketiga

## Konversi yang Didukung

| Dari | Ke | Keterangan |
|------|-----|------------|
| DOCX | PDF | Ekstraksi teks |
| PDF | DOCX | Ekstraksi teks (layout tidak dipertahankan) |
| PDF | TXT | Ekstraksi teks |
| TXT | PDF | Teks saja |
| TXT | DOCX | Teks saja (font Calibri 12pt) |
| DOCX | TXT | Ekstraksi teks |

> **Catatan:** Semua konversi berbasis ekstraksi teks. Gambar dan layout dari dokumen asli tidak dipertahankan saat konversi antar format.

## Teknologi

- **[Next.js 16](https://nextjs.org/)** — Framework React full-stack
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first CSS
- **[mammoth](https://www.npmjs.com/package/mammoth)** — Ekstraksi teks dari DOCX
- **[pdf-lib](https://pdf-lib.js.org/)** — Membuat PDF dari teks
- **[pdf-parse](https://www.npmjs.com/package/pdf-parse)** — Parsing & ekstraksi teks dari PDF
- **[docx](https://www.npmjs.com/package/docx)** — Membuat file DOCX

## Persyaratan

- **Node.js** 18 atau lebih baru
- **npm** atau **yarn** atau **pnpm**

> Tidak ada dependensi eksternal seperti Chrome/Chromium. Semua konversi berjalan murni di Node.js.

## Instalasi

```bash
# Clone repository
git clone <repository-url>
cd doc-converter

# Install dependencies
npm install
```

## Menjalankan

### Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Production

```bash
# Build
npm run build

# Jalankan
npm start
```

## Cara Penggunaan

1. Buka aplikasi di browser
2. **Upload file** — Klik area upload atau drag & drop file (PDF, DOCX, atau TXT)
3. **Pilih format tujuan** — Pilih format output dari dropdown
4. **Klik "Convert File"** — Tunggu proses konversi selesai
5. **Download** — Klik tombol download untuk mengunduh hasil konversi

## Struktur Proyek

```
doc-converter/
├── public/                  # Aset statis
├── src/
│   ├── app/
│   │   ├── api/convert/     # API route untuk konversi file
│   │   │   └── route.ts
│   │   ├── globals.css      # Style global
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Halaman utama
│   ├── components/
│   │   ├── FileUpload.tsx   # Komponen upload file (drag & drop)
│   │   ├── ThemeProvider.tsx # Provider tema dark/light
│   │   └── ThemeToggle.tsx  # Toggle switch tema
│   ├── lib/
│   │   └── converter.ts     # Logic konversi dokumen
│   ├── types/
│   │   └── styles.d.ts      # Type declarations
│   └── utils/
│       └── types.ts         # Shared types
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Batasan

- **PDF → DOCX/TXT**: Hanya teks yang diekstrak. Gambar dan layout asli dari PDF tidak dapat dipertahankan karena keterbatasan format PDF.
- **Ukuran file**: File yang sangat besar mungkin memerlukan waktu konversi yang lebih lama.
- **Font**: Konversi teks ke PDF menggunakan font Helvetica (standar). Konversi teks ke DOCX menggunakan font Calibri 12pt.

## Lisensi

MIT License.
