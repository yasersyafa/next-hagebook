import type { MetadataRoute } from "next";
import { listPublishedPages } from "@/lib/pages";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://next-hagebook.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await listPublishedPages().catch(() => []);

  const lessons: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${SITE_URL}/pages/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/login`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/register`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...lessons,
  ];
}
