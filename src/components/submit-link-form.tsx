"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitAssignment } from "@/actions/submit-assignment";

const draftKey = (slug: string) => `hagebook-submit-draft-${slug}`;

function readDraft(slug: string, initialUrl: string): string {
  if (typeof window === "undefined") return initialUrl;
  const saved = localStorage.getItem(draftKey(slug));
  if (saved && saved.trim().length > 0 && saved !== initialUrl) return saved;
  return initialUrl;
}

export function SubmitLinkForm({
  pageSlug,
  initialUrl = "",
}: {
  pageSlug: string;
  initialUrl?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Lazy init reads localStorage on first client render. Avoids setState-in-effect.
  const [url, setUrl] = useState<string>(() => readDraft(pageSlug, initialUrl));
  const [restoredFromDraft] = useState<boolean>(() => {
    const v = readDraft(pageSlug, initialUrl);
    return v !== initialUrl && v.length > 0;
  });
  const [error, setError] = useState<string | null>(null);

  // Debounced save — pure side effect to external system, no setState here.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => {
      if (url && url !== initialUrl) {
        localStorage.setItem(draftKey(pageSlug), url);
      } else {
        localStorage.removeItem(draftKey(pageSlug));
      }
    }, 500);
    return () => clearTimeout(t);
  }, [url, pageSlug, initialUrl]);

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
      if (typeof window !== "undefined") {
        localStorage.removeItem(draftKey(pageSlug));
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
          placeholder="https://example.com"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          suppressHydrationWarning
        />
        {restoredFromDraft ? (
          <p className="text-xs text-muted-foreground">
            Draft restored from your last session.
          </p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending
          ? "Submitting..."
          : initialUrl
            ? "Update submission"
            : "Submit"}
      </Button>
    </form>
  );
}
