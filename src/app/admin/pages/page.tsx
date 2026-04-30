import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { listAllPages } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Pages · Admin",
  robots: { index: false, follow: false },
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PageRowActions } from "@/components/page-row-actions";

export default async function AdminPagesPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") notFound();

  const pages = await listAllPages();
  const drafts = pages.filter((p) => p.status === "DRAFT");
  const published = pages.filter((p) => p.status === "PUBLISHED");

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Pages</h1>
          <p className="text-muted-foreground">
            {published.length} published · {drafts.length} draft
          </p>
        </div>
        <Link href="/admin/pages/new" className={buttonVariants()}>
          + New page
        </Link>
      </div>

      <Section title="Drafts" description="Visible only to admins" rows={drafts} />
      <Section title="Published" description="Visible to approved students" rows={published} />
    </div>
  );
}

function Section({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: Awaited<ReturnType<typeof listAllPages>>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">None.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-muted-foreground">
                    {String(p.order).padStart(2, "0")}
                  </TableCell>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {p.slug}
                  </TableCell>
                  <TableCell>
                    {p.assignmentPrompt ? (
                      <Badge variant="secondary">Yes</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {p.updatedAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <PageRowActions
                      id={p.id}
                      slug={p.slug}
                      status={p.status}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
