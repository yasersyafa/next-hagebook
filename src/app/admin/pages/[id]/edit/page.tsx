import { notFound } from "next/navigation";
import { getPageById, listCategories } from "@/lib/pages";
import { PageForm } from "@/components/page-form";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [page, categories] = await Promise.all([getPageById(id), listCategories()]);
  if (!page) notFound();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Edit page</h1>
        <p className="text-muted-foreground">{page.title}</p>
      </div>
      <PageForm
        mode="edit"
        categories={categories}
        initial={{
          id: page.id,
          slug: page.slug,
          title: page.title,
          description: page.description ?? "",
          order: page.order,
          contentHtml: page.contentHtml,
          assignmentPrompt: page.assignmentPrompt ?? "",
          status: page.status,
          publishedAt: page.publishedAt,
          categoryId: page.category?.id ?? null,
          tagSlugs: page.tags.map((t) => t.slug),
        }}
      />
    </div>
  );
}
