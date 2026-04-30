"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { exportMyData, deleteMyAccount } from "@/actions/account";

export function AccountActions({
  mode,
  email,
  isAdmin,
}: {
  mode: "export" | "delete";
  email: string;
  isAdmin: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmInput, setConfirmInput] = useState("");
  const [open, setOpen] = useState(false);

  if (mode === "export") {
    return (
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await exportMyData();
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            const json =
              (result.data as { json?: string } | undefined)?.json ?? "{}";
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `hagebook-data-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Download started");
          });
        }}
      >
        {pending ? "Preparing..." : "Download my data (JSON)"}
      </Button>
    );
  }

  // Delete mode
  return (
    <>
      <Button
        type="button"
        variant="destructive"
        onClick={() => setOpen(true)}
        disabled={isAdmin}
      >
        Delete my account
      </Button>
      {isAdmin ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Admins must transfer the role before self-deleting.
        </p>
      ) : null}
      <ConfirmDialog
        open={open}
        pending={pending}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setConfirmInput("");
        }}
        title="Delete your account?"
        description={
          <div className="space-y-3">
            <p>
              This permanently removes your account, submissions, and lesson
              reads. We cannot recover any of it.
            </p>
            <div className="space-y-1">
              <Label htmlFor="confirm-self">
                Type <span className="font-mono">{email}</span> to confirm
              </Label>
              <Input
                id="confirm-self"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={email}
                autoComplete="off"
              />
            </div>
          </div>
        }
        confirmLabel="Delete forever"
        destructive
        onConfirm={() => {
          if (confirmInput !== email) {
            toast.error("Email does not match");
            return;
          }
          const fd = new FormData();
          fd.set("confirmEmail", confirmInput);
          startTransition(async () => {
            const result = await deleteMyAccount(fd);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            // redirect happens server-side
          });
        }}
      />
    </>
  );
}
