"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageEditor } from "@/components/page-editor";
import {
  createPage,
  updatePage,
  setPageStatus,
  deletePage,
} from "@/actions/page";

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
};

export function PageForm({
  initial,
  mode,
}: {
  initial: PageFormInitial;
  mode: "create" | "edit";
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
  const [error, setError] = useState<string | null>(null);

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
    if (!window.confirm("Delete this page? This cannot be undone.")) return;
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
    </div>
  );
}
