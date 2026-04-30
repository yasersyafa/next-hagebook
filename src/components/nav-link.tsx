"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  children,
  className,
  exact = false,
  variant = "ghost",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  exact?: boolean;
  variant?: "ghost" | "default";
}) {
  const pathname = usePathname();
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  const base =
    "inline-flex h-7 items-center rounded-md px-2.5 text-[0.8rem] font-medium transition-colors";
  const inactive =
    variant === "default"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "text-muted-foreground hover:text-foreground hover:bg-muted";
  const activeCls =
    variant === "default"
      ? "bg-primary text-primary-foreground"
      : "bg-primary/10 text-primary";

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(base, active ? activeCls : inactive, className)}
    >
      {children}
    </Link>
  );
}
