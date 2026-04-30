"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { signIn } from "@/lib/auth";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validators";
import { hashToken, randomToken, tokenExpiry } from "@/lib/tokens";
import { sendResetEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/actions/auth";

export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
  const rl = await checkRateLimit({
    name: "forgot",
    identifier: ip,
    limit: 3,
    window: "1h",
  });
  // Silently succeed even if rate-limited (no enumeration).
  if (!rl.ok) return { ok: true };

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  // Always return ok to avoid email enumeration
  if (!parsed.success) return { ok: true };

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: true };

  // Invalidate prior unused tokens
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  const raw = randomToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(raw),
      expiresAt: tokenExpiry(1),
    },
  });

  await sendResetEmail({ to: user.email, name: user.name, token: raw });
  return { ok: true };
}

export async function confirmPasswordReset(formData: FormData): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!record) return { ok: false, error: "Invalid or expired link" };
  if (record.usedAt) return { ok: false, error: "Link already used" };
  if (record.expiresAt < new Date()) {
    return { ok: false, error: "Link expired. Request a new one." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash, passwordChangedAt: new Date() },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId, usedAt: null },
    }),
  ]);

  // Auto sign-in after successful reset (email already known to be valid via possession of token)
  try {
    await signIn("credentials", {
      email: record.user.email,
      password,
      redirect: false,
    });
  } catch {
    // If auto sign-in fails (e.g., unverified email), just send them to login
    return { ok: true, data: { signedIn: false } };
  }

  return { ok: true, data: { signedIn: true } };
}
