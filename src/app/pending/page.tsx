import { auth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function PendingPage() {
  const session = await auth();
  const status = session?.user?.status ?? "PENDING";

  return (
    <div className="min-h-svh flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Awaiting approval <Badge variant={status === "REJECTED" ? "destructive" : "secondary"}>{status}</Badge>
          </CardTitle>
          <CardDescription>
            {status === "REJECTED"
              ? "Your account was rejected. Contact an admin if you think this is a mistake."
              : "An admin must approve your account before you can access lessons. Check back soon."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" className="w-full">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
