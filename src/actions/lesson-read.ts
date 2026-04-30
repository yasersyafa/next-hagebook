"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ActionResult } from "@/actions/auth";

export async function toggleLessonRead(formData: FormData): Promise<ActionResult<{ read: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };
  if (session.user.status !== "APPROVED") {
    return { ok: false, error: "Account not approved" };
  }

  const pageSlug = String(formData.get("pageSlug") ?? "").trim();
  if (!pageSlug) return { ok: false, error: "Missing slug" };

  const existing = await prisma.lessonRead.findUnique({
    where: { userId_pageSlug: { userId: session.user.id, pageSlug } },
  });

  if (existing) {
    await prisma.lessonRead.delete({ where: { id: existing.id } });
    revalidatePath(`/pages/${pageSlug}`);
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { ok: true, data: { read: false } };
  }

  await prisma.lessonRead.create({
    data: { userId: session.user.id, pageSlug },
  });
  revalidatePath(`/pages/${pageSlug}`);
  revalidatePath("/dashboard");
  revalidatePath("/");
  return { ok: true, data: { read: true } };
}
