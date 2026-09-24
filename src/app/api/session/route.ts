import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/** Polled by the unlock modal while it waits for the visitor to click the email link. */
export async function GET() {
  const session = await getSession();
  return NextResponse.json(
    { email: session?.email ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
