import { and, eq, gt, sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { subscribers, verificationTokens } from "@/lib/db/schema";
import { setSessionCookie } from "@/lib/session";
import { hashToken } from "@/lib/tokens";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const fail = () => NextResponse.redirect(new URL("/?verify=error", request.url));
  if (!token) return fail();

  // Tokens stay valid until they expire rather than being single-use: corporate mail
  // scanners often open links before the recipient does, which would burn the token.
  const [row] = await db()
    .update(verificationTokens)
    .set({ usedAt: sql`coalesce(${verificationTokens.usedAt}, now())` })
    .where(
      and(eq(verificationTokens.tokenHash, hashToken(token)), gt(verificationTokens.expiresAt, new Date())),
    )
    .returning();
  if (!row) return fail();

  const profile = {
    firstName: row.profile.firstName,
    lastName: row.profile.lastName,
    company: row.profile.company,
    jobTitle: row.profile.jobTitle ?? null,
    phone: row.profile.phone ?? null,
  };
  const [subscriber] = await db()
    .insert(subscribers)
    .values({ email: row.email, ...profile, verifiedAt: new Date(), consentAt: row.createdAt })
    .onConflictDoUpdate({
      target: subscribers.email,
      set: {
        ...profile,
        updatedAt: new Date(),
        verifiedAt: sql`coalesce(${subscribers.verifiedAt}, now())`,
        consentAt: row.createdAt,
      },
    })
    .returning({ id: subscribers.id, email: subscribers.email });

  const target = new URL("/?verified=1#protected", request.url);
  const response = NextResponse.redirect(target);
  await setSessionCookie(response, { subscriberId: subscriber.id, email: subscriber.email });
  return response;
}
