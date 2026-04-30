"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { approveUserSchema } from "@/lib/validators";
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

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      status: action === "APPROVE" ? "APPROVED" : "REJECTED",
      approvedAt: action === "APPROVE" ? new Date() : null,
      approvedById: session.user.id,
    },
    select: { email: true, name: true, status: true },
  });

  // Await so serverless function doesn't terminate before SMTP completes.
  // Errors are logged inside send() and won't throw.
  if (action === "APPROVE") {
    await sendApprovalEmail({ to: user.email, name: user.name });
  } else {
    await sendRejectionEmail({ to: user.email, name: user.name });
  }

  revalidatePath("/admin/users");
  return { ok: true };
}
