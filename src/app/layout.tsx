import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google"; // Import font
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

// Konfigurasi Font
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta", // Variable CSS
  display: "swap",
});

export const metadata: Metadata = {
  title: "DocuConvert - Modern Converter",
  description: "Convert PDF, DOCX, and TXT securely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${jakarta.variable} font-sans antialiased transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
