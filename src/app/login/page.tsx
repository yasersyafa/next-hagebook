import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; reset?: string }>;
}) {
  const sp = await searchParams;
  const banner =
    sp.registered === "1"
      ? "Account created. An admin will review your account — you'll get an email when approved."
      : sp.reset === "1"
        ? "Password updated. Sign in with the new password."
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
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Link href="/forgot" className="text-primary underline-offset-4 hover:underline">
              Forgot password?
            </Link>
            <span>
              No account?{" "}
              <Link href="/register" className="text-primary underline-offset-4 hover:underline">
                Register
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
