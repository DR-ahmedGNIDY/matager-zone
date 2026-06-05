import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Images ────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    // Cloudinary transformations already optimised — no need to double-process
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes:    [640, 750, 828, 1080, 1200, 1920],
    imageSizes:     [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ── Node.js packages that can't run on Edge ───────────────
  serverExternalPackages: ["@prisma/client", "bcryptjs", "nodemailer"],

  // ── Compiler ──────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // ── HTTP Headers (backup — middleware sets these too) ─────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",            value: "DENY" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Long-lived cache for static assets
        source: "/(_next/static|favicon.ico|icon-192.png|icon-512.png|site.webmanifest)(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // OG image cache
        source: "/og-image.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=3600" },
        ],
      },
    ];
  },

  // ── Redirects ─────────────────────────────────────────────
  async redirects() {
    return [
      // Ensure trailing-slash consistency
      { source: "/stores/", destination: "/stores", permanent: true },
      // Legacy route aliases
      { source: "/shop",    destination: "/stores", permanent: true },
    ];
  },
};

export default nextConfig;
