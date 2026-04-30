import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountActions } from "@/components/account-actions";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
        <p className="text-muted-foreground">
          Signed in as {session.user.email}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your data</CardTitle>
          <CardDescription>Download a copy of everything we store about you.</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountActions
            mode="export"
            email={session.user.email ?? ""}
            isAdmin={session.user.role === "ADMIN"}
          />
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all submissions. Cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountActions
            mode="delete"
            email={session.user.email ?? ""}
            isAdmin={session.user.role === "ADMIN"}
          />
        </CardContent>
      </Card>
    </div>
  );
}
