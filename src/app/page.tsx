import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listPublishedCategories, listPublishedPages } from "@/lib/pages";
import { ProfileLanding } from "@/components/profile-landing";
import { LessonsHub } from "@/components/lessons-hub";

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

  return <ProfileLanding signedIn={Boolean(user)} />;
}
