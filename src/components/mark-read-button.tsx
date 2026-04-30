"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleLessonRead } from "@/actions/lesson-read";

export function MarkReadButton({
  pageSlug,
  initialRead,
}: {
  pageSlug: string;
  initialRead: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [read, setRead] = useState(initialRead);

  function onClick() {
    const fd = new FormData();
    fd.set("pageSlug", pageSlug);
    startTransition(async () => {
      const result = await toggleLessonRead(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const next = (result.data as { read?: boolean } | undefined)?.read ?? !read;
      setRead(next);
      toast.success(next ? "Marked as read" : "Marked as unread");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={read ? "secondary" : "outline"}
      onClick={onClick}
      disabled={pending}
    >
      {read ? <Check className="mr-1.5 h-4 w-4" /> : <BookOpen className="mr-1.5 h-4 w-4" />}
      {read ? "Read" : "Mark as read"}
    </Button>
  );
}
