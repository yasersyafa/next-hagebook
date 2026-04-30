import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileMenu } from "@/components/mobile-menu";

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
    <header className="border-b sticky top-0 z-40 bg-background/80 backdrop-blur">
      <nav className="container mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold tracking-tight">
          <span className="text-primary">hage</span>book
        </Link>

        {/* Desktop cluster */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {user.status === "APPROVED" && user.role !== "ADMIN" ? (
                <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Dashboard
                </Link>
              ) : null}
              {user.role === "ADMIN" ? (
                <>
                  <Link href="/admin/pages" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    Pages
                  </Link>
                  <Link href="/admin/users" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    Users
                  </Link>
                  <Link href="/admin/submissions" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    Submissions
                  </Link>
                </>
              ) : null}
              <span className="hidden lg:inline text-sm text-muted-foreground">
                {user.email}
              </span>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Sign in
              </Link>
              <Link href="/register" className={buttonVariants({ size: "sm" })}>
                Register
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile cluster */}
        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <MobileMenu user={menuUser} />
        </div>
      </nav>
    </header>
  );
}
