import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_NAME_EN, APP_URL } from "@/lib/constants";

const cairo = Cairo({
  subsets:  ["arabic", "latin"],
  weight:   ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display:  "swap",
  preload:  true,
});

// ── Site-wide default metadata ────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || APP_URL),

  title: {
    default:  `${APP_NAME} | منصة المتاجر الرقمية عبر واتساب`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "أنشئ متجرك الإلكتروني في دقائق وابدأ البيع لآلاف العملاء. الطلبات تصل مباشرة عبر واتساب — بدون دفع إلكتروني أو تعقيدات.",

  keywords: [
    "متجر إلكتروني",
    "واتساب كوميرس",
    "تجارة إلكترونية",
    "متاجر زون",
    "Mtajer Zone",
    "WhatsApp commerce",
    "إنشاء متجر",
    "بيع عبر واتساب",
    "دليل المتاجر",
  ],

  authors:  [{ name: APP_NAME_EN, url: process.env.NEXT_PUBLIC_APP_URL || APP_URL }],
  creator:  APP_NAME_EN,
  publisher: APP_NAME_EN,

  // Canonical base — page-level canonicals set in generateMetadata
  alternates: {
    canonical: "/",
    languages: { "ar-EG": "/" },
  },

  openGraph: {
    type:        "website",
    locale:      "ar_EG",
    url:         process.env.NEXT_PUBLIC_APP_URL || APP_URL,
    siteName:    APP_NAME,
    title:       `${APP_NAME} | منصة المتاجر الرقمية عبر واتساب`,
    description: "أنشئ متجرك الإلكتروني وابدأ البيع عبر واتساب — بدون دفع إلكتروني.",
    images: [
      {
        url:    "/og-image.png",
        width:  1200,
        height: 630,
        alt:    `${APP_NAME} — منصة المتاجر الرقمية`,
      },
    ],
  },

  twitter: {
    card:        "summary_large_image",
    site:        "@MtajerZone",
    creator:     "@MtajerZone",
    title:       `${APP_NAME} | منصة المتاجر الرقمية`,
    description: "أنشئ متجرك وابدأ البيع عبر واتساب.",
    images:      ["/og-image.png"],
  },

  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  icons: {
    icon:    [
      { url: "/favicon.ico",    sizes: "any" },
      { url: "/icon-192.png",   sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png",   sizes: "512x512", type: "image/png" },
    ],
    apple:   [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other:   [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#4F6BFF" }],
  },

  manifest: "/site.webmanifest",

  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

// ── Viewport (theme color, scaling) ──────────────────────────
export const viewport: Viewport = {
  themeColor:     [
    { media: "(prefers-color-scheme: light)", color: "#4F6BFF" },
    { media: "(prefers-color-scheme: dark)",  color: "#1E293B" },
  ],
  width:          "device-width",
  initialScale:   1,
  maximumScale:   5,
};

// ── JSON-LD: Website structured data ─────────────────────────
const websiteJsonLd = {
  "@context":     "https://schema.org",
  "@type":        "WebSite",
  name:           APP_NAME,
  alternateName:  APP_NAME_EN,
  url:            process.env.NEXT_PUBLIC_APP_URL || APP_URL,
  description:    "منصة متكاملة لإنشاء وإدارة المتاجر الرقمية عبر واتساب",
  potentialAction: {
    "@type":       "SearchAction",
    target:        {
      "@type":       "EntryPoint",
      urlTemplate:   `${process.env.NEXT_PUBLIC_APP_URL || APP_URL}/stores?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type":    "Organization",
  name:       APP_NAME,
  url:        process.env.NEXT_PUBLIC_APP_URL || APP_URL,
  logo:       `${process.env.NEXT_PUBLIC_APP_URL || APP_URL}/icon-512.png`,
  sameAs: [
    "https://twitter.com/MtajerZone",
    "https://instagram.com/MtajerZone",
  ],
};

// ── Root layout ───────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {/* DNS prefetch for critical third-party domains */}
        <link rel="dns-prefetch"    href="//res.cloudinary.com" />
        <link rel="preconnect"      href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch"    href="//fonts.googleapis.com" />
      </head>
      <body className="font-cairo antialiased">{children}</body>
    </html>
  );
}
