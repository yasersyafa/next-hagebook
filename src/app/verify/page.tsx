import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ResendVerificationForm } from "@/components/resend-verification-form";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) return <ErrorCard reason="missing" />;

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!record) return <ErrorCard reason="invalid" />;
  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: record.id } }).catch(() => null);
    return <ErrorCard reason="expired" />;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.delete({ where: { id: record.id } }),
  ]);

  redirect("/login?verified=1");
}

function ErrorCard({ reason }: { reason: "missing" | "invalid" | "expired" }) {
  const title =
    reason === "missing"
      ? "Missing verification token"
      : reason === "expired"
        ? "Verification link expired"
        : "Invalid verification link";
  const desc =
    reason === "missing"
      ? "No token in URL. Use the link from your email."
      : reason === "expired"
        ? "Links expire after 24 hours. Request a new one below."
        : "Token not recognized. It may have already been used.";
  return (
    <div className="min-h-svh flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResendVerificationForm />
          <Link href="/login" className={buttonVariants({ variant: "outline" }) + " w-full"}>
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
