import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Audit log · Admin",
  robots: { index: false, follow: false },
};

export default async function AuditLogPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") notFound();

  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-muted-foreground">Last 200 admin actions.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Read-only. Newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {e.createdAt.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {e.actorEmail ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{e.action}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {e.targetType ? `${e.targetType}:${e.targetId?.slice(0, 8) ?? ""}` : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-xs truncate">
                      {e.metadata ? JSON.stringify(e.metadata) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
