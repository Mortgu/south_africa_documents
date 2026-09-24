import { NextResponse } from "next/server";
import { getSubscriber } from "@/lib/session";

/** Polled by the access form while it waits for the visitor to click the email link. */
export async function GET() {
  const subscriber = await getSubscriber();
  return NextResponse.json(
    { verified: subscriber !== null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
