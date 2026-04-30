"use client";

import { useState } from "react";
import Link from "next/link";
import type { PageMeta } from "@/lib/pages";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type View = "carousel" | "grid" | "table";

const tabs: { id: View; label: string; icon: string }[] = [
  { id: "carousel", label: "Cards", icon: "▤" },
  { id: "grid", label: "Grid", icon: "▦" },
  { id: "table", label: "Table", icon: "≡" },
];

export function LessonsHub({
  pages,
  userName,
}: {
  pages: PageMeta[];
  userName: string;
}) {
  const [view, setView] = useState<View>("carousel");

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 space-y-10">
      <section className="rounded-2xl border bg-gradient-to-br from-primary/15 via-background to-background p-8 sm:p-12">
        <p className="text-sm uppercase tracking-wider text-primary font-medium">
          Welcome back
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight">
          {userName}, ready to ship?
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          {pages.length} lesson{pages.length === 1 ? "" : "s"} ready.
          Pick one, build the thing, submit a link.
        </p>
        <div className="mt-6 flex gap-3 flex-wrap">
          <Link href="/dashboard" className={buttonVariants()}>
            Your dashboard
          </Link>
          {pages[0] ? (
            <Link
              href={`/pages/${pages[0].slug}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Start with {pages[0].title} →
            </Link>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-2xl font-semibold tracking-tight">Lessons</h2>
          <div className="inline-flex items-center rounded-lg border bg-muted/50 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setView(t.id)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  view === t.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={view === t.id}
              >
                <span className="mr-1.5">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {pages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No lessons yet. Drop an MDX file in <code className="font-mono">/content</code>.
          </p>
        ) : view === "carousel" ? (
          <CarouselView pages={pages} />
        ) : view === "grid" ? (
          <GridView pages={pages} />
        ) : (
          <TableView pages={pages} />
        )}
      </section>
    </div>
  );
}

function LessonCard({ page }: { page: PageMeta }) {
  return (
    <Card className="h-full hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            {String(page.order).padStart(2, "0")}
          </span>
          {page.assignmentPrompt ? <Badge variant="secondary">Assignment</Badge> : null}
        </div>
        <CardTitle className="text-lg">{page.title}</CardTitle>
        {page.description ? <CardDescription>{page.description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <Link
          href={`/pages/${page.slug}`}
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          Open lesson
        </Link>
      </CardContent>
    </Card>
  );
}

function CarouselView({ pages }: { pages: PageMeta[] }) {
  return (
    <div className="-mx-4 px-4 overflow-x-auto">
      <div
        className="flex gap-4 pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "thin" }}
      >
        {pages.map((p) => (
          <div key={p.slug} className="snap-start shrink-0 w-72 sm:w-80">
            <LessonCard page={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

function GridView({ pages }: { pages: PageMeta[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pages.map((p) => (
        <LessonCard key={p.slug} page={p} />
      ))}
    </div>
  );
}

function TableView({ pages }: { pages: PageMeta[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-32">Assignment</TableHead>
            <TableHead className="w-24 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((p) => (
            <TableRow key={p.slug}>
              <TableCell className="font-mono text-muted-foreground">
                {String(p.order).padStart(2, "0")}
              </TableCell>
              <TableCell className="font-medium">{p.title}</TableCell>
              <TableCell className="text-muted-foreground">{p.description ?? "—"}</TableCell>
              <TableCell>
                {p.assignmentPrompt ? <Badge variant="secondary">Yes</Badge> : <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/pages/${p.slug}`}
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  Open
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
