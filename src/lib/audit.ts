import "server-only";
import { prisma } from "@/lib/db";

type AuditPayload = {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function audit(p: AuditPayload): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: p.actorId ?? null,
        actorEmail: p.actorEmail ?? null,
        action: p.action,
        targetType: p.targetType ?? null,
        targetId: p.targetId ?? null,
        metadata: p.metadata ? JSON.parse(JSON.stringify(p.metadata)) : null,
      },
    });
  } catch (err) {
    console.error("[audit] write failed:", err);
  }
}
