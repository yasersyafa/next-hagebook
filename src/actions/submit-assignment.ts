"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPublishedPage } from "@/lib/pages";
import { submitAssignmentSchema } from "@/lib/validators";
import type { ActionResult } from "@/actions/auth";

export async function submitAssignment(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };
  if (session.user.role === "ADMIN") {
    return { ok: false, error: "Admins cannot submit assignments" };
  }
  if (session.user.status !== "APPROVED") {
    return { ok: false, error: "Account not approved" };
  }

  const parsed = submitAssignmentSchema.safeParse({
    pageSlug: formData.get("pageSlug"),
    url: formData.get("url"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { pageSlug, url } = parsed.data;
  const page = await getPublishedPage(pageSlug);
  if (!page || !page.assignmentPrompt) {
    return { ok: false, error: "No assignment for this page" };
  }

  await prisma.submission.upsert({
    where: { userId_pageSlug: { userId: session.user.id, pageSlug } },
    create: {
      userId: session.user.id,
      pageSlug,
      url,
      status: "PENDING",
      feedback: null,
    },
    update: {
      url,
      status: "PENDING",
      feedback: null,
    },
  });

  revalidatePath(`/pages/${pageSlug}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
