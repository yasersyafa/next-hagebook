"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { approveUserSchema, deleteUserSchema } from "@/lib/validators";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email";
import type { ActionResult } from "@/actions/auth";

export async function decideUser(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Forbidden" };

  const parsed = approveUserSchema.safeParse({
    userId: formData.get("userId"),
    action: formData.get("action"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const { userId, action } = parsed.data;
  if (userId === session.user.id) {
    return { ok: false, error: "Cannot change your own status" };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) return { ok: false, error: "User not found" };
  if (target.role === "ADMIN" && action !== "REACTIVATE") {
    // Allow reactivating an admin (e.g., undo accidental deactivate).
    if (action === "DEACTIVATE") {
      // permitted only for non-self admins; fall through
    } else {
      return { ok: false, error: "Cannot change role-bearing admin via this action" };
    }
  }

  const nextStatus =
    action === "APPROVE"
      ? "APPROVED"
      : action === "REJECT"
        ? "REJECTED"
        : action === "DEACTIVATE"
          ? "DEACTIVATED"
          : "APPROVED"; // REACTIVATE

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      status: nextStatus,
      approvedAt:
        action === "APPROVE" || action === "REACTIVATE" ? new Date() : null,
      approvedById: session.user.id,
    },
    select: { email: true, name: true },
  });

  if (action === "APPROVE") {
    await sendApprovalEmail({ to: user.email, name: user.name });
  } else if (action === "REJECT") {
    await sendRejectionEmail({ to: user.email, name: user.name });
  }
  // DEACTIVATE / REACTIVATE: no email (admin-initiated lifecycle change).

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUser(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Forbidden" };

  const parsed = deleteUserSchema.safeParse({
    userId: formData.get("userId"),
    confirmEmail: formData.get("confirmEmail"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const { userId, confirmEmail } = parsed.data;
  if (userId === session.user.id) {
    return { ok: false, error: "Cannot delete your own account" };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true, _count: { select: { pages: true } } },
  });
  if (!target) return { ok: false, error: "User not found" };
  if (target.role === "ADMIN") {
    return { ok: false, error: "Cannot delete an admin" };
  }
  if (target.email !== confirmEmail) {
    return { ok: false, error: "Email confirmation does not match" };
  }
  if (target._count.pages > 0) {
    return {
      ok: false,
      error:
        "User authored pages — reassign or delete those pages first to avoid losing content.",
    };
  }

  // Submissions + PasswordResetTokens cascade-delete via schema.
  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/users");
  revalidatePath("/admin/submissions");
  return { ok: true };
}
