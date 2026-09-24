"use server";

import { and, count, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { findDocument } from "@/content/documents";
import { db } from "@/lib/db";
import { verificationTokens } from "@/lib/db/schema";
import { sendVerificationEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { createToken, TOKEN_TTL_MS } from "@/lib/tokens";

const MAX_REQUESTS_PER_HOUR = 3;

const schema = z.object({
  email: z.email().max(254),
  consent: z.literal(true),
  slug: z.string().min(1),
});

export type RequestAccessResult = { ok: true } | { ok: false; error: string };

export async function requestAccess(input: {
  email: string;
  consent: boolean;
  slug: string;
}): Promise<RequestAccessResult> {
  const parsed = schema.safeParse({ ...input, email: input.email.trim().toLowerCase() });
  if (!parsed.success) {
    return { ok: false, error: "Please enter a valid email address and accept the privacy notice." };
  }
  const { email, slug } = parsed.data;

  const doc = findDocument(slug);
  if (!doc || doc.access !== "protected") {
    return { ok: false, error: "This document is not available." };
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [{ recent }] = await db()
    .select({ recent: count() })
    .from(verificationTokens)
    .where(and(eq(verificationTokens.email, email), gt(verificationTokens.createdAt, oneHourAgo)));
  if (recent >= MAX_REQUESTS_PER_HOUR) {
    return { ok: false, error: "Too many requests for this address. Please try again later." };
  }

  const { token, hash } = createToken();
  await db()
    .insert(verificationTokens)
    .values({
      tokenHash: hash,
      email,
      documentSlug: slug,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    });

  const verifyUrl = new URL("/api/verify", env().APP_URL);
  verifyUrl.searchParams.set("token", token);

  try {
    await sendVerificationEmail(email, doc.title, verifyUrl.toString());
  } catch (error) {
    console.error("Failed to send verification email", error);
    return { ok: false, error: "We couldn't send the email. Please try again later." };
  }
  return { ok: true };
}
