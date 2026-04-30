import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import type { Role, UserStatus } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      status: UserStatus;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    status: UserStatus;
  }
}


const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const t = token as typeof token & {
        id?: string;
        role?: Role;
        status?: UserStatus;
        iat?: number;
        // Cache last DB sync time (sec since epoch) to avoid querying every request.
        lastSync?: number;
      };

      if (user) {
        t.id = (user as { id: string }).id;
        t.role = user.role;
        t.status = user.status;
        t.lastSync = Math.floor(Date.now() / 1000);
        return t;
      }

      // Periodic refresh: re-fetch role/status/passwordChangedAt every 60s.
      if (!t.id) return t;
      const now = Math.floor(Date.now() / 1000);
      if (t.lastSync && now - t.lastSync < 60) return t;

      const fresh = await prisma.user.findUnique({
        where: { id: t.id },
        select: { role: true, status: true, passwordChangedAt: true },
      });
      if (!fresh) return {};

      // Reject if password changed after token was issued.
      if (fresh.passwordChangedAt && t.iat) {
        const changedSec = Math.floor(fresh.passwordChangedAt.getTime() / 1000);
        if (t.iat < changedSec) return {};
      }

      t.role = fresh.role;
      t.status = fresh.status;
      t.lastSync = now;
      return t;
    },
    async session({ session, token }) {
      const t = token as { id?: string; role?: Role; status?: UserStatus };
      if (t.id) session.user.id = t.id;
      if (t.role) session.user.role = t.role;
      if (t.status) session.user.status = t.status;
      return session;
    },
  },
});
