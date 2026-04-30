import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Image upload not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 503 },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: "Unsupported image type. Use PNG, JPEG, GIF, or WEBP." },
      { status: 400 },
    );
  }

  const lengthHeader = request.headers.get("content-length");
  if (lengthHeader && Number(lengthHeader) > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 5MB)" }, { status: 413 });
  }

  const filename = request.headers.get("x-filename") ?? `image-${Date.now()}`;
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "bin";
  const key = `lessons/${Date.now()}-${safeFilename}${safeFilename.endsWith(`.${ext}`) ? "" : `.${ext}`}`;

  const body = request.body;
  if (!body) {
    return NextResponse.json({ error: "Empty body" }, { status: 400 });
  }

  try {
    const blob = await put(key, body, {
      access: "public",
      contentType,
      token,
    });
    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (err) {
    console.error("[upload-image]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
