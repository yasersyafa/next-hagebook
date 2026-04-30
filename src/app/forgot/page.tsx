import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPage() {
  return (
    <div className="min-h-svh flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>
            Enter your email — if an account exists, we'll send a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ForgotPasswordForm />
          <p className="text-sm text-muted-foreground">
            Back to{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
