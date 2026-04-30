"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { gradeSubmissionSchema } from "@/lib/validators";
import { sendGradeEmail } from "@/lib/email";
import type { ActionResult } from "@/actions/auth";

export async function gradeSubmission(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Forbidden" };

  const parsed = gradeSubmissionSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    feedback: formData.get("feedback") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { id, status, feedback } = parsed.data;
  const updated = await prisma.submission.update({
    where: { id },
    data: { status, feedback: feedback ?? null },
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  const page = await prisma.page.findUnique({
    where: { slug: updated.pageSlug },
    select: { title: true },
  });

  void sendGradeEmail({
    to: updated.user.email,
    name: updated.user.name,
    pageTitle: page?.title ?? updated.pageSlug,
    pageSlug: updated.pageSlug,
    status,
    feedback: updated.feedback,
  });

  revalidatePath("/admin/submissions");
  revalidatePath("/dashboard");
  revalidatePath(`/pages/${updated.pageSlug}`);
  return { ok: true };
}
