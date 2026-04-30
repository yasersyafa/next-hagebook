import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { listPublishedCategories, listPublishedPages } from "@/lib/pages";
import { ProfileLanding } from "@/components/profile-landing";
import { LessonsHub } from "@/components/lessons-hub";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://next-hagebook.vercel.app";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  if (user?.role === "ADMIN") {
    redirect("/admin/pages");
  }

  if (user?.status === "APPROVED") {
    const [pages, categories] = await Promise.all([
      listPublishedPages(),
      listPublishedCategories(),
    ]);
    return (
      <LessonsHub
        pages={pages}
        categories={categories}
        userName={user.name ?? user.email ?? "there"}
      />
    );
  }

  // Guests + pending users: profile landing + recent lessons (titles + descriptions).
  const lessons = await listPublishedPages();
  return <ProfileLanding signedIn={Boolean(user)} lessons={lessons.slice(0, 6)} />;
}
