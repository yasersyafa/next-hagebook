import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = {
  title: "Account status",
  robots: { index: false, follow: false },
};

const titles: Record<string, string> = {
  PENDING: "Awaiting approval",
  REJECTED: "Account rejected",
  DEACTIVATED: "Account deactivated",
  APPROVED: "All set",
};

const descriptions: Record<string, string> = {
  PENDING:
    "An admin must approve your account before you can access lessons. Check back soon.",
  REJECTED:
    "Your account was rejected. Contact an admin if you think this is a mistake.",
  DEACTIVATED:
    "Your account has been deactivated. Contact an admin to reactivate it.",
  APPROVED: "",
};

export default async function PendingPage() {
  const session = await auth();
  const status = (session?.user?.status ?? "PENDING") as keyof typeof titles;
  const title = titles[status] ?? titles.PENDING;
  const desc = descriptions[status] ?? descriptions.PENDING;
  const variant =
    status === "REJECTED" || status === "DEACTIVATED"
      ? "destructive"
      : "secondary";

  return (
    <div className="min-h-svh flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {title} <Badge variant={variant}>{status}</Badge>
          </CardTitle>
          <CardDescription>{desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <SignOutButton variant="outline" className="w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
