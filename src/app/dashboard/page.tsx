import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { BookOpen, CheckCircle2, Clock, Sparkles, ArrowRight, FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listPublishedPages } from "@/lib/pages";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import type { SubmissionStatus } from "@/generated/prisma/enums";

const submissionVariant: Record<SubmissionStatus, "secondary" | "default" | "destructive"> = {
  PENDING: "secondary",
  PASS: "default",
  FAIL: "destructive",
};

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

function greet(name: string | null | undefined): string {
  const h = new Date().getHours();
  const who = name?.split(" ")[0] ?? "there";
  if (h < 5) return `Late night grind, ${who}?`;
  if (h < 12) return `Good morning, ${who}.`;
  if (h < 18) return `Good afternoon, ${who}.`;
  if (h < 22) return `Good evening, ${who}.`;
  return `Burning the midnight oil, ${who}?`;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [pages, submissions, lessonReads] = await Promise.all([
    listPublishedPages(),
    prisma.submission.findMany({
      where: { userId: session.user.id },
      orderBy: [{ pageSlug: "asc" }, { attemptNumber: "desc" }],
    }),
    prisma.lessonRead.findMany({
      where: { userId: session.user.id },
      orderBy: { readAt: "desc" },
    }),
  ]);

  // Group submissions by slug — latest per slug.
  const grouped = new Map<
    string,
    { latest: (typeof submissions)[number]; attempts: number }
  >();
  for (const s of submissions) {
    const existing = grouped.get(s.pageSlug);
    if (!existing) {
      grouped.set(s.pageSlug, { latest: s, attempts: 1 });
    } else {
      existing.attempts += 1;
    }
  }

  const assignments = pages.filter((p) => p.assignmentPrompt);
  const passedCount = Array.from(grouped.values()).filter(
    (g) => g.latest.status === "PASS",
  ).length;
  const pendingCount = Array.from(grouped.values()).filter(
    (g) => g.latest.status === "PENDING",
  ).length;
  const failedCount = Array.from(grouped.values()).filter(
    (g) => g.latest.status === "FAIL",
  ).length;

  // Streak: consecutive days with at least one read.
  const readDays = new Set(
    lessonReads.map((r) => new Date(r.readAt).toISOString().slice(0, 10)),
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (readDays.has(key)) streak += 1;
    else if (i === 0) continue; // grace today
    else break;
  }

  // Activity feed: last 8 events (read + submission).
  type Activity =
    | { kind: "read"; at: Date; pageSlug: string; pageTitle: string }
    | {
        kind: "submission";
        at: Date;
        pageSlug: string;
        pageTitle: string;
        status: SubmissionStatus;
      };
  const slugTitle = new Map(pages.map((p) => [p.slug, p.title]));
  const events: Activity[] = [
    ...lessonReads.map(
      (r): Activity => ({
        kind: "read",
        at: r.readAt,
        pageSlug: r.pageSlug,
        pageTitle: slugTitle.get(r.pageSlug) ?? r.pageSlug,
      }),
    ),
    ...submissions.map(
      (s): Activity => ({
        kind: "submission",
        at: s.updatedAt,
        pageSlug: s.pageSlug,
        pageTitle: slugTitle.get(s.pageSlug) ?? s.pageSlug,
        status: s.status,
      }),
    ),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  // Continue: first published page user hasn't read, else first published page.
  const readSlugs = new Set(lessonReads.map((r) => r.pageSlug));
  const nextLesson = pages.find((p) => !readSlugs.has(p.slug)) ?? pages[0];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 space-y-8">
      {/* Hero */}
      <section className="rounded-2xl border bg-gradient-to-br from-primary/15 via-background to-background p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" aria-hidden />
        <div className="relative">
          <p className="text-sm uppercase tracking-wider text-primary font-medium">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
            {greet(session.user.name)}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {streak > 0
              ? `You're on a ${streak}-day reading streak. Keep it going.`
              : "Pick up where you left off."}
          </p>
          {nextLesson ? (
            <Link
              href={`/pages/${nextLesson.slug}`}
              className={buttonVariants({ size: "default" }) + " mt-5 group"}
            >
              {readSlugs.has(nextLesson.slug) ? "Re-open" : "Continue"}: {nextLesson.title}
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : null}
        </div>
      </section>

      {/* Stats strip */}
      <section className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <StatCard
          icon={<BookOpen className="size-5 text-primary" />}
          label="Lessons read"
          value={lessonReads.length}
          sub={`of ${pages.length}`}
        />
        <StatCard
          icon={<CheckCircle2 className="size-5 text-emerald-500" />}
          label="Passed"
          value={passedCount}
          sub={`of ${assignments.length} assignments`}
        />
        <StatCard
          icon={<Clock className="size-5 text-amber-500" />}
          label="Pending review"
          value={pendingCount}
          sub={pendingCount === 1 ? "submission" : "submissions"}
        />
        <StatCard
          icon={<Sparkles className="size-5 text-primary" />}
          label="Streak"
          value={streak}
          sub={streak === 1 ? "day" : "days"}
        />
      </section>

      {/* Two-column on lg */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Assignments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>
                  {assignments.length} total · {passedCount} passed · {failedCount} need rework
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <EmptyState
                icon="page"
                title="No assignments yet"
                description="When admin publishes lessons with assignment prompts, they'll show up here."
              />
            ) : (
              <ul className="space-y-2">
                {assignments.map((p) => {
                  const entry = grouped.get(p.slug);
                  const status = entry?.latest.status;
                  return (
                    <li key={p.slug}>
                      <Link
                        href={`/pages/${p.slug}`}
                        className="flex items-center gap-3 rounded-lg border bg-background p-3 hover:border-primary/50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate">{p.title}</span>
                            {entry ? (
                              <Badge variant={submissionVariant[status!]} className="text-xs">
                                {status}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                NOT SUBMITTED
                              </Badge>
                            )}
                          </div>
                          {entry ? (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Attempt #{entry.latest.attemptNumber} ·{" "}
                              {entry.latest.updatedAt.toLocaleDateString()}
                            </p>
                          ) : p.description ? (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {p.description}
                            </p>
                          ) : null}
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Last {events.length || 0} events</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <EmptyState
                icon="clock"
                title="Quiet for now"
                description="Read a lesson or submit an assignment to start your timeline."
              />
            ) : (
              <ol className="relative space-y-4 border-l border-border pl-5">
                {events.map((e, i) => (
                  <li key={i} className="relative">
                    <div className="absolute -left-[26px] top-1 flex size-4 items-center justify-center rounded-full bg-primary/10 ring-4 ring-background">
                      <div className="size-2 rounded-full bg-primary" />
                    </div>
                    <p className="text-sm">
                      {e.kind === "read" ? (
                        <>
                          Read <Link href={`/pages/${e.pageSlug}`} className="text-primary hover:underline">{e.pageTitle}</Link>
                        </>
                      ) : (
                        <>
                          Submission for{" "}
                          <Link href={`/pages/${e.pageSlug}`} className="text-primary hover:underline">{e.pageTitle}</Link>{" "}
                          marked{" "}
                          <Badge variant={submissionVariant[e.status]} className="text-xs align-middle">
                            {e.status}
                          </Badge>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {e.at.toLocaleString()}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/"
          className="group rounded-xl border bg-background p-4 hover:border-primary/50 transition-colors"
        >
          <FileText className="size-5 text-primary mb-2" />
          <p className="font-medium text-sm">Browse lessons</p>
          <p className="text-xs text-muted-foreground">All published lessons</p>
        </Link>
        <Link
          href="/account"
          className="group rounded-xl border bg-background p-4 hover:border-primary/50 transition-colors"
        >
          <CheckCircle2 className="size-5 text-primary mb-2" />
          <p className="font-medium text-sm">Account settings</p>
          <p className="text-xs text-muted-foreground">Export data, delete account</p>
        </Link>
        <Link
          href="/legal/privacy"
          className="group rounded-xl border bg-background p-4 hover:border-primary/50 transition-colors"
        >
          <BookOpen className="size-5 text-primary mb-2" />
          <p className="font-medium text-sm">Privacy</p>
          <p className="text-xs text-muted-foreground">How your data is handled</p>
        </Link>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </span>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}
