import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { sanitizeHtml } from "../src/lib/sanitize";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CONTENT_DIR = path.join(process.cwd(), "content");

async function main() {
  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  if (!adminEmail) {
    console.error("BOOTSTRAP_ADMIN_EMAIL not set in .env");
    process.exit(1);
  }
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error(`No user with email ${adminEmail}. Register that user first.`);
    process.exit(1);
  }

  const files = await fs.readdir(CONTENT_DIR).catch(() => []);
  const mdxFiles = files.filter((f) => f.endsWith(".mdx"));
  if (mdxFiles.length === 0) {
    console.log("No MDX files in /content. Nothing to seed.");
    return;
  }

  let seeded = 0;
  for (const file of mdxFiles) {
    const slug = file.replace(/\.mdx$/, "");
    const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
    const parsed = matter(raw);
    const fm = parsed.data as {
      title?: string;
      order?: number;
      description?: string;
      assignment?: { prompt?: string };
    };
    if (!fm.title) {
      console.warn(`Skipping ${file}: missing title in frontmatter`);
      continue;
    }
    const html = await marked.parse(parsed.content);
    const safeHtml = sanitizeHtml(html);

    await prisma.page.upsert({
      where: { slug },
      create: {
        slug,
        title: fm.title,
        description: fm.description ?? null,
        order: typeof fm.order === "number" ? fm.order : 0,
        contentHtml: safeHtml,
        assignmentPrompt: fm.assignment?.prompt ?? null,
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: admin.id,
      },
      update: {
        title: fm.title,
        description: fm.description ?? null,
        order: typeof fm.order === "number" ? fm.order : 0,
        contentHtml: safeHtml,
        assignmentPrompt: fm.assignment?.prompt ?? null,
      },
    });
    seeded += 1;
    console.log(`✓ ${slug}`);
  }
  console.log(`Seeded ${seeded} page(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
