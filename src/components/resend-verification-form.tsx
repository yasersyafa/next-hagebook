"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resendVerification } from "@/actions/auth";

export function ResendVerificationForm() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await resendVerification(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setDone(true);
      toast.success("If an account exists, we sent a new verification email.");
    });
  }

  if (done) {
    return (
      <p className="text-sm text-muted-foreground">
        If an account exists for that email, a new verification link has been sent.
        Check your inbox (and spam folder).
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="resend-email">Resend verification email</Label>
        <Input
          id="resend-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending..." : "Send link"}
      </Button>
    </form>
  );
}
