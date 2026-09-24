import { NextResponse, type NextRequest } from "next/server";
import { findDocument } from "@/content/documents";
import { getDownloadUrl } from "@/lib/storage";

export async function GET(request: NextRequest, ctx: RouteContext<"/api/download/[slug]">) {
  const { slug } = await ctx.params;
  const doc = findDocument(slug);
  if (!doc) {
    return new NextResponse("Document not found", { status: 404 });
  }

  // TODO (step 5): allow protected documents for verified visitors and log downloads.
  if (doc.access === "protected") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const url = await getDownloadUrl(doc.storageKey);
  return NextResponse.redirect(url, { headers: { "Cache-Control": "no-store" } });
}
