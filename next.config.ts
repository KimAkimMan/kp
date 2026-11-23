import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Expose R2 storage config ke browser agar getPublicStorageUrl (client-only)
  // dapat membangun URL publik. Nilai dibaca dari .env (server-side at build time)
  // lalu di-inject sebagai NEXT_PUBLIC_* untuk client.
  env: {
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    NEXT_PUBLIC_R2_BUCKET: process.env.R2_BUCKET,
    NEXT_PUBLIC_R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  },
};

export default nextConfig;
