import "server-only";
import { createHmac } from "node:crypto";
import { createChallenge, randomInt, verifySolution, type Challenge, type Solution } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/pbkdf2";
import { env } from "@/lib/env";

export type { Challenge, Solution };

/** How long a challenge can be solved and submitted. */
const CHALLENGE_TTL_MS = 10 * 60 * 1000;

// Roughly 0.2–0.5 s in a desktop browser, a little more on phones.
const ALGORITHM = "PBKDF2/SHA-256";
const COST = 1_000;
const COUNTER_MIN = 2_000;
const COUNTER_MAX = 4_000;

/** Signing keys derived from SESSION_SECRET, so no extra secret has to be configured. */
const secret = (purpose: string) =>
  createHmac("sha256", env().SESSION_SECRET).update(`altcha:${purpose}`).digest("hex");

/** Nonces of accepted solutions until their challenge expires, so a solution works only once. */
const used = new Map<string, number>();

/** Creates a signed proof-of-work challenge for the registration form. */
export function createPowChallenge(): Promise<Challenge> {
  return createChallenge({
    algorithm: ALGORITHM,
    cost: COST,
    counter: randomInt(COUNTER_MIN, COUNTER_MAX),
    deriveKey,
    expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    hmacSignatureSecret: secret("signature"),
    hmacKeySignatureSecret: secret("key"),
  });
}

/** True when the solution is valid, unexpired, issued by this server and not used before. */
export async function verifyPow(challenge: Challenge, solution: Solution): Promise<boolean> {
  try {
    const result = await verifySolution({
      challenge,
      solution,
      deriveKey,
      hmacSignatureSecret: secret("signature"),
      hmacKeySignatureSecret: secret("key"),
    });
    if (!result.verified) return false;
  } catch {
    // Malformed input from the client.
    return false;
  }

  const now = Date.now();
  for (const [nonce, expiresAt] of used) if (expiresAt < now) used.delete(nonce);
  const nonce = challenge.parameters.nonce;
  if (used.has(nonce)) return false;
  used.set(nonce, now + CHALLENGE_TTL_MS);
  return true;
}
