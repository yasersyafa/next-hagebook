import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    db: false,
    smtp: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    auth: Boolean(process.env.AUTH_SECRET),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = true;
  } catch {
    checks.db = false;
  }

  const ok = checks.db && checks.auth;
  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      time: new Date().toISOString(),
      checks,
    },
    { status: ok ? 200 : 503 },
  );
}
