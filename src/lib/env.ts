import "server-only";
import { z } from "zod";

const schema = z.object({
  APP_URL: z.url(),
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
  DIGNUM_DATABASE_URL: z.url(),
  RESEND_API_KEY: z.string().startsWith("re_"),
  EMAIL_FROM: z.string().min(3),
  SESSION_SECRET: z.string().min(32),
});

let cached: z.infer<typeof schema> | undefined;

/** Validated server environment. Parsed lazily so `next build` works without secrets. */
export function env() {
  cached ??= schema.parse(process.env);
  return cached;
}
