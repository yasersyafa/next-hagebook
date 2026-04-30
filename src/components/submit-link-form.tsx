"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitAssignment } from "@/actions/submit-assignment";

export function SubmitLinkForm({
  pageSlug,
  initialUrl = "",
}: {
  pageSlug: string;
  initialUrl?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await submitAssignment(fd);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Submitted");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input type="hidden" name="pageSlug" value={pageSlug} />
      <div className="space-y-2">
        <Label htmlFor="url">Submission URL</Label>
        <Input
          id="url"
          name="url"
          type="url"
          placeholder="https://github.com/you/repo"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : initialUrl ? "Update submission" : "Submit"}
      </Button>
    </form>
  );
}
