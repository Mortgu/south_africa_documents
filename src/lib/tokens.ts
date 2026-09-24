import "server-only";
import { createHash, randomBytes } from "node:crypto";

/** How long a magic link stays valid. */
export const TOKEN_TTL_MS = 30 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Creates a random magic-link token. Only its hash is stored in the database. */
export function createToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}
