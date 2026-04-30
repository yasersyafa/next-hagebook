"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";

const PageEditor = dynamic(
  () => import("@/components/page-editor").then((m) => m.PageEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[420px] w-full rounded-lg" />,
  },
);
import {
  createPage,
  updatePage,
  setPageStatus,
  deletePage,
  createCategory,
} from "@/actions/page";

export type CategoryOption = { id: string; slug: string; name: string };

export type PageFormInitial = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  contentHtml: string;
  assignmentPrompt: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: Date | null;
  categoryId: string | null;
  tagSlugs: string[];
};

export function PageForm({
  initial,
  mode,
  categories: initialCategories,
}: {
  initial: PageFormInitial;
  mode: "create" | "edit";
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [statusPending, startStatusTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();

  const [slug, setSlug] = useState(initial.slug);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [order, setOrder] = useState<number>(initial.order);
  const [contentHtml, setContentHtml] = useState(initial.contentHtml);
  const [assignmentPrompt, setAssignmentPrompt] = useState(initial.assignmentPrompt);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initial.status);
  const [categoryId, setCategoryId] = useState<string>(initial.categoryId ?? "");
  const [categories, setCategories] = useState<CategoryOption[]>(initialCategories);
  const [tags, setTags] = useState<string[]>(initial.tagSlugs);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function addTag(raw: string) {
    const slug = raw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!slug) return;
    if (tags.includes(slug)) return;
    if (tags.length >= 10) {
      toast.error("Max 10 tags");
      return;
    }
    setTags([...tags, slug]);
  }

  function removeTag(slug: string) {
    setTags(tags.filter((t) => t !== slug));
  }

  function handleTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
        setTagInput("");
      }
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  async function onAddCategory() {
    const name = window.prompt("New category name (e.g., Web Dev):");
    if (!name) return;
    const fd = new FormData();
    fd.set("name", name);
    const result = await createCategory(fd);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    if (result.data) {
      setCategories((prev) => {
        if (prev.some((c) => c.id === result.data!.id)) return prev;
        return [...prev, result.data!].sort((a, b) => a.name.localeCompare(b.name));
      });
      setCategoryId(result.data.id);
      toast.success("Category added");
    }
  }

  const isPublished = mode === "edit" && initial.status === "PUBLISHED";
  const slugLocked = mode === "edit" && Boolean(initial.publishedAt);

  function buildFormData(submitStatus: "DRAFT" | "PUBLISHED") {
    const fd = new FormData();
    if (initial.id) fd.set("id", initial.id);
    fd.set("slug", slug);
    fd.set("title", title);
    fd.set("description", description);
    fd.set("order", String(order));
    fd.set("contentHtml", contentHtml);
    fd.set("assignmentPrompt", assignmentPrompt);
    fd.set("status", submitStatus);
    fd.set("categoryId", categoryId || "");
    fd.set("tagSlugs", tags.join(","));
    return fd;
  }

  function submit(submitStatus: "DRAFT" | "PUBLISHED") {
    setError(null);
    const fd = buildFormData(submitStatus);
    startTransition(async () => {
      const result =
        mode === "create" ? await createPage(fd) : await updatePage(fd);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      setStatus(submitStatus);
      toast.success(
        mode === "create"
          ? submitStatus === "PUBLISHED"
            ? "Page published"
            : "Draft saved"
          : "Page updated",
      );
      const newId = (result.data as { id?: string } | undefined)?.id;
      if (mode === "create" && newId) {
        router.replace(`/admin/pages/${newId}/edit`);
      } else {
        router.refresh();
      }
    });
  }

  // Cmd/Ctrl+S → save current state (preserves status, never auto-publishes)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        submit(status);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, title, description, order, contentHtml, assignmentPrompt, status, categoryId, tags]);

  function toggleStatus() {
    if (!initial.id) return;
    const next = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const fd = new FormData();
    fd.set("id", initial.id);
    fd.set("status", next);
    startStatusTransition(async () => {
      const result = await setPageStatus(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setStatus(next);
      toast.success(next === "PUBLISHED" ? "Published" : "Unpublished");
      router.refresh();
    });
  }

  function onDelete() {
    if (!initial.id) return;
    setDeleteOpen(true);
  }

  function runDelete() {
    if (!initial.id) return;
    const fd = new FormData();
    fd.set("id", initial.id);
    startDeleteTransition(async () => {
      const result = await deletePage(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Page deleted");
      router.replace("/admin/pages");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            ← All pages
          </Link>
          <Badge variant={status === "PUBLISHED" ? "default" : "secondary"}>
            {status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={toggleStatus}
                disabled={statusPending}
              >
                {status === "PUBLISHED" ? "Unpublish" : "Publish"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={onDelete}
                disabled={deletePending}
              >
                Delete
              </Button>
            </>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => submit("DRAFT")}
            disabled={pending}
          >
            Save draft
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => submit("PUBLISHED")}
            disabled={pending}
          >
            {isPublished ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <Label>Content</Label>
          <PageEditor initialHtml={initial.contentHtml} onChange={setContentHtml} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                required
                maxLength={80}
                disabled={slugLocked}
                placeholder="my-lesson"
              />
              {slugLocked ? (
                <p className="text-xs text-muted-foreground">
                  Slug is locked after first publish.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, dashes only.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                min={0}
                max={9999}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="categoryId">Category</Label>
                <button
                  type="button"
                  onClick={onAddCategory}
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
                  + New
                </button>
              </div>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagInput">Tags</Label>
              <div className="flex flex-wrap gap-1.5 rounded-md border bg-background p-2 min-h-9">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      aria-label={`Remove ${t}`}
                      className="ml-0.5 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <input
                  id="tagInput"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                  onBlur={() => {
                    if (tagInput.trim()) {
                      addTag(tagInput);
                      setTagInput("");
                    }
                  }}
                  placeholder={tags.length === 0 ? "Type and press enter..." : ""}
                  className="flex-1 min-w-24 bg-transparent text-sm outline-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter or comma to add. Backspace empties last tag. Max 10.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignmentPrompt">Assignment prompt (optional)</Label>
              <Textarea
                id="assignmentPrompt"
                value={assignmentPrompt}
                onChange={(e) => setAssignmentPrompt(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Leave empty for no assignment."
              />
              <p className="text-xs text-muted-foreground">
                If set, students see a link-submission form on this lesson.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        pending={deletePending}
        onOpenChange={setDeleteOpen}
        title="Delete page?"
        description={
          <>
            <span className="block">
              Permanently removes the page and all submissions referencing it.
              Cannot be undone.
            </span>
            <span className="mt-2 block font-mono text-xs text-muted-foreground">
              {initial.slug}
            </span>
          </>
        }
        confirmLabel="Delete forever"
        destructive
        onConfirm={runDelete}
      />
    </div>
  );
}
