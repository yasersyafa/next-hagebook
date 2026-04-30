import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: "STUDENT" | "ADMIN" }).role;
        token.status = (user as { status: "PENDING" | "APPROVED" | "REJECTED" }).status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as "STUDENT" | "ADMIN";
        session.user.status = token.status as "PENDING" | "APPROVED" | "REJECTED";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
