import { auth } from "@/lib/auth";
import { listPublishedPages } from "@/lib/pages";
import { CommandPalette } from "@/components/command-palette";

export async function CommandPaletteMount() {
  const session = await auth();
  const user = session?.user
    ? { role: session.user.role, status: session.user.status }
    : null;

  // Lessons only for approved students + admins
  let lessons: { slug: string; title: string }[] = [];
  if (user && (user.role === "ADMIN" || user.status === "APPROVED")) {
    const pages = await listPublishedPages();
    lessons = pages.map((p) => ({ slug: p.slug, title: p.title }));
  }

  return <CommandPalette user={user} lessons={lessons} />;
}
