import Link from "next/link";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import { LogoMark, Wordmark } from "@/components/logo";
import { NavLink } from "@/components/nav-link";
import { SearchPill } from "@/components/search-pill";
import { UserMenu } from "@/components/user-menu";
import { ScrollAwareHeader } from "@/components/scroll-aware-header";

export async function Nav() {
  const session = await auth();
  const user = session?.user;

  const menuUser = user
    ? {
        email: user.email ?? "",
        name: user.name,
        role: user.role,
        status: user.status,
      }
    : null;

  return (
    <ScrollAwareHeader>
      <nav className="container mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-semibold tracking-tight flex items-center gap-2.5 group"
        >
          <LogoMark
            size={28}
            className="rounded-lg transition-transform group-hover:scale-105"
          />
          <Wordmark className="hidden sm:inline" />
        </Link>

        {/* Desktop cluster */}
        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              {user.status === "APPROVED" && user.role !== "ADMIN" ? (
                <NavLink href="/dashboard">Dashboard</NavLink>
              ) : null}
              {user.role === "ADMIN" ? (
                <>
                  <NavLink href="/admin/pages">Pages</NavLink>
                  <NavLink href="/admin/users">Users</NavLink>
                  <NavLink href="/admin/submissions">Submissions</NavLink>
                  <NavLink href="/admin/audit">Audit</NavLink>
                </>
              ) : null}
              <div className="ml-2 flex items-center gap-2">
                {user.role === "ADMIN" || user.status === "APPROVED" ? (
                  <SearchPill />
                ) : null}
                <ThemeToggle />
                <UserMenu
                  email={user.email ?? ""}
                  name={user.name}
                  role={user.role}
                  status={user.status}
                />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={buttonVariants({ size: "sm" })}
              >
                Register
              </Link>
              <ThemeToggle />
            </>
          )}
        </div>

        {/* Mobile cluster */}
        <div className="flex md:hidden items-center gap-1">
          {user && (user.role === "ADMIN" || user.status === "APPROVED") ? (
            <SearchPill />
          ) : null}
          <ThemeToggle />
          <MobileMenu user={menuUser} />
        </div>
      </nav>
    </ScrollAwareHeader>
  );
}
