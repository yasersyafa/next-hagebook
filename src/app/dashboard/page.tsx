import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listPublishedPages } from "@/lib/pages";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { SubmissionStatus } from "@/generated/prisma/enums";

const variant: Record<SubmissionStatus, "secondary" | "default" | "destructive"> = {
  PENDING: "secondary",
  PASS: "default",
  FAIL: "destructive",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [pages, submissions] = await Promise.all([
    listPublishedPages(),
    prisma.submission.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const bySlug = new Map(submissions.map((s) => [s.pageSlug, s]));
  const assignments = pages.filter((p) => p.assignmentPrompt);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name ?? session.user.email}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>{assignments.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assignments yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((p) => {
                  const sub = bySlug.get(p.slug);
                  return (
                    <TableRow key={p.slug}>
                      <TableCell>
                        <Link href={`/pages/${p.slug}`} className="text-primary hover:underline">
                          {p.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {sub ? (
                          <Badge variant={variant[sub.status]}>{sub.status}</Badge>
                        ) : (
                          <Badge variant="outline">NOT SUBMITTED</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sub ? sub.updatedAt.toLocaleString() : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
