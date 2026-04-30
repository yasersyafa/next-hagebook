"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default function EditError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[edit-page]", error);
  }, [error]);

  return (
    <div className="container mx-auto max-w-xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Failed to load editor</CardTitle>
          <CardDescription>
            {error.message || "Server component threw an error."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error.digest ? (
            <p className="text-xs font-mono text-muted-foreground">
              digest: {error.digest}
            </p>
          ) : null}
          <div className="flex gap-2">
            <button onClick={reset} className={buttonVariants({ variant: "outline" })}>
              Try again
            </button>
            <Link href="/admin/pages" className={buttonVariants()}>
              Back to pages
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
