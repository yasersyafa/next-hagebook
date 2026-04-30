import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { renderEmailPreview, type EmailTemplateName } from "@/lib/email";

const VALID: EmailTemplateName[] = [
  "approval",
  "rejection",
  "reset",
  "grade-pass",
  "grade-fail",
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ template: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const { template } = await params;
  if (!VALID.includes(template as EmailTemplateName)) {
    return NextResponse.json(
      { error: "Unknown template", valid: VALID },
      { status: 400 },
    );
  }
  const { html } = renderEmailPreview(template as EmailTemplateName);
  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
