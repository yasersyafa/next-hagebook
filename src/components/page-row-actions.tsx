"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setPageStatus, deletePage, duplicatePage } from "@/actions/page";

export function PageRowActions({
  id,
  slug,
  status,
}: {
  id: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggleStatus() {
    const next = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", next);
    startTransition(async () => {
      const result = await setPageStatus(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(next === "PUBLISHED" ? "Published" : "Unpublished");
      router.refresh();
    });
  }

  function onDelete() {
    if (!window.confirm(`Delete page "${slug}"? This cannot be undone.`)) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      const result = await deletePage(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Deleted");
      router.refresh();
    });
  }

  function onDuplicate() {
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      const result = await duplicatePage(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const newId = (result.data as { id?: string } | undefined)?.id;
      toast.success("Duplicated as draft");
      if (newId) {
        router.push(`/admin/pages/${newId}/edit`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Actions"
            disabled={pending}
          />
        }
      >
        ⋮
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href={`/admin/pages/${id}/edit`} />}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleStatus}>
          {status === "PUBLISHED" ? "Unpublish" : "Publish"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
