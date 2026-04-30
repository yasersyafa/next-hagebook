"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserCircle, LayoutDashboard, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { logoutAction } from "@/actions/auth";

type Role = "STUDENT" | "ADMIN";
type Status = "PENDING" | "APPROVED" | "REJECTED" | "DEACTIVATED";

export function UserMenu({
  email,
  name,
  role,
  status,
}: {
  email: string;
  name: string | null | undefined;
  role: Role;
  status: Status;
}) {
  const router = useRouter();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const initials = (name ?? email)
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";

  const isAdmin = role === "ADMIN";
  const approved = status === "APPROVED" && !isAdmin;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label="Account menu"
              className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-400 text-xs font-semibold text-primary-foreground shadow-sm ring-2 ring-transparent hover:ring-primary/30 transition-all focus-visible:outline-none focus-visible:ring-primary/50"
            />
          }
        >
          {initials}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium truncate">{name ?? "Signed in"}</span>
              <span className="text-xs text-muted-foreground font-normal truncate">
                {email}
              </span>
              <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {isAdmin ? "Admin" : status}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {approved ? (
            <DropdownMenuItem render={<Link href="/dashboard" />}>
              <LayoutDashboard className="mr-2 size-4" />
              Dashboard
            </DropdownMenuItem>
          ) : null}
          {!isAdmin ? (
            <DropdownMenuItem render={<Link href="/account" />}>
              <UserCircle className="mr-2 size-4" />
              Account
            </DropdownMenuItem>
          ) : null}
          {isAdmin ? (
            <DropdownMenuItem render={<Link href="/admin/pages" />}>
              <ShieldCheck className="mr-2 size-4" />
              Admin
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setSignOutOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={signOutOpen}
        pending={pending}
        onOpenChange={setSignOutOpen}
        title="Sign out?"
        description="You'll need to sign in again to access your dashboard."
        confirmLabel="Sign out"
        onConfirm={() => {
          startTransition(async () => {
            await logoutAction();
            router.refresh();
          });
        }}
      />
    </>
  );
}
