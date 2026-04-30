import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://next-hagebook.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pages"],
        disallow: ["/admin", "/api", "/dashboard", "/pending", "/verify", "/reset", "/forgot"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
