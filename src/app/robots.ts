import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || APP_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/stores", "/store/", "/product/"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/unauthorized",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host:    base,
  };
}
