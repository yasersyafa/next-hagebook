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
  return {
    slug: fd.get("slug"),
    title: fd.get("title"),
    description: fd.get("description") || null,
    order: fd.get("order") ?? 0,
    contentHtml: fd.get("contentHtml"),
    assignmentPrompt: fd.get("assignmentPrompt") || null,
    status: fd.get("status") || "DRAFT",
  };
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

export async function createPageAndRedirect(formData: FormData) {
  const result = await createPage(formData);
  if (result.ok && result.data) {
    redirect(`/admin/pages/${result.data.id}/edit?created=1`);
  }
  return result;
}
