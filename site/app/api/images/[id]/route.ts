import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { images } from "@/lib/schema";

/**
 * Serves an uploaded image.
 *
 * Images are immutable once uploaded: replacing one means uploading a new
 * image and pointing at it. That makes the response safe to cache hard,
 * which matters because these bytes come out of Postgres rather than off
 * a CDN.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numeric = Number(id);
  if (!Number.isInteger(numeric) || numeric < 1) {
    return new NextResponse("Not found", { status: 404 });
  }

  const [row] = await db
    .select({ data: images.data, mimeType: images.mimeType })
    .from(images)
    .where(eq(images.id, numeric))
    .limit(1);

  if (!row) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.mimeType,
      "Content-Length": String(row.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
