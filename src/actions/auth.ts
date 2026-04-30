"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validators";
import { randomToken, tokenExpiry } from "@/lib/tokens";
import { sendVerifyEmail } from "@/lib/email";

export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function registerUser(formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "Email already registered" };

  const passwordHash = await bcrypt.hash(password, 10);
  const isBootstrap = email === process.env.BOOTSTRAP_ADMIN_EMAIL;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: isBootstrap ? "ADMIN" : "STUDENT",
      status: isBootstrap ? "APPROVED" : "PENDING",
      approvedAt: isBootstrap ? new Date() : null,
      emailVerifiedAt: isBootstrap ? new Date() : null,
    },
  });

  if (!isBootstrap) {
    const token = randomToken();
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: tokenExpiry(24),
      },
    });
    void sendVerifyEmail({ to: user.email, name: user.name, token });
  }

  return { ok: true };
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid email or password" };

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      const code = (err as AuthError & { code?: string }).code;
      if (code === "email_unverified") {
        return {
          ok: false,
          error:
            "Email not verified. Check your inbox for the verification link, or request a new one.",
        };
      }
      return { ok: false, error: "Invalid email or password" };
    }
    throw err;
  }
  return { ok: true };
}

export async function resendVerification(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { ok: false, error: "Email required" };

  const user = await prisma.user.findUnique({ where: { email } });
  // Generic response — don't leak whether email exists
  if (!user || user.emailVerifiedAt) return { ok: true };

  const token = randomToken();
  await prisma.emailVerificationToken.upsert({
    where: { userId: user.id },
    create: { userId: user.id, token, expiresAt: tokenExpiry(24) },
    update: { token, expiresAt: tokenExpiry(24) },
  });
  void sendVerifyEmail({ to: user.email, name: user.name, token });
  return { ok: true };
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}
