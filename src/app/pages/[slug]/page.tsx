import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  listPublishedPages,
  getPublishedPage,
  listRelatedPages,
} from "@/lib/pages";
import { sanitizeHtml } from "@/lib/sanitize";
import { postProcessHtml } from "@/lib/post-process-html";
import { buildTeaserHtml } from "@/lib/teaser";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { SubmitLinkForm } from "@/components/submit-link-form";
import { SubmissionStatusCard } from "@/components/submission-status-card";
import { MarkReadButton } from "@/components/mark-read-button";
import { ReadingProgress } from "@/components/reading-progress";
import { LessonToc } from "@/components/lesson-toc";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { estimateReadingTime } from "@/lib/reading-time";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://next-hagebook.vercel.app";

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
  const canonical = `${SITE_URL}/pages/${page.slug}`;
  return {
    title: page.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: page.title,
      description,
      type: "article",
      publishedTime: page.publishedAt?.toISOString(),
      modifiedTime: page.updatedAt.toISOString(),
      url: canonical,
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
  const isAuthed = Boolean(session?.user);
  const isApproved =
    session?.user?.status === "APPROVED" && session?.user?.role !== "ADMIN";
  const isAdmin = session?.user?.role === "ADMIN";
  const canSeeFull = isApproved || isAdmin;

  const [allPages, related, attempts, lessonRead] = await Promise.all([
    listPublishedPages(),
    listRelatedPages(
      page.slug,
      page.tags.map((t) => t.slug),
      page.category?.slug ?? null,
      3,
    ),
    userId && isApproved
      ? prisma.submission.findMany({
          where: { userId, pageSlug: page.slug },
          orderBy: { attemptNumber: "desc" },
        })
      : Promise.resolve([]),
    userId && isApproved
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

  const safeHtml = postProcessHtml(sanitizeHtml(page.contentHtml));
  const teaserHtml = postProcessHtml(buildTeaserHtml(safeHtml));
  const { minutes } = estimateReadingTime(page.contentHtml);

  const articleLd = articleJsonLd({
    slug: page.slug,
    title: page.title,
    description: page.description,
    publishedAt: page.publishedAt,
    updatedAt: page.updatedAt,
  });
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: page.category?.name ?? "Lessons", href: "/" },
    { name: page.title, href: `/pages/${page.slug}` },
  ]);

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="container mx-auto max-w-6xl px-4 py-10 grid gap-10 lg:grid-cols-[1fr_240px]">
        <div className="space-y-8 min-w-0">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              ...(page.category
                ? [{ name: page.category.name }]
                : [{ name: "Lessons" }]),
              { name: page.title },
            ]}
          />

          <header className="space-y-3">
            {page.category ? (
              <Badge variant="outline" className="text-xs">
                {page.category.name}
              </Badge>
            ) : null}
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {page.title}
            </h1>
            {page.description ? (
              <p className="text-muted-foreground text-lg">{page.description}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              By <span className="font-medium text-foreground">HAGE Games</span> ·{" "}
              {minutes} min read · Updated{" "}
              <time dateTime={page.updatedAt.toISOString()}>
                {page.updatedAt.toLocaleDateString()}
              </time>
            </p>
            {page.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {page.tags.map((t) => (
                  <Badge key={t.id} variant="secondary" className="text-[10px]">
                    #{t.slug}
                  </Badge>
                ))}
              </div>
            ) : null}
          </header>

          <article
            className="prose prose-neutral dark:prose-invert max-w-none"
            id="lesson-body"
          >
            {canSeeFull ? (
              <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
            ) : (
              <>
                <div dangerouslySetInnerHTML={{ __html: teaserHtml }} />
                <div className="not-prose mt-6 rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-b from-primary/5 to-transparent p-6 text-center">
                  <p className="text-base font-medium">Read the full lesson</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isAuthed
                      ? "Approval pending. Once an admin approves, the full content unlocks."
                      : "Free account, admin-approved access. Takes 1 minute."}
                  </p>
                  <div className="mt-4 flex gap-2 justify-center flex-wrap">
                    {!isAuthed ? (
                      <>
                        <Link href="/register" className={buttonVariants()}>
                          Create account
                        </Link>
                        <Link
                          href="/login"
                          className={buttonVariants({ variant: "outline" })}
                        >
                          Sign in
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/pending"
                        className={buttonVariants({ variant: "outline" })}
                      >
                        Check status
                      </Link>
                    )}
                  </div>
                </div>
              </>
            )}
          </article>

          {isApproved ? (
            <div className="flex justify-end">
              <MarkReadButton
                pageSlug={page.slug}
                initialRead={Boolean(lessonRead)}
              />
            </div>
          ) : null}

          {page.assignmentPrompt && isApproved ? (
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
                <CardDescription>{page.assignmentPrompt}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {latest ? (
                  <SubmissionStatusCard submission={latest} previous={previous} />
                ) : null}
                <SubmitLinkForm
                  pageSlug={page.slug}
                  initialUrl={latest?.url ?? ""}
                />
              </CardContent>
            </Card>
          ) : null}

          {related.length > 0 ? (
            <section className="pt-6 border-t space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">
                Related lessons
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/pages/${r.slug}`}
                      className="block rounded-lg border bg-background p-4 hover:border-primary/50 transition-colors"
                    >
                      <p className="font-medium">{r.title}</p>
                      {r.description ? (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {r.description}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="pt-6 border-t space-y-3">
            {idx >= 0 ? (
              <p className="text-xs text-muted-foreground text-center">
                Lesson {idx + 1} of {allPages.length}
              </p>
            ) : null}
            <div className="flex items-center justify-between gap-2">
              {prev ? (
                <Link
                  href={`/pages/${prev.slug}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  ← {prev.title}
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/pages/${next.slug}`}
                  className={buttonVariants()}
                >
                  {next.title} →
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <LessonToc html={safeHtml} />
          </div>
        </aside>
      </div>
    </>
  );
}
