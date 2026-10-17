import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Pre-launch lock: while SITE_PASSWORD is set, the whole site asks for HTTP Basic Auth
 * (user SITE_USER, default "dignum"). Remove the variable and restart to open the site.
 */
export function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();

  const expected = Buffer.from(`${process.env.SITE_USER || "dignum"}:${password}`);
  const header = request.headers.get("authorization") ?? "";
  const given = header.startsWith("Basic ") ? Buffer.from(header.slice(6), "base64") : Buffer.alloc(0);
  if (given.length === expected.length && timingSafeEqual(given, expected)) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="dignum (pre-launch)", charset="UTF-8"' },
  });
}

export const config = {
  // Static build assets stay public; the notify route authenticates with its own bearer token.
  matcher: ["/((?!_next/static|_next/image|api/cron/notify).*)"],
};
