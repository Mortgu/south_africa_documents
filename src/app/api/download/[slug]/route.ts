import { NextResponse } from "next/server";
import { findDocument } from "@/content/documents";
import { db } from "@/lib/db";
import { downloads } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { getSubscriber } from "@/lib/session";
import { findFile } from "@/lib/storage";

export async function GET(_request: Request, ctx: RouteContext<"/api/download/[slug]">) {
  const { slug } = await ctx.params;
  const doc = findDocument(slug);
  if (!doc) {
    return new NextResponse("Document not found", { status: 404 });
  }

  // Also resolved for free documents, so signed-in visitors' downloads show up in staff notifications.
  const subscriber = await getSubscriber();
  if (doc.access === "protected" && !subscriber) {
    // Built from APP_URL: behind the reverse proxy the request URL may point at 127.0.0.1.
    return NextResponse.redirect(new URL("/", env().APP_URL));
  }

  const file = await findFile(doc.storageKey);
  if (!file) {
    console.error(`Missing file for document ${doc.slug}: ${doc.storageKey}`);
    return new NextResponse("Document not found", { status: 404 });
  }

  // Logging must never block the download.
  try {
    await db()
      .insert(downloads)
      .values({ documentSlug: doc.slug, subscriberId: subscriber?.id ?? null });
  } catch (error) {
    console.error("Failed to log download", error);
  }

  return new Response(file.open(), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.size),
      "Content-Disposition": `attachment; filename="${file.fileName.replace(/[^\x20-\x7e]|"/g, "_")}"; filename*=UTF-8''${encodeRfc5987(file.fileName)}`,
      "Cache-Control": "private, no-store",
    },
  });
}

/** encodeURIComponent leaves ' ( ) * unescaped, which RFC 5987 values must not contain. */
function encodeRfc5987(value: string) {
  return encodeURIComponent(value).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}
