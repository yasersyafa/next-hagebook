import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const dynamic = "force-dynamic";

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-svh flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Missing token</CardTitle>
            <CardDescription>
              Use the reset link from your email. Tokens are single-use and expire in 1 hour.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/forgot" className={buttonVariants() + " w-full"}>
              Request a new link
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Choose a new password</CardTitle>
          <CardDescription>Min 8 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
