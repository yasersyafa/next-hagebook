import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listPublishedPages, getPublishedPage } from "@/lib/pages";
import { sanitizeHtml } from "@/lib/sanitize";
import { SubmitLinkForm } from "@/components/submit-link-form";
import { SubmissionStatusCard } from "@/components/submission-status-card";
import { MarkReadButton } from "@/components/mark-read-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) return { title: "Lesson not found" };
  const description = page.description ?? `Read "${page.title}" on hagebook.`;
  return {
    title: page.title,
    description,
    openGraph: {
      title: page.title,
      description,
      type: "article",
      publishedTime: page.publishedAt?.toISOString(),
      modifiedTime: page.updatedAt.toISOString(),
    },
    twitter: {
      title: page.title,
      description,
    },
  };
}

export default async function PagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) notFound();

  const session = await auth();
  const userId = session?.user?.id;

  const [allPages, attempts, lessonRead] = await Promise.all([
    listPublishedPages(),
    userId
      ? prisma.submission.findMany({
          where: { userId, pageSlug: page.slug },
          orderBy: { attemptNumber: "desc" },
        })
      : Promise.resolve([]),
    userId
      ? prisma.lessonRead.findUnique({
          where: { userId_pageSlug: { userId, pageSlug: page.slug } },
        })
      : Promise.resolve(null),
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

      {userId ? (
        <div className="flex justify-end">
          <MarkReadButton pageSlug={page.slug} initialRead={Boolean(lessonRead)} />
        </div>
      ) : null}

      {page.assignmentPrompt ? (
        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
            <CardDescription>{page.assignmentPrompt}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {latest ? <SubmissionStatusCard submission={latest} previous={previous} /> : null}
            <SubmitLinkForm pageSlug={page.slug} initialUrl={latest?.url ?? ""} />
          </CardContent>
        </Card>
      ) : null}

      <div className="pt-6 border-t space-y-3">
        {idx >= 0 ? (
          <p className="text-xs text-muted-foreground text-center">
            Lesson {idx + 1} of {allPages.length}
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-2">
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
    </div>
  );
}
