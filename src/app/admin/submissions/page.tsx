import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GradeForm } from "@/components/grade-form";
import type { SubmissionStatus } from "@/generated/prisma/enums";

const variant: Record<SubmissionStatus, "secondary" | "default" | "destructive"> = {
  PENDING: "secondary",
  PASS: "default",
  FAIL: "destructive",
};

export default async function AdminSubmissionsPage() {
  const submissions = await prisma.submission.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground">{submissions.length} total</p>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No submissions yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <Card key={s.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-base">
                      <Link
                        href={`/pages/${s.pageSlug}`}
                        className="text-primary hover:underline"
                      >
                        {s.pageSlug}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      {s.user.name ?? s.user.email} • {s.updatedAt.toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge variant={variant[s.status]}>{s.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline-offset-4 hover:underline break-all"
                >
                  {s.url}
                </a>
                <GradeForm
                  id={s.id}
                  currentStatus={s.status}
                  currentFeedback={s.feedback ?? ""}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
