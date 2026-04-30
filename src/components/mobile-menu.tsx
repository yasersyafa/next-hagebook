"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";

type MenuUser = {
  email: string;
  name?: string | null;
  role: "STUDENT" | "ADMIN";
  status: "PENDING" | "APPROVED" | "REJECTED" | "DEACTIVATED";
} | null;

export function MobileMenu({ user }: { user: MenuUser }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const linkClass =
    buttonVariants({ variant: "ghost", size: "default" }) + " justify-start w-full";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label="Open menu"
            className="md:hidden"
          />
        }
      >
        <span className="text-lg leading-none">☰</span>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>
            <span className="text-primary">hage</span>book
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4">
          {user ? (
            <>
              <p className="text-xs text-muted-foreground px-2 pb-2 truncate">
                {user.name ?? user.email}
              </p>
              {user.status === "APPROVED" && user.role !== "ADMIN" ? (
                <Link href="/dashboard" className={linkClass} onClick={close}>
                  Dashboard
                </Link>
              ) : null}
              {user.role !== "ADMIN" ? (
                <Link href="/account" className={linkClass} onClick={close}>
                  Account
                </Link>
              ) : null}
              {user.role === "ADMIN" ? (
                <>
                  <Link href="/admin/pages" className={linkClass} onClick={close}>
                    Pages
                  </Link>
                  <Link href="/admin/users" className={linkClass} onClick={close}>
                    Users
                  </Link>
                  <Link href="/admin/submissions" className={linkClass} onClick={close}>
                    Submissions
                  </Link>
                  <Link href="/admin/audit" className={linkClass} onClick={close}>
                    Audit
                  </Link>
                </>
              ) : null}
              <div className="mt-2">
                <SignOutButton variant="outline" className="w-full" />
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass} onClick={close}>
                Sign in
              </Link>
              <Link
                href="/register"
                className={buttonVariants({ size: "default" }) + " w-full"}
                onClick={close}
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
