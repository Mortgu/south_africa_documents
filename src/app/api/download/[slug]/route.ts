import { NextResponse, type NextRequest } from "next/server";
import { findDocument } from "@/content/documents";
import { db } from "@/lib/db";
import { downloads } from "@/lib/db/schema";
import { getSubscriber } from "@/lib/session";
import { getDownloadUrl } from "@/lib/storage";

export async function GET(request: NextRequest, ctx: RouteContext<"/api/download/[slug]">) {
  const { slug } = await ctx.params;
  const doc = findDocument(slug);
  if (!doc) {
    return new NextResponse("Document not found", { status: 404 });
  }

  const subscriber = doc.access === "protected" ? await getSubscriber() : null;
  if (doc.access === "protected" && !subscriber) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const url = await getDownloadUrl(doc.storageKey);

  // Logging must never block the download.
  try {
    await db()
      .insert(downloads)
      .values({ documentSlug: doc.slug, subscriberId: subscriber?.id ?? null });
  } catch (error) {
    console.error("Failed to log download", error);
  }

  return NextResponse.redirect(url, { headers: { "Cache-Control": "no-store" } });
}
