import "server-only";
import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return null;
  return session.user;
}

export async function requireApprovedStudent() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role === "ADMIN") return null;
  if (session.user.status !== "APPROVED") return null;
  return session.user;
}
