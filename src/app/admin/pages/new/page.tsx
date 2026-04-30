import { PageForm } from "@/components/page-form";

export default function NewPagePage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">New page</h1>
        <p className="text-muted-foreground">Write the lesson, then save as draft or publish.</p>
      </div>
      <PageForm
        mode="create"
        initial={{
          slug: "",
          title: "",
          description: "",
          order: 0,
          contentHtml: "",
          assignmentPrompt: "",
          status: "DRAFT",
        }}
      />
    </div>
  );
}
