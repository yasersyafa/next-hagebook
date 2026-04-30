"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function registerUser(formData: FormData): Promise<ActionResult> {
  const ip = await clientIp();
  const rl = await checkRateLimit({
    name: "register",
    identifier: ip,
    limit: 5,
    window: "1h",
  });
  if (!rl.ok) {
    return { ok: false, error: "Too many registrations from this IP. Try again later." };
  }

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

  // Bootstrap admin: only the very first registration matching BOOTSTRAP_ADMIN_EMAIL
  // becomes admin. Once any admin exists, treat as a normal student registration.
  const isBootstrapEmail = email === process.env.BOOTSTRAP_ADMIN_EMAIL;
  let promoteToAdmin = false;
  if (isBootstrapEmail) {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    promoteToAdmin = adminCount === 0;
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: promoteToAdmin ? "ADMIN" : "STUDENT",
      status: promoteToAdmin ? "APPROVED" : "PENDING",
      approvedAt: promoteToAdmin ? new Date() : null,
    },
  });

  return { ok: true };
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid email or password" };

  const ip = await clientIp();
  const rl = await checkRateLimit({
    name: "login",
    identifier: `${ip}:${parsed.data.email}`,
    limit: 5,
    window: "15m",
  });
  if (!rl.ok) {
    return { ok: false, error: "Too many login attempts. Try again in 15 minutes." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: "Invalid email or password" };
    }
    throw err;
  }
  return { ok: true };
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}
