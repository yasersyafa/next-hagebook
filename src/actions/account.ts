"use server";

import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import type { ActionResult } from "@/actions/auth";

export async function exportMyData(): Promise<ActionResult<{ json: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      submissions: {
        orderBy: [{ pageSlug: "asc" }, { attemptNumber: "asc" }],
      },
      lessonReads: {
        orderBy: { readAt: "asc" },
      },
    },
  });
  if (!user) return { ok: false, error: "User not found" };

  // Strip sensitive fields.
  const payload = {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      approvedAt: user.approvedAt,
      createdAt: user.createdAt,
    },
    submissions: user.submissions.map((s) => ({
      id: s.id,
      pageSlug: s.pageSlug,
      url: s.url,
      status: s.status,
      feedback: s.feedback,
      attemptNumber: s.attemptNumber,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })),
    lessonReads: user.lessonReads.map((l) => ({
      pageSlug: l.pageSlug,
      readAt: l.readAt,
    })),
  };

  await audit({
    actorId: user.id,
    actorEmail: user.email,
    action: "account.export",
    targetType: "user",
    targetId: user.id,
  });

  return { ok: true, data: { json: JSON.stringify(payload, null, 2) } };
}

export async function deleteMyAccount(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };
  if (session.user.role === "ADMIN") {
    return { ok: false, error: "Admins must hand off the role before deleting" };
  }

  const confirmEmail = String(formData.get("confirmEmail") ?? "");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  if (!user) return { ok: false, error: "User not found" };
  if (user.email !== confirmEmail) {
    return { ok: false, error: "Email confirmation does not match" };
  }

  await prisma.user.delete({ where: { id: session.user.id } });

  await audit({
    actorEmail: user.email,
    action: "account.self-delete",
    targetType: "user",
    targetId: session.user.id,
  });

  await signOut({ redirect: false });
  redirect("/login?deleted=1");
}
