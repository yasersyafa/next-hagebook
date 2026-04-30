import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { listCategories } from "@/lib/pages";
import { PageForm } from "@/components/page-form";

export const metadata: Metadata = {
  title: "New page · Admin",
  robots: { index: false, follow: false },
};

export default async function NewPagePage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") notFound();

  const categories = await listCategories();
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">New page</h1>
        <p className="text-muted-foreground">Write the lesson, then save as draft or publish.</p>
      </div>
      <PageForm
        mode="create"
        categories={categories}
        initial={{
          slug: "",
          title: "",
          description: "",
          order: 0,
          contentHtml: "",
          assignmentPrompt: "",
          status: "DRAFT",
          categoryId: null,
          tagSlugs: [],
        }}
      />
    </div>
  );
}
