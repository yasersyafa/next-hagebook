"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitAssignment } from "@/actions/submit-assignment";

const draftKey = (slug: string) => `hagebook-submit-draft-${slug}`;

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
  const hydrated = useRef(false);

  // Restore draft once on mount, only if it differs from initialUrl.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(draftKey(pageSlug));
    if (saved && saved !== initialUrl && saved.trim().length > 0) {
      setUrl(saved);
    }
  }, [pageSlug, initialUrl]);

  // Debounced save to localStorage.
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
      // Clear draft on success.
      if (typeof window !== "undefined") {
        localStorage.removeItem(draftKey(pageSlug));
      }
      toast.success("Submitted");
      router.refresh();
    });
  }

  const draftRestored =
    typeof window !== "undefined" &&
    url !== initialUrl &&
    localStorage.getItem(draftKey(pageSlug)) === url &&
    url.length > 0;

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
        {draftRestored ? (
          <p className="text-xs text-muted-foreground">
            Draft restored from your last session.
          </p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : initialUrl ? "Update submission" : "Submit"}
      </Button>
    </form>
  );
}
