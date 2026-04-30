const SITE_URL = process.env.NEXTAUTH_URL ?? "https://next-hagebook.vercel.app";

export function articleJsonLd(args: {
  slug: string;
  title: string;
  description?: string | null;
  publishedAt?: Date | null;
  updatedAt: Date;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.title,
    description: args.description ?? undefined,
    datePublished: (args.publishedAt ?? args.updatedAt).toISOString(),
    dateModified: args.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: args.authorName ?? "HAGE Games",
      url: "https://hagegames.com",
    },
    publisher: {
      "@type": "Organization",
      name: "HAGE Games",
      url: "https://hagegames.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/pages/${args.slug}`,
    },
    image: `${SITE_URL}/opengraph-image`,
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "hagebook",
    url: SITE_URL,
    publisher: {
      "@type": "Organization",
      name: "HAGE Games",
      url: "https://hagegames.com",
    },
  };
}
