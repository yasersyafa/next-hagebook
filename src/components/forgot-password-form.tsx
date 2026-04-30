"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/actions/password-reset";

export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await requestPasswordReset(fd);
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
        If an account exists for that email, a reset link has been sent. Check your
        inbox (and spam folder). The link expires in 1 hour.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
