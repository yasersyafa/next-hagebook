"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  pageCreateSchema,
  pageUpdateSchema,
  pageStatusSchema,
  pageDeleteSchema,
} from "@/lib/validators";
import type { ActionResult } from "@/actions/auth";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return null;
  return session.user;
}

function payloadFromForm(fd: FormData) {
  const tagSlugsRaw = fd.get("tagSlugs");
  const tagSlugs =
    typeof tagSlugsRaw === "string" && tagSlugsRaw.length > 0
      ? tagSlugsRaw
          .split(",")
          .map((s) => slugify(s.trim()))
          .filter(Boolean)
      : [];
  return {
    slug: fd.get("slug"),
    title: fd.get("title"),
    description: fd.get("description") || null,
    order: fd.get("order") ?? 0,
    contentHtml: fd.get("contentHtml"),
    assignmentPrompt: fd.get("assignmentPrompt") || null,
    status: fd.get("status") || "DRAFT",
    categoryId: fd.get("categoryId") || null,
    tagSlugs,
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function syncTags(tagSlugs: string[]): Promise<string[]> {
  if (tagSlugs.length === 0) return [];
  const unique = Array.from(new Set(tagSlugs));
  await Promise.all(
    unique.map((slug) =>
      prisma.tag.upsert({
        where: { slug },
        create: { slug, name: slug.replace(/-/g, " ") },
        update: {},
      }),
    ),
  );
  const tags = await prisma.tag.findMany({
    where: { slug: { in: unique } },
    select: { id: true },
  });
  return tags.map((t) => t.id);
}

export async function createPage(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };

  const parsed = pageCreateSchema.safeParse(payloadFromForm(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const existingSlug = await prisma.page.findUnique({ where: { slug: data.slug } });
  if (existingSlug) return { ok: false, error: "Slug already in use" };

  const cleanHtml = sanitizeHtml(data.contentHtml);
  const tagIds = await syncTags(data.tagSlugs);
  const created = await prisma.page.create({
    data: {
      slug: data.slug,
      title: data.title,
      description: data.description ?? null,
      order: data.order,
      contentHtml: cleanHtml,
      assignmentPrompt: data.assignmentPrompt,
      status: data.status,
      authorId: admin.id,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      categoryId: data.categoryId,
      tags: tagIds.length ? { connect: tagIds.map((id) => ({ id })) } : undefined,
    },
    select: { id: true, slug: true },
  });

  revalidatePath("/admin/pages");
  revalidatePath("/");
  revalidatePath("/dashboard");
  if (data.status === "PUBLISHED") revalidatePath(`/pages/${created.slug}`);
  return { ok: true, data: { id: created.id } };
}

export async function updatePage(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };

  const parsed = pageUpdateSchema.safeParse({
    id: formData.get("id"),
    ...payloadFromForm(formData),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const existing = await prisma.page.findUnique({ where: { id: data.id } });
  if (!existing) return { ok: false, error: "Page not found" };

  if (existing.publishedAt && existing.slug !== data.slug) {
    return { ok: false, error: "Slug cannot change after first publish" };
  }

  if (existing.slug !== data.slug) {
    const dupe = await prisma.page.findUnique({ where: { slug: data.slug } });
    if (dupe && dupe.id !== data.id) return { ok: false, error: "Slug already in use" };
  }

  const cleanHtml = sanitizeHtml(data.contentHtml);
  const becomingPublished =
    existing.status === "DRAFT" && data.status === "PUBLISHED";
  const tagIds = await syncTags(data.tagSlugs);

  await prisma.page.update({
    where: { id: data.id },
    data: {
      slug: data.slug,
      title: data.title,
      description: data.description ?? null,
      order: data.order,
      contentHtml: cleanHtml,
      assignmentPrompt: data.assignmentPrompt,
      status: data.status,
      publishedAt: becomingPublished ? new Date() : existing.publishedAt,
      categoryId: data.categoryId,
      tags: { set: tagIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/admin/pages");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/pages/${existing.slug}`);
  revalidatePath(`/pages/${data.slug}`);
  return { ok: true };
}

export async function setPageStatus(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };

  const parsed = pageStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const existing = await prisma.page.findUnique({ where: { id: parsed.data.id } });
  if (!existing) return { ok: false, error: "Page not found" };

  await prisma.page.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
      publishedAt:
        parsed.data.status === "PUBLISHED"
          ? existing.publishedAt ?? new Date()
          : existing.publishedAt,
    },
  });

  revalidatePath("/admin/pages");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/pages/${existing.slug}`);
  return { ok: true };
}

export async function deletePage(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };

  const parsed = pageDeleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const existing = await prisma.page.findUnique({ where: { id: parsed.data.id } });
  if (!existing) return { ok: false, error: "Page not found" };

  await prisma.page.delete({ where: { id: parsed.data.id } });

  revalidatePath("/admin/pages");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/pages/${existing.slug}`);
  return { ok: true };
}

export async function createCategory(formData: FormData): Promise<ActionResult<{ id: string; slug: string; name: string }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };

  const rawName = String(formData.get("name") ?? "").trim();
  if (!rawName) return { ok: false, error: "Name required" };
  if (rawName.length > 80) return { ok: false, error: "Name too long" };

  const slug = slugify(rawName);
  if (!slug) return { ok: false, error: "Invalid name" };

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return { ok: true, data: existing };

  const created = await prisma.category.create({
    data: { slug, name: rawName },
    select: { id: true, slug: true, name: true },
  });
  revalidatePath("/admin/pages");
  return { ok: true, data: created };
}

export async function createPageAndRedirect(formData: FormData) {
  const result = await createPage(formData);
  if (result.ok && result.data) {
    redirect(`/admin/pages/${result.data.id}/edit?created=1`);
  }
  return result;
}

export async function duplicatePage(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing id" };

  const source = await prisma.page.findUnique({
    where: { id },
    include: { tags: { select: { id: true } } },
  });
  if (!source) return { ok: false, error: "Page not found" };

  // Generate unique slug: append -copy, then -copy-2, etc.
  const baseSlug = `${source.slug}-copy`.slice(0, 80);
  let slug = baseSlug;
  let counter = 2;
  while (await prisma.page.findUnique({ where: { slug } })) {
    const suffix = `-${counter}`;
    slug = `${baseSlug.slice(0, 80 - suffix.length)}${suffix}`;
    counter += 1;
    if (counter > 50) return { ok: false, error: "Could not generate unique slug" };
  }

  const created = await prisma.page.create({
    data: {
      slug,
      title: `${source.title} (copy)`,
      description: source.description,
      order: source.order,
      contentHtml: source.contentHtml,
      assignmentPrompt: source.assignmentPrompt,
      status: "DRAFT",
      authorId: admin.id,
      categoryId: source.categoryId,
      tags: source.tags.length
        ? { connect: source.tags.map((t) => ({ id: t.id })) }
        : undefined,
    },
    select: { id: true },
  });

  revalidatePath("/admin/pages");
  return { ok: true, data: { id: created.id } };
}
