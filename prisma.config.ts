// Prisma 7 config. Migrations need a *direct* (non-pooled) connection on
// providers like Neon, because PgBouncer doesn't support advisory locks +
// schema introspection that prisma migrate uses.
//
// Prod (.env on Vercel + locally pointing at Neon):
//   DATABASE_URL = pooled (-pooler.<region>.neon.tech)
//   DIRECT_URL   = direct (no pooler)
// Local dev (Postgres on localhost):
//   DATABASE_URL = postgresql://user:pass@localhost:5432/db
//   DIRECT_URL   = (unset, falls back to DATABASE_URL)
//
// Runtime queries (src/lib/db.ts) use DATABASE_URL (pooled in prod).
// Migrations + introspection (prisma CLI) use DIRECT_URL via this config.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
