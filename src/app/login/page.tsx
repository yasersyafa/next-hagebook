import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; registered?: string }>;
}) {
  const sp = await searchParams;
  const banner =
    sp.verified === "1"
      ? "Email verified. Sign in to continue."
      : sp.registered === "1"
        ? "Check your inbox for a verification link, then sign in."
        : null;

  return (
    <div className="min-h-svh flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {banner ? (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm text-primary">
              {banner}
            </div>
          ) : null}
          <LoginForm />
          <p className="text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
