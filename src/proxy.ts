import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const path = nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");
  // /pages/* is now publicly crawlable (teaser for unauth users).
  // Keep /dashboard gated.
  const isAppRoute = path.startsWith("/dashboard");

  if (isAdminRoute) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/404", nextUrl));
    }
    return;
  }

  if (isAppRoute) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (session.user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/pages", nextUrl));
    }
    if (session.user.status !== "APPROVED") {
      return NextResponse.redirect(new URL("/pending", nextUrl));
    }
    return;
  }

  if (path === "/pending") {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (session.user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/pages", nextUrl));
    }
    if (session.user.status === "APPROVED") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  if ((path === "/login" || path === "/register") && session?.user) {
    if (session.user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/pages", nextUrl));
    }
    if (session.user.status === "APPROVED") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.redirect(new URL("/pending", nextUrl));
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
