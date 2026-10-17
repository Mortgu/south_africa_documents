import { NextResponse, type NextRequest } from "next/server";
import { notifyEnv } from "@/lib/env";
import { notifyDueSubscribers } from "@/lib/notifications";

/** Called hourly by an external scheduler (see deploy/README.md) with the CRON_SECRET as bearer token. */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${notifyEnv().CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  return NextResponse.json(await notifyDueSubscribers());
}
