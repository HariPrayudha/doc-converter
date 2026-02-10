import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "puppeteer-core", "@sparticuz/chromium"],
};

export default nextConfig;
