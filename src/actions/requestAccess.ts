"use server";

import { and, count, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { verificationTokens } from "@/lib/db/schema";
import { sendVerificationEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { createToken, TOKEN_TTL_MS } from "@/lib/tokens";

const MAX_REQUESTS_PER_HOUR = 3;

const required = (message: string) => z.string().trim().min(1, message).max(100);
const optional = (schema: z.ZodString) =>
  z
    .string()
    .trim()
    .transform((v) => v || undefined)
    .pipe(schema.optional());

const schema = z.object({
  firstName: required("Please enter your first name."),
  lastName: required("Please enter your last name."),
  company: required("Please enter your company."),
  jobTitle: optional(z.string().max(100)),
  phone: optional(z.string().regex(/^[+()\d\s/-]{6,25}$/, "Please enter a valid phone number.")),
  email: z.string().trim().toLowerCase().pipe(z.email("Please enter a valid email address.").max(254)),
  consent: z.literal(true, "Please accept the privacy notice."),
});

export type RegistrationInput = z.input<typeof schema>;
export type RegistrationField = keyof RegistrationInput;

export type RequestAccessResult =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: Partial<Record<RegistrationField, string>> };

export async function requestAccess(input: RegistrationInput): Promise<RequestAccessResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<RegistrationField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as RegistrationField;
      fieldErrors[field] ??= issue.message;
    }
    return { ok: false, fieldErrors };
  }
  const { email, firstName, lastName, company, jobTitle, phone } = parsed.data;
  const profile = { firstName, lastName, company, jobTitle, phone };

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
    .values({ tokenHash: hash, email, profile, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) });

  const verifyUrl = new URL("/api/verify", env().APP_URL);
  verifyUrl.searchParams.set("token", token);

  try {
    await sendVerificationEmail(email, profile.firstName, verifyUrl.toString());
  } catch (error) {
    console.error("Failed to send verification email", error);
    return { ok: false, error: "We couldn't send the email. Please try again later." };
  }
  return { ok: true };
}
