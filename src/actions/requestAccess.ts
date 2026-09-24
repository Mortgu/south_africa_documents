"use server";

import { z } from "zod";

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
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please enter a valid email address and accept the privacy notice." };
  }

  // TODO (step 4): rate limit, create verification token, send email via Resend.
  return { ok: true };
}
