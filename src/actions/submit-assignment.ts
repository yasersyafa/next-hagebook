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

  const last = await prisma.submission.findFirst({
    where: { userId: session.user.id, pageSlug },
    orderBy: { attemptNumber: "desc" },
    select: { attemptNumber: true, url: true, status: true },
  });

  // Allow re-submit with same URL only if previous attempt failed (re-grading request).
  if (last && last.url === url && last.status === "PENDING") {
    return { ok: false, error: "This URL is already pending review" };
  }

  const nextAttempt = (last?.attemptNumber ?? 0) + 1;

  await prisma.submission.create({
    data: {
      userId: session.user.id,
      pageSlug,
      url,
      status: "PENDING",
      feedback: null,
      attemptNumber: nextAttempt,
    },
  });

  revalidatePath(`/pages/${pageSlug}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/submissions");
  return { ok: true };
}
