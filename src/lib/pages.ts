import "server-only";
import { prisma } from "@/lib/db";

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
} as const;

export async function listPublishedPages(): Promise<PageMeta[]> {
  return prisma.page.findMany({
    where: { status: "PUBLISHED" },
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
