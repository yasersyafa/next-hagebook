"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { decideUser, deleteUser, setUserRole, updateUser } from "@/actions/approve-user";

type Action = "APPROVE" | "REJECT" | "DEACTIVATE" | "REACTIVATE";

const actionLabels: Record<Action, { title: string; desc: string; confirm: string; destructive: boolean }> = {
  APPROVE: {
    title: "Approve user?",
    desc: "Grants access to lessons. They will receive an approval email.",
    confirm: "Approve",
    destructive: false,
  },
  REJECT: {
    title: "Reject user?",
    desc: "Denies access. They will receive a rejection email.",
    confirm: "Reject",
    destructive: true,
  },
  DEACTIVATE: {
    title: "Deactivate user?",
    desc: "Blocks access without deleting data. No email sent. Reversible.",
    confirm: "Deactivate",
    destructive: true,
  },
  REACTIVATE: {
    title: "Reactivate user?",
    desc: "Restores APPROVED status. No email sent.",
    confirm: "Reactivate",
    destructive: false,
  },
};

export function UserDecisionButtons({
  userId,
  email,
  name,
  role,
  status,
}: {
  userId: string;
  email: string;
  name?: string | null;
  role: "STUDENT" | "ADMIN";
  status: "PENDING" | "APPROVED" | "REJECTED" | "DEACTIVATED";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Confirm state per kind
  const [confirmAction, setConfirmAction] = useState<Action | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editEmail, setEditEmail] = useState(email);
  const [editName, setEditName] = useState(name ?? "");
  const [promoteOpen, setPromoteOpen] = useState(false);

  function runRole(next: "STUDENT" | "ADMIN") {
    const fd = new FormData();
    fd.set("userId", userId);
    fd.set("role", next);
    startTransition(async () => {
      const result = await setUserRole(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(next === "ADMIN" ? "Promoted to admin" : "Demoted to student");
      router.refresh();
    });
  }

  function runEdit() {
    const fd = new FormData();
    fd.set("userId", userId);
    fd.set("email", editEmail);
    fd.set("name", editName);
    startTransition(async () => {
      const result = await updateUser(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("User updated");
      setEditOpen(false);
      router.refresh();
    });
  }

  function runAction(action: Action) {
    const fd = new FormData();
    fd.set("userId", userId);
    fd.set("action", action);
    startTransition(async () => {
      const result = await decideUser(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(actionLabels[action].confirm + "d");
      router.refresh();
    });
  }

  function runDelete() {
    if (deleteEmailInput !== email) {
      toast.error("Email does not match");
      return;
    }
    const fd = new FormData();
    fd.set("userId", userId);
    fd.set("confirmEmail", deleteEmailInput);
    startTransition(async () => {
      const result = await deleteUser(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("User deleted");
      setDeleteOpen(false);
      setDeleteEmailInput("");
      router.refresh();
    });
  }

  const showApprove = status !== "APPROVED";
  const showReject = status !== "REJECTED" && status !== "DEACTIVATED";
  const showDeactivate = status === "APPROVED";
  const showReactivate = status === "DEACTIVATED" || status === "REJECTED";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="User actions"
              disabled={pending}
            />
          }
        >
          ⋮
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {showApprove ? (
            <DropdownMenuItem onClick={() => setConfirmAction("APPROVE")}>
              Approve
            </DropdownMenuItem>
          ) : null}
          {showReject ? (
            <DropdownMenuItem
              onClick={() => setConfirmAction("REJECT")}
              className="text-destructive focus:text-destructive"
            >
              Reject
            </DropdownMenuItem>
          ) : null}
          {showDeactivate ? (
            <DropdownMenuItem
              onClick={() => setConfirmAction("DEACTIVATE")}
              className="text-destructive focus:text-destructive"
            >
              Deactivate
            </DropdownMenuItem>
          ) : null}
          {showReactivate ? (
            <DropdownMenuItem onClick={() => setConfirmAction("REACTIVATE")}>
              Reactivate
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            Edit details
          </DropdownMenuItem>
          {role === "STUDENT" ? (
            <DropdownMenuItem onClick={() => setPromoteOpen(true)}>
              Promote to admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setPromoteOpen(true)}>
              Demote to student
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            Delete permanently
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={editOpen}
        pending={pending}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) {
            setEditEmail(email);
            setEditName(name ?? "");
          }
        }}
        title="Edit user details"
        description={
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor={`edit-email-${userId}`}>Email</Label>
              <Input
                id={`edit-email-${userId}`}
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`edit-name-${userId}`}>Name</Label>
              <Input
                id={`edit-name-${userId}`}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
          </div>
        }
        confirmLabel="Save"
        onConfirm={runEdit}
      />

      <ConfirmDialog
        open={promoteOpen}
        pending={pending}
        onOpenChange={setPromoteOpen}
        title={role === "STUDENT" ? "Promote to admin?" : "Demote to student?"}
        description={
          role === "STUDENT"
            ? `Grants admin access to all data and lifecycle actions. Reversible.`
            : `Removes admin access. Cannot demote the last admin.`
        }
        confirmLabel={role === "STUDENT" ? "Promote" : "Demote"}
        destructive={role === "ADMIN"}
        onConfirm={() => {
          setPromoteOpen(false);
          runRole(role === "STUDENT" ? "ADMIN" : "STUDENT");
        }}
      />

      {confirmAction ? (
        <ConfirmDialog
          open={confirmAction !== null}
          pending={pending}
          onOpenChange={(o) => {
            if (!o) setConfirmAction(null);
          }}
          title={actionLabels[confirmAction].title}
          description={
            <>
              <span className="block">{actionLabels[confirmAction].desc}</span>
              <span className="mt-2 block font-mono text-xs text-muted-foreground">
                {email}
              </span>
            </>
          }
          confirmLabel={actionLabels[confirmAction].confirm}
          destructive={actionLabels[confirmAction].destructive}
          onConfirm={() => {
            const a = confirmAction;
            setConfirmAction(null);
            if (a) runAction(a);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={deleteOpen}
        pending={pending}
        onOpenChange={(o) => {
          setDeleteOpen(o);
          if (!o) setDeleteEmailInput("");
        }}
        title="Delete user permanently?"
        description={
          <div className="space-y-3">
            <p>
              This removes the user, their submissions, and reset tokens. Cannot
              be undone. Pages authored by this user must be reassigned or
              deleted first.
            </p>
            <div className="space-y-1">
              <Label htmlFor={`confirm-${userId}`}>
                Type <span className="font-mono">{email}</span> to confirm
              </Label>
              <Input
                id={`confirm-${userId}`}
                value={deleteEmailInput}
                onChange={(e) => setDeleteEmailInput(e.target.value)}
                placeholder={email}
                autoComplete="off"
              />
            </div>
          </div>
        }
        confirmLabel="Delete forever"
        destructive
        onConfirm={runDelete}
      />
    </>
  );
}
