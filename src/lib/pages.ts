import "server-only";
import { prisma } from "@/lib/db";

export type TagMeta = { id: string; slug: string; name: string };
export type CategoryMeta = { id: string; slug: string; name: string };

export type PageMeta = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order: number;
  status: "DRAFT" | "PUBLISHED";
  assignmentPrompt: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: CategoryMeta | null;
  tags: TagMeta[];
};

export type PageEntry = PageMeta & { contentHtml: string };

const metaSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  order: true,
  status: true,
  assignmentPrompt: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, slug: true, name: true } },
  tags: { select: { id: true, slug: true, name: true } },
} as const;

export type PageFilter = {
  search?: string;
  categorySlug?: string;
  tagSlugs?: string[];
};

function buildWhere(
  base: Record<string, unknown>,
  filter?: PageFilter,
): Record<string, unknown> {
  const where: Record<string, unknown> = { ...base };
  if (filter?.search && filter.search.trim().length > 0) {
    const s = filter.search.trim();
    where.OR = [
      { title: { contains: s, mode: "insensitive" } },
      { description: { contains: s, mode: "insensitive" } },
    ];
  }
  if (filter?.categorySlug) {
    where.category = { slug: filter.categorySlug };
  }
  if (filter?.tagSlugs && filter.tagSlugs.length > 0) {
    where.tags = { some: { slug: { in: filter.tagSlugs } } };
  }
  return where;
}

export async function listPublishedPages(filter?: PageFilter): Promise<PageMeta[]> {
  return prisma.page.findMany({
    where: buildWhere({ status: "PUBLISHED" }, filter),
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: metaSelect,
  });
}

export async function getPublishedPage(slug: string): Promise<PageEntry | null> {
  return prisma.page.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { ...metaSelect, contentHtml: true },
  });
}

export async function listAllPages(): Promise<PageMeta[]> {
  return prisma.page.findMany({
    orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    select: metaSelect,
  });
}

export async function getPageById(id: string): Promise<PageEntry | null> {
  return prisma.page.findUnique({
    where: { id },
    select: { ...metaSelect, contentHtml: true },
  });
}

export async function listCategories(): Promise<CategoryMeta[]> {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true },
  });
}

export async function listTags(): Promise<TagMeta[]> {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true },
  });
}

export async function listPublishedCategories(): Promise<CategoryMeta[]> {
  const rows = await prisma.category.findMany({
    where: { pages: { some: { status: "PUBLISHED" } } },
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true },
  });
  return rows;
}
