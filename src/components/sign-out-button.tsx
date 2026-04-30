"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { logoutAction } from "@/actions/auth";

type ButtonVariant =
  | "default"
  | "outline"
  | "ghost"
  | "secondary"
  | "destructive"
  | "link";

export function SignOutButton({
  variant = "outline",
  size = "sm",
  className,
  label = "Sign out",
  fullWidth = false,
}: {
  variant?: ButtonVariant;
  size?: "default" | "sm" | "lg" | "icon" | "xs";
  className?: string;
  label?: string;
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className ?? (fullWidth ? "w-full" : "")}
        onClick={() => setOpen(true)}
        disabled={pending}
      >
        {label}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Sign out?"
        description="You'll need to sign in again to access your dashboard."
        confirmLabel={pending ? "Signing out..." : "Sign out"}
        onConfirm={() => {
          startTransition(async () => {
            await logoutAction();
          });
        }}
      />
    </>
  );
}
