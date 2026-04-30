import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GradeForm } from "@/components/grade-form";
import { EmptyState } from "@/components/empty-state";
import type { SubmissionStatus } from "@/generated/prisma/enums";

const variant: Record<SubmissionStatus, "secondary" | "default" | "destructive"> = {
  PENDING: "secondary",
  PASS: "default",
  FAIL: "destructive",
};

export default async function AdminSubmissionsPage() {
  const submissions = await prisma.submission.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  // Mark latest per (userId, pageSlug)
  const latestKey = new Set<string>();
  const seen = new Set<string>();
  // submissions ordered by updatedAt desc — first occurrence per (user, slug) is latest
  for (const s of submissions) {
    const key = `${s.userId}::${s.pageSlug}`;
    if (!seen.has(key)) {
      seen.add(key);
      latestKey.add(s.id);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground">
          {submissions.length} total · {latestKey.size} latest
        </p>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No submissions yet"
          description="When students submit assignment links, they'll appear here for grading."
        />
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => {
            const isLatest = latestKey.has(s.id);
            return (
              <Card key={s.id} className={isLatest ? "" : "opacity-70"}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/pages/${s.pageSlug}`}
                          className="text-primary hover:underline"
                        >
                          {s.pageSlug}
                        </Link>
                        <span className="text-xs font-mono text-muted-foreground">
                          #{s.attemptNumber}
                        </span>
                        {isLatest ? (
                          <Badge variant="outline" className="text-xs">
                            Latest
                          </Badge>
                        ) : null}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
