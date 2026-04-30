import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listPublishedPages, getPublishedPage } from "@/lib/pages";
import { sanitizeHtml } from "@/lib/sanitize";
import { SubmitLinkForm } from "@/components/submit-link-form";
import { SubmissionStatusCard } from "@/components/submission-status-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function PagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) notFound();

  const session = await auth();
  const userId = session?.user?.id;

  const [allPages, attempts] = await Promise.all([
    listPublishedPages(),
    userId
      ? prisma.submission.findMany({
          where: { userId, pageSlug: page.slug },
          orderBy: { attemptNumber: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const latest = attempts[0] ?? null;
  const previous = attempts.slice(1);

  const idx = allPages.findIndex((p) => p.slug === page.slug);
  const prev = idx > 0 ? allPages[idx - 1] : null;
  const next = idx >= 0 && idx < allPages.length - 1 ? allPages[idx + 1] : null;

  const safeHtml = sanitizeHtml(page.contentHtml);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
          ← All lessons
        </Link>
      </div>

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>
        {page.description ? (
          <p className="text-muted-foreground">{page.description}</p>
        ) : null}
        <div
          className="mt-6"
          // contentHtml sanitized at save time + here (defense in depth)
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </article>

      {page.assignmentPrompt ? (
        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
            <CardDescription>{page.assignmentPrompt}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {latest ? <SubmissionStatusCard submission={latest} previous={previous} /> : null}
            <SubmitLinkForm pageSlug={page.slug} initialUrl="" />
          </CardContent>
        </Card>
      ) : null}

      <div className="flex items-center justify-between pt-6 border-t">
        {prev ? (
          <Link href={`/pages/${prev.slug}`} className={buttonVariants({ variant: "outline" })}>
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/pages/${next.slug}`} className={buttonVariants()}>
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
